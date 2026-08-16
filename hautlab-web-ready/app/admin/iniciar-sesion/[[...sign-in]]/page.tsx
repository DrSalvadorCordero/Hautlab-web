import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export default function AdminSignInPage() {
  const configured = isClerkConfigured();

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0a09] px-6 py-12 text-bone">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-champagne">HAUTLAB · Acceso interno</p>
          <h1 className="mt-5 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
            Operación privada, separada del sitio público.
          </h1>
          <p className="mt-6 max-w-xl leading-7 text-muted">
            Este espacio está reservado para el Dr. Salvador Cordero y personal autorizado. No contiene un portal clínico para pacientes.
          </p>
          <Link href="/" className="mt-8 inline-flex text-sm text-muted transition hover:text-bone">
            ← Volver a hautlabmx.com
          </Link>
        </section>

        {configured ? (
          <SignIn
            path="/admin/iniciar-sesion"
            routing="path"
            fallbackRedirectUrl="/admin/whatsapp"
            appearance={{ elements: { rootBox: "w-full", cardBox: "shadow-calm" } }}
          />
        ) : (
          <section className="w-full max-w-md rounded-[2rem] border border-line bg-white/[0.035] p-8 shadow-calm">
            <p className="text-sm font-medium">Configuración pendiente</p>
            <p className="mt-4 text-sm leading-6 text-muted">
              Las pantallas están listas. Falta conectar las claves del proveedor de identidad en Vercel antes de habilitar el acceso.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
