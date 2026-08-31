import Foundation
import Supabase
import CoreLocation

final class SupabaseService: @unchecked Sendable {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        client = SupabaseClient(
            supabaseURL: AppConfig.supabaseURL,
            supabaseKey: AppConfig.supabasePublishableKey
        )
    }

    var hasSession: Bool {
        get async { (try? await client.auth.session) != nil }
    }

    func signIn(email: String, password: String) async throws {
        _ = try await client.auth.signIn(email: email, password: password)
    }

    func signUp(email: String, password: String) async throws {
        _ = try await client.auth.signUp(email: email, password: password)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func fetchProfile() async throws -> StaffProfile? {
        guard let user = try? await client.auth.user() else { return nil }
        let rows: [StaffProfile] = try await client
            .from("hlstaff_profiles")
            .select("id,operator_key,display_name,role,active,location_tracking_consent_at")
            .eq("id", value: user.id.uuidString)
            .limit(1)
            .execute()
            .value
        return rows.first
    }

    func claimProfile(code: String) async throws -> StaffProfile {
        try await client
            .rpc("hlstaff_claim_profile", params: ClaimProfileParams(pCode: code.uppercased()))
            .execute()
            .value
    }

    func recordLocationConsent() async throws -> Date {
        try await client
            .rpc("hlstaff_record_location_consent")
            .execute()
            .value
    }

    func fetchSites() async throws -> [StaffSite] {
        try await client
            .from("hlstaff_sites")
            .select("id,code,name,address,latitude,longitude,radius_m,active")
            .eq("active", value: true)
            .execute()
            .value
    }

    func fetchOpenShift() async throws -> StaffShift? {
        let rows: [StaffShift] = try await client
            .rpc("hlstaff_open_shift")
            .execute()
            .value
        return rows.first
    }

    func checkIn(siteID: UUID, location: CLLocation) async throws -> StaffShift {
        try await client
            .rpc("hlstaff_check_in", params: CheckInParams(
                pSiteID: siteID,
                pLat: location.coordinate.latitude,
                pLng: location.coordinate.longitude,
                pAccuracyM: location.horizontalAccuracy,
                pDeviceID: AppConfig.deviceID
            ))
            .execute()
            .value
    }

    func checkOut(location: CLLocation) async throws -> StaffShift {
        try await client
            .rpc("hlstaff_check_out", params: CheckOutParams(
                pLat: location.coordinate.latitude,
                pLng: location.coordinate.longitude,
                pAccuracyM: location.horizontalAccuracy
            ))
            .execute()
            .value
    }

    func logLocation(shiftID: UUID, eventType: String, location: CLLocation) async throws {
        _ = try await client
            .rpc("hlstaff_log_location", params: LocationEventParams(
                pShiftID: shiftID,
                pEventType: eventType,
                pLat: location.coordinate.latitude,
                pLng: location.coordinate.longitude,
                pAccuracyM: location.horizontalAccuracy
            ))
            .execute()
    }

    func registerCash(
        patientName: String,
        amount: Double,
        concept: String,
        revenueOwner: String,
        commissionType: String,
        phone: String? = nil,
        notes: String? = nil
    ) async throws -> CashPayment {
        try await client
            .rpc("hlstaff_register_cash", params: RegisterCashParams(
                pPatientName: patientName,
                pAmount: amount,
                pConcept: concept,
                pRevenueOwner: revenueOwner,
                pCommissionType: commissionType,
                pPatientPhone: phone,
                pNotes: notes
            ))
            .execute()
            .value
    }

    func closeCash(siteID: UUID, countedCash: Double, notes: String? = nil) async throws -> CashClosure {
        try await client
            .rpc("hlstaff_close_cash", params: CloseCashParams(
                pSiteID: siteID,
                pCountedCash: countedCash,
                pNotes: notes
            ))
            .execute()
            .value
    }

    func monthlySnapshot(month: Date = .now, operatorKey: String = "karen") async throws -> MonthlySnapshot {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = AppConfig.meridaTimeZone
        formatter.dateFormat = "yyyy-MM-01"

        return try await client
            .rpc("hlstaff_monthly_snapshot", params: MonthlySnapshotParams(
                pMonth: formatter.string(from: month),
                pOperatorKey: operatorKey
            ))
            .execute()
            .value
    }

    func calibrateSite(siteID: UUID, location: CLLocation, radiusM: Int) async throws -> StaffSite {
        try await client
            .rpc("hlstaff_calibrate_site", params: CalibrateSiteParams(
                pSiteID: siteID,
                pLat: location.coordinate.latitude,
                pLng: location.coordinate.longitude,
                pRadiusM: radiusM
            ))
            .execute()
            .value
    }
}

private struct ClaimProfileParams: Encodable {
    let pCode: String
    enum CodingKeys: String, CodingKey { case pCode = "p_code" }
}

private struct CheckInParams: Encodable {
    let pSiteID: UUID
    let pLat: Double
    let pLng: Double
    let pAccuracyM: Double
    let pDeviceID: String

    enum CodingKeys: String, CodingKey {
        case pSiteID = "p_site_id"
        case pLat = "p_lat"
        case pLng = "p_lng"
        case pAccuracyM = "p_accuracy_m"
        case pDeviceID = "p_device_id"
    }
}

private struct CheckOutParams: Encodable {
    let pLat: Double
    let pLng: Double
    let pAccuracyM: Double

    enum CodingKeys: String, CodingKey {
        case pLat = "p_lat"
        case pLng = "p_lng"
        case pAccuracyM = "p_accuracy_m"
    }
}

private struct LocationEventParams: Encodable {
    let pShiftID: UUID
    let pEventType: String
    let pLat: Double
    let pLng: Double
    let pAccuracyM: Double

    enum CodingKeys: String, CodingKey {
        case pShiftID = "p_shift_id"
        case pEventType = "p_event_type"
        case pLat = "p_lat"
        case pLng = "p_lng"
        case pAccuracyM = "p_accuracy_m"
    }
}

private struct RegisterCashParams: Encodable {
    let pPatientName: String
    let pAmount: Double
    let pConcept: String
    let pRevenueOwner: String
    let pCommissionType: String
    let pPatientPhone: String?
    let pNotes: String?

    enum CodingKeys: String, CodingKey {
        case pPatientName = "p_patient_name"
        case pAmount = "p_amount"
        case pConcept = "p_concept"
        case pRevenueOwner = "p_revenue_owner"
        case pCommissionType = "p_commission_type"
        case pPatientPhone = "p_patient_phone"
        case pNotes = "p_notes"
    }
}

private struct MonthlySnapshotParams: Encodable {
    let pMonth: String
    let pOperatorKey: String

    enum CodingKeys: String, CodingKey {
        case pMonth = "p_month"
        case pOperatorKey = "p_operator_key"
    }
}

private struct CalibrateSiteParams: Encodable {
    let pSiteID: UUID
    let pLat: Double
    let pLng: Double
    let pRadiusM: Int

    enum CodingKeys: String, CodingKey {
        case pSiteID = "p_site_id"
        case pLat = "p_lat"
        case pLng = "p_lng"
        case pRadiusM = "p_radius_m"
    }
}

private struct CloseCashParams: Encodable {
    let pSiteID: UUID
    let pCountedCash: Double
    let pNotes: String?

    enum CodingKeys: String, CodingKey {
        case pSiteID = "p_site_id"
        case pCountedCash = "p_counted_cash"
        case pNotes = "p_notes"
    }
}
