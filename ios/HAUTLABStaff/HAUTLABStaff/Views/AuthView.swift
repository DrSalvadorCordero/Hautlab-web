import SwiftUI

struct AuthView: View {
    @Environment(AppStore.self) private var store
    @State private var email = ""
    @State private var password = ""
    @State private var isCreating = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Correo", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    SecureField("Contraseña", text: $password)
                } header: {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("HAUTLAB").font(.caption).tracking(4)
                        Text("Staff").font(.largeTitle.bold())
                    }.padding(.vertical)
                }

                Button(isCreating ? "Crear cuenta" : "Iniciar sesión") {
                    Task {
                        if isCreating { await store.signUp(email: email, password: password) }
                        else { await store.signIn(email: email, password: password) }
                    }
                }
                .disabled(email.isEmpty || password.count < 8 || store.isBusy)

                Button(isCreating ? "Ya tengo cuenta" : "Crear cuenta de staff") { isCreating.toggle() }
                    .foregroundStyle(.secondary)
            }
            .navigationTitle("Acceso interno")
        }
    }
}

struct ClaimView: View {
    @Environment(AppStore.self) private var store
    @State private var code = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Código de alta") {
                    TextField("Ej. KR-XXXXXXXX", text: $code)
                        .textInputAutocapitalization(.characters)
                    Text("Este código se usa una sola vez para vincular la cuenta con su rol en HAUTLAB.")
                        .font(.footnote).foregroundStyle(.secondary)
                }
                Button("Activar cuenta") { Task { await store.claim(code: code) } }
                    .disabled(code.count < 6 || store.isBusy)
                Button("Cerrar sesión", role: .destructive) { Task { await store.signOut() } }
            }
            .navigationTitle("Activar perfil")
        }
    }
}
