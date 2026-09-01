import Foundation
import Observation
import CoreLocation

@MainActor
@Observable
final class AppStore {
    enum Phase { case loading, signedOut, claimRequired, ready }

    var phase: Phase = .loading
    var profile: StaffProfile?
    var sites: [StaffSite] = []
    var openShift: StaffShift?
    var monthlySnapshot: MonthlySnapshot?
    var errorMessage: String?
    var isBusy = false

    let location = LocationService()
    private let api = SupabaseService.shared

    init() {
        location.geofenceEventHandler = { [weak self] event, location in
            guard let self else { return }
            Task { @MainActor in await self.handleGeofenceEvent(event, location: location) }
        }
    }

    var primarySite: StaffSite? { sites.first(where: { $0.code == "merida" }) ?? sites.first }

    func bootstrap() async {
        phase = .loading
        errorMessage = nil
        guard await api.hasSession else { phase = .signedOut; return }
        do {
            if let profile = try await api.fetchProfile() {
                self.profile = profile
                try await refreshOperationalData()
                phase = .ready
            } else {
                phase = .claimRequired
            }
        } catch {
            errorMessage = error.localizedDescription
            phase = .signedOut
        }
    }

    func signIn(email: String, password: String) async {
        await runBusy {
            try await api.signIn(email: email, password: password)
            await bootstrap()
        }
    }

    func signUp(email: String, password: String) async {
        await runBusy {
            try await api.signUp(email: email, password: password)
            if await api.hasSession { phase = .claimRequired }
            else { errorMessage = "Cuenta creada. Confirma el correo y después inicia sesión." }
        }
    }

    func claim(code: String) async {
        await runBusy {
            profile = try await api.claimProfile(code: code)
            try await refreshOperationalData()
            phase = .ready
        }
    }

    func signOut() async {
        do { try await api.signOut() } catch { }
        location.stopGeofence()
        profile = nil
        openShift = nil
        monthlySnapshot = nil
        phase = .signedOut
    }

    func refreshOperationalData() async throws {
        async let fetchedSites = api.fetchSites()
        async let fetchedShift = api.fetchOpenShift()
        sites = try await fetchedSites
        openShift = try await fetchedShift
        if let shift = openShift, let site = sites.first(where: { $0.id == shift.siteID }) {
            location.startGeofence(site: site)
            location.requestAlwaysForActiveShift()
        } else {
            location.stopGeofence()
        }
        if profile?.isManager == true || profile?.operatorKey == "karen" {
            monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
        }
    }

    func acceptLocationTracking() async {
        await runBusy {
            let consentAt = try await api.recordLocationConsent()
            profile?.locationTrackingConsentAt = consentAt
            location.requestWhenInUse()
        }
    }

    func checkIn() async {
        guard profile?.locationTrackingConsentAt != nil else {
            errorMessage = "Primero activa la ubicación laboral para validar la asistencia."
            return
        }
        guard let site = primarySite else { errorMessage = "No hay sede configurada."; return }
        guard site.isCalibrated else { errorMessage = "La sede debe calibrarse una sola vez desde la cuenta del administrador."; return }
        await runBusy {
            let current = try await location.currentLocation()
            openShift = try await api.checkIn(siteID: site.id, location: current)
            location.requestAlwaysForActiveShift()
            location.startGeofence(site: site)
            monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
        }
    }

    func checkOut() async {
        await runBusy {
            let current = try await location.currentLocation()
            _ = try await api.checkOut(location: current)
            openShift = nil
            location.stopGeofence()
            monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
        }
    }

    func registerCash(patientName: String, amount: Double, concept: String, revenueOwner: String, commissionType: String) async -> CashPayment? {
        var result: CashPayment?
        await runBusy {
            result = try await api.registerCash(patientName: patientName, amount: amount, concept: concept, revenueOwner: revenueOwner, commissionType: commissionType)
            monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
        }
        return result
    }

    func closeCash(countedCash: Double) async -> CashClosure? {
        guard let site = primarySite else { errorMessage = "No hay sede configurada."; return nil }
        var result: CashClosure?
        await runBusy {
            result = try await api.closeCash(siteID: site.id, countedCash: countedCash)
            monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
        }
        return result
    }

    func calibratePrimarySite(radiusM: Int = 100) async {
        guard profile?.isManager == true, let site = primarySite else { return }
        await runBusy {
            let current = try await location.currentLocation()
            let updated = try await api.calibrateSite(siteID: site.id, location: current, radiusM: radiusM)
            if let index = sites.firstIndex(where: { $0.id == updated.id }) { sites[index] = updated }
        }
    }

    func refreshSnapshot() async {
        await runBusy { monthlySnapshot = try await api.monthlySnapshot(operatorKey: "karen") }
    }

    private func handleGeofenceEvent(_ event: String, location: CLLocation) async {
        guard let shift = openShift else { return }
        try? await api.logLocation(shiftID: shift.id, eventType: event, location: location)
        monthlySnapshot = try? await api.monthlySnapshot(operatorKey: "karen")
    }

    private func runBusy(_ operation: () async throws -> Void) async {
        isBusy = true
        errorMessage = nil
        defer { isBusy = false }
        do { try await operation() }
        catch { errorMessage = friendly(error) }
    }

    private func friendly(_ error: Error) -> String {
        let raw = error.localizedDescription
        if raw.contains("OUTSIDE_GEOFENCE") { return "Debes estar físicamente en HAUTLAB para iniciar el turno." }
        if raw.contains("SITE_NOT_CALIBRATED") { return "La sede todavía no está calibrada." }
        if raw.contains("OPEN_SHIFT_EXISTS") { return "Ya tienes un turno abierto." }
        if raw.contains("INVALID_OR_EXPIRED_INVITE") { return "El código de alta no es válido o ya expiró." }
        return raw
    }
}
