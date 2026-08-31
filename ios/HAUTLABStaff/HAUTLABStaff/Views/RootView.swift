import SwiftUI

struct RootView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        Group {
            switch store.phase {
            case .loading:
                ProgressView("Preparando HAUTLAB…")
            case .signedOut:
                AuthView()
            case .claimRequired:
                ClaimView()
            case .ready:
                MainTabs()
            }
        }
        .preferredColorScheme(.dark)
        .alert("HAUTLAB", isPresented: Binding(get: { store.errorMessage != nil }, set: { if !$0 { store.errorMessage = nil } })) {
            Button("Aceptar", role: .cancel) { store.errorMessage = nil }
        } message: {
            Text(store.errorMessage ?? "")
        }
    }
}

private struct MainTabs: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        TabView {
            NavigationStack { ShiftView() }
                .tabItem { Label("Turno", systemImage: "clock.badge.checkmark") }
            NavigationStack { CashPaymentView() }
                .tabItem { Label("Efectivo", systemImage: "banknote") }
            NavigationStack { PerformanceView() }
                .tabItem { Label("Resultados", systemImage: "chart.line.uptrend.xyaxis") }
            if store.profile?.isManager == true {
                NavigationStack { ManagerView() }
                    .tabItem { Label("Administrar", systemImage: "slider.horizontal.3") }
            }
        }
        .tint(.primary)
    }
}
