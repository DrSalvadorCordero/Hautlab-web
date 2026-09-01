import SwiftUI

struct ShiftView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                header
                siteCard
                if store.profile?.locationTrackingConsentAt == nil { consentCard }
                shiftCard
                privacyCard
            }
            .padding()
        }
        .navigationTitle("Turno")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Salir") { Task { await store.signOut() } }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(store.profile?.displayName ?? "Staff").font(.title2.bold())
            Text("Lunes a viernes · 14:00–20:00").foregroundStyle(.secondary)
        }.frame(maxWidth: .infinity, alignment: .leading)
    }

    private var siteCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(store.primarySite?.name ?? "HAUTLAB Mérida", systemImage: "mappin.and.ellipse")
                .font(.headline)
            Text(store.primarySite?.address ?? "San Ramón Norte, Mérida").foregroundStyle(.secondary)
            HStack {
                Circle().fill((store.location.isInsideGeofence ?? false) ? .green : .secondary).frame(width: 9, height: 9)
                Text(store.location.isInsideGeofence == true ? "Dentro de la geocerca" : "Validación al registrar")
                    .font(.footnote)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }

    private var shiftCard: some View {
        VStack(spacing: 16) {
            Image(systemName: store.openShift == nil ? "clock" : "checkmark.circle.fill")
                .font(.system(size: 44))
            Text(store.openShift == nil ? "Sin turno activo" : "Turno en curso")
                .font(.title2.bold())
            if let shift = store.openShift {
                Text("Entrada: \(shift.checkInAt.formatted(date: .omitted, time: .shortened))")
                    .foregroundStyle(.secondary)
                if shift.minutesLate > 0 { Text("Retardo: \(shift.minutesLate) min").foregroundStyle(.orange) }
            }
            Button {
                Task { store.openShift == nil ? await store.checkIn() : await store.checkOut() }
            } label: {
                Label(store.openShift == nil ? "Check-in" : "Check-out", systemImage: store.openShift == nil ? "rectangle.portrait.and.arrow.right" : "rectangle.portrait.and.arrow.forward")
                    .frame(maxWidth: .infinity).padding(.vertical, 10)
            }
            .buttonStyle(.borderedProminent)
            .disabled(store.isBusy || store.profile?.locationTrackingConsentAt == nil)
        }
        .padding(24).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 28))
    }

    private var consentCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Activar ubicación laboral", systemImage: "location.circle")
                .font(.headline)
            Text("Se usa únicamente para validar presencia en HAUTLAB durante el turno. El monitoreo se detiene al hacer check-out.")
                .font(.footnote)
                .foregroundStyle(.secondary)
            Button("Aceptar y activar") { Task { await store.acceptLocationTracking() } }
                .buttonStyle(.borderedProminent)
                .disabled(store.isBusy)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }

    private var privacyCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Ubicación laboral", systemImage: "location.shield")
                .font(.headline)
            Text("La app valida la sede al iniciar y finalizar el turno y mantiene una geocerca durante la jornada. Al hacer check-out se detiene el monitoreo de HAUTLAB.")
                .font(.footnote).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }
}
