import SwiftUI

struct PerformanceView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        ScrollView {
            if let snapshot = store.monthlySnapshot {
                VStack(spacing: 16) {
                    metric("Score", "\(snapshot.score, specifier: "%.1f") / 100")
                    HStack(spacing: 12) {
                        metric("Base", money(snapshot.baseSalary))
                        metric("Comisión", money(snapshot.commission))
                    }
                    HStack(spacing: 12) {
                        metric("Bono", money(snapshot.bonus))
                        metric("Total", money(snapshot.totalPay))
                    }
                    metric("Ingresos atribuibles", money(snapshot.revenue.total))
                    metric("Asistencia", "\(snapshot.attendance.attendancePct, specifier: "%.1f")%")
                    metric("Fuera de geocerca", "\(Int(snapshot.attendance.outsideMinutes)) min")
                    metric("Leads atendidos", "\(snapshot.leads.responded) / \(snapshot.leads.assigned)")
                    metric("Citas confirmadas", "\(snapshot.leads.appointmentConfirmed)")
                }.padding()
            } else {
                ContentUnavailableView("Sin métricas todavía", systemImage: "chart.line.uptrend.xyaxis")
            }
        }
        .navigationTitle("Resultados")
        .refreshable { await store.refreshSnapshot() }
    }

    private func metric(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased()).font(.caption).tracking(1.5).foregroundStyle(.secondary)
            Text(value).font(.title2.bold())
        }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }

    private func money(_ value: Double) -> String { value.formatted(.currency(code: "MXN")) }
}
