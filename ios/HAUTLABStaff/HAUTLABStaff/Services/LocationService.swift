import Foundation
import CoreLocation
import Observation

@MainActor
@Observable
final class LocationService: NSObject, CLLocationManagerDelegate {
    enum LocationError: LocalizedError {
        case denied
        case unavailable

        var errorDescription: String? {
            switch self {
            case .denied: return "HAUTLAB necesita permiso de ubicación para validar la asistencia."
            case .unavailable: return "No fue posible obtener una ubicación suficientemente precisa."
            }
        }
    }

    private(set) var authorizationStatus: CLAuthorizationStatus = .notDetermined
    private(set) var lastLocation: CLLocation?
    private(set) var isInsideGeofence: Bool?

    private let manager = CLLocationManager()
    private var authorizationContinuation: CheckedContinuation<Void, Error>?
    private var locationContinuation: CheckedContinuation<CLLocation, Error>?
    private var activeRegion: CLCircularRegion?

    var geofenceEventHandler: ((String, CLLocation) -> Void)?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 25
        authorizationStatus = manager.authorizationStatus
    }

    func requestWhenInUse() {
        manager.requestWhenInUseAuthorization()
    }

    func requestAlwaysForActiveShift() {
        guard manager.authorizationStatus == .authorizedWhenInUse else { return }
        manager.requestAlwaysAuthorization()
    }

    func currentLocation() async throws -> CLLocation {
        try await ensureWhenInUseAuthorization()

        return try await withCheckedThrowingContinuation { continuation in
            locationContinuation = continuation
            manager.requestLocation()
        }
    }

    func startGeofence(site: StaffSite) {
        guard let lat = site.latitude, let lng = site.longitude else { return }
        stopGeofence()
        let region = CLCircularRegion(
            center: CLLocationCoordinate2D(latitude: lat, longitude: lng),
            radius: CLLocationDistance(site.radiusM),
            identifier: "hautlab-site-\(site.id.uuidString)"
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true
        activeRegion = region
        manager.startMonitoring(for: region)
        manager.requestState(for: region)
        manager.startMonitoringSignificantLocationChanges()
    }

    func stopGeofence() {
        if let activeRegion { manager.stopMonitoring(for: activeRegion) }
        activeRegion = nil
        manager.stopMonitoringSignificantLocationChanges()
        isInsideGeofence = nil
    }

    private func ensureWhenInUseAuthorization() async throws {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            return
        case .denied, .restricted:
            throw LocationError.denied
        case .notDetermined:
            try await withCheckedThrowingContinuation { continuation in
                authorizationContinuation = continuation
                manager.requestWhenInUseAuthorization()
            }
        @unknown default:
            throw LocationError.denied
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus

            guard let continuation = self.authorizationContinuation else { return }
            switch manager.authorizationStatus {
            case .authorizedAlways, .authorizedWhenInUse:
                self.authorizationContinuation = nil
                continuation.resume()
            case .denied, .restricted:
                self.authorizationContinuation = nil
                continuation.resume(throwing: LocationError.denied)
            case .notDetermined:
                break
            @unknown default:
                self.authorizationContinuation = nil
                continuation.resume(throwing: LocationError.denied)
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in
            self.lastLocation = location
            if let continuation = self.locationContinuation {
                self.locationContinuation = nil
                if location.horizontalAccuracy >= 0 && location.horizontalAccuracy <= 100 {
                    continuation.resume(returning: location)
                } else {
                    continuation.resume(throwing: LocationError.unavailable)
                }
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            if let continuation = self.locationContinuation {
                self.locationContinuation = nil
                continuation.resume(throwing: error)
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        Task { @MainActor in
            self.isInsideGeofence = true
            do {
                let location = try await self.currentLocation()
                self.geofenceEventHandler?("enter", location)
            } catch { }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        Task { @MainActor in
            self.isInsideGeofence = false
            do {
                let location = try await self.currentLocation()
                self.geofenceEventHandler?("exit", location)
            } catch { }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didDetermineState state: CLRegionState, for region: CLRegion) {
        Task { @MainActor in self.isInsideGeofence = (state == .inside) }
    }
}
