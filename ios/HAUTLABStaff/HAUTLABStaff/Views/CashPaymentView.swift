import SwiftUI

struct CashPaymentView: View {
    @Environment(AppStore.self) private var store
    @State private var patientName = ""
    @State private var amount = ""
    @State private var concept = ""
    @State private var revenueOwner = "karen"
    @State private var commissionType = "standard"
    @State private var confirmation: String?
    @State private var countedCash = ""
    @State private var closureConfirmation: String?

    var body: some View {
        Form {
            Section("Pago en efectivo") {
                TextField("Paciente", text: $patientName)
                TextField("Monto", text: $amount).keyboardType(.decimalPad)
                TextField("Concepto", text: $concept)
            }
            Section("Atribución") {
                Picker("Ingreso generado por", selection: $revenueOwner) {
                    Text("Karen").tag("karen")
                    Text("Dr. Salvador").tag("doctor")
                    Text("Orgánico HAUTLAB").tag("organic")
                    Text("Referido").tag("referral")
                }
                Picker("Comisión", selection: $commissionType) {
                    Text("Estándar 2%").tag("standard")
                    Text("Reactivación 1%").tag("reactivation")
                    Text("No comisionable").tag("none")
                }
                .disabled(revenueOwner != "karen")
            }
            Section {
                Button("Registrar efectivo") { Task { await submit() } }
                    .disabled(!isValid || store.isBusy)
            }
            if let confirmation {
                Section { Text(confirmation).foregroundStyle(.green) }
            }
            Section("Cierre de caja") {
                TextField("Efectivo contado", text: $countedCash).keyboardType(.decimalPad)
                Button("Cerrar caja de hoy") { Task { await closeCash() } }
                    .disabled((Double(countedCash.replacingOccurrences(of: ",", with: ".")) ?? -1) < 0 || store.isBusy)
                if let closureConfirmation { Text(closureConfirmation).foregroundStyle(.secondary) }
            }
        }
        .navigationTitle("Efectivo")
        .onChange(of: revenueOwner) { _, value in if value != "karen" { commissionType = "none" } }
    }

    private var isValid: Bool {
        !patientName.trimmingCharacters(in: .whitespaces).isEmpty &&
        (Double(amount.replacingOccurrences(of: ",", with: ".")) ?? 0) > 0 &&
        !concept.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func closeCash() async {
        guard let value = Double(countedCash.replacingOccurrences(of: ",", with: ".")) else { return }
        if let closure = await store.closeCash(countedCash: value) {
            closureConfirmation = "Esperado \(closure.expectedCash.formatted(.currency(code: \"MXN\"))) · diferencia \(closure.difference.formatted(.currency(code: \"MXN\")))"
            countedCash = ""
        }
    }

    private func submit() async {
        guard let value = Double(amount.replacingOccurrences(of: ",", with: ".")) else { return }
        if let payment = await store.registerCash(patientName: patientName, amount: value, concept: concept, revenueOwner: revenueOwner, commissionType: commissionType) {
            confirmation = "Registrado · $\(payment.amount, specifier: \"%.2f\") · comisión $\(payment.commissionAmount, specifier: \"%.2f\")"
            patientName = ""; amount = ""; concept = ""
        }
    }
}
