import Foundation

struct StaffProfile: Codable, Identifiable, Equatable {
    let id: UUID
    let operatorKey: String?
    let displayName: String
    let role: String
    let active: Bool
    var locationTrackingConsentAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, role, active
        case locationTrackingConsentAt = "location_tracking_consent_at"
        case operatorKey = "operator_key"
        case displayName = "display_name"
    }

    var isManager: Bool { role == "manager" }
}

struct StaffSite: Codable, Identifiable, Equatable {
    let id: UUID
    let code: String
    let name: String
    let address: String
    let latitude: Double?
    let longitude: Double?
    let radiusM: Int
    let active: Bool

    enum CodingKeys: String, CodingKey {
        case id, code, name, address, latitude, longitude, active
        case radiusM = "radius_m"
    }

    var isCalibrated: Bool { latitude != nil && longitude != nil }
}

struct StaffShift: Codable, Identifiable, Equatable {
    let id: UUID
    let staffID: UUID
    let siteID: UUID
    let checkInAt: Date
    let checkOutAt: Date?
    let checkInStatus: String
    let checkOutStatus: String?
    let minutesLate: Int
    let minutesOutsideGeofence: Int

    enum CodingKeys: String, CodingKey {
        case id
        case staffID = "staff_id"
        case siteID = "site_id"
        case checkInAt = "check_in_at"
        case checkOutAt = "check_out_at"
        case checkInStatus = "check_in_status"
        case checkOutStatus = "check_out_status"
        case minutesLate = "minutes_late"
        case minutesOutsideGeofence = "minutes_outside_geofence"
    }
}

struct RevenueSnapshot: Codable, Equatable {
    let cash: Double
    let mercadoPago: Double
    let total: Double
}

struct AttendanceSnapshot: Codable, Equatable {
    let scheduledMinutes: Double
    let workedMinutes: Double
    let attendancePct: Double
    let lateMinutes: Double
    let lateCount: Int
    let geofenceExitEvents: Int
    let outsideMinutes: Double
}

struct LeadsSnapshot: Codable, Equatable {
    let assigned: Int
    let responded: Int
    let appointmentRequested: Int
    let appointmentConfirmed: Int
}

struct ScoreBreakdown: Codable, Equatable {
    let attendance: Double
    let response: Double
    let booking: Double
    let cashAccuracy: Double
    let geofence: Double
    let incidentDeduction: Int
}

struct MonthlySnapshot: Codable, Equatable {
    let month: String
    let operatorKey: String
    let displayName: String
    let baseSalary: Double
    let commission: Double
    let bonus: Double
    let totalPay: Double
    let revenue: RevenueSnapshot
    let attendance: AttendanceSnapshot
    let leads: LeadsSnapshot
    let score: Double
    let scoreBreakdown: ScoreBreakdown
}

struct CashPayment: Codable, Identifiable {
    let id: UUID
    let patientName: String
    let amount: Double
    let concept: String
    let revenueOwner: String
    let commissionType: String
    let commissionRate: Double
    let commissionAmount: Double
    let paidAt: Date

    enum CodingKeys: String, CodingKey {
        case id, amount, concept
        case patientName = "patient_name"
        case revenueOwner = "revenue_owner"
        case commissionType = "commission_type"
        case commissionRate = "commission_rate"
        case commissionAmount = "commission_amount"
        case paidAt = "paid_at"
    }
}

struct CashClosure: Codable, Identifiable {
    let id: UUID
    let siteID: UUID
    let closureDate: String
    let expectedCash: Double
    let countedCash: Double
    let difference: Double

    enum CodingKeys: String, CodingKey {
        case id, difference
        case siteID = "site_id"
        case closureDate = "closure_date"
        case expectedCash = "expected_cash"
        case countedCash = "counted_cash"
    }
}
