import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export default function AdminSignInPage() {
  const configured = isClerkConfigured();

  return (
    <main className="min-h-screen bg-[#0b0a09] px-5 py-8 text-bone sm:grid sm:place-items-center sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-7 w-full text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-champagne">HAUTLAB · Acceso interno</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Iniciar sesión</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Acceso exclusivo para personal autorizado.</p>
        </div>

        {configured ? (
          <SignIn
            fallback={
              <div className="w-full rounded-[2rem] border border-line bg-white/[0.035] p-8 text-center shadow-calm">
                <p className="text-sm text-muted">Cargando acceso seguro…</p>
              </div>
            }
            fallbackRedirectUrl="/admin/whatsapp"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-calm"
              }
            }}
          />
        ) : (
          <section className="w-full rounded-[2rem] border border-line bg-white/[0.035] p-8 shadow-calm">
            <p className="text-sm font-medium">Configuración pendiente</p>
            <p className="mt-4 text-sm leading-6 text-muted">El proveedor de identidad no está disponible en este momento.</p>
          </section>
        )}

        <Link href="/" className="mt-7 text-sm text-muted transition hover:text-bone">← Volver a hautlabmx.com</Link>
      </div>
    </main>
  );
}
