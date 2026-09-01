import SwiftUI

struct ManagerView: View {
    @Environment(AppStore.self) private var store
    @State private var radius = 100.0

    var body: some View {
        Form {
            Section("Sede Mérida") {
                if let site = store.primarySite {
                    Text(site.address)
                    Label(site.isCalibrated ? "Geocerca calibrada" : "Pendiente de calibración", systemImage: site.isCalibrated ? "checkmark.seal.fill" : "exclamationmark.triangle")
                    Slider(value: $radius, in: 50...250, step: 10) { Text("Radio") }
                    Text("Radio: \(Int(radius)) m").font(.footnote).foregroundStyle(.secondary)
                    Button("Calibrar con mi ubicación actual") { Task { await store.calibratePrimarySite(radiusM: Int(radius)) } }
                        .disabled(store.isBusy)
                }
            }
            if let snapshot = store.monthlySnapshot {
                Section("Karen · mes actual") {
                    metricRow("Ingresos", snapshot.revenue.total.formatted(.currency(code: "MXN")))
                    metricRow("Comisión", snapshot.commission.formatted(.currency(code: "MXN")))
                    metricRow("Bono", snapshot.bonus.formatted(.currency(code: "MXN")))
                    metricRow("Total estimado", snapshot.totalPay.formatted(.currency(code: "MXN")))
                    metricRow("Score", snapshot.score.formatted(.number.precision(.fractionLength(1))))
                }
            }
            Section("Privacidad") {
                Text("La geocerca se activa durante el turno. La app no necesita conservar una ruta histórica fuera de la jornada.")
                    .font(.footnote).foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Administrar")
    }

    private func metricRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value).foregroundStyle(.secondary)
        }
    }
}
