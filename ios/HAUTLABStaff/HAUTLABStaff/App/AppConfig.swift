import Foundation

enum AppConfig {
    static let supabaseURL = URL(string: "https://mwnmopsybpvjnfnepadv.supabase.co")!
    static let supabasePublishableKey = "sb_publishable_sTuEHrGa3oS-Gno9h7ArnQ_o-W6sIyp"
    static let meridaTimeZone = TimeZone(identifier: "America/Merida")!

    static var deviceID: String {
        let key = "hautlab.staff.device-id"
        if let existing = UserDefaults.standard.string(forKey: key) { return existing }
        let value = UUID().uuidString
        UserDefaults.standard.set(value, forKey: key)
        return value
    }
}
