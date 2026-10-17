import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default function PrivateCareRegistration() {
  return (
    <main id="contenido-principal" className="grid min-h-[75svh] place-items-center bg-background px-5 py-16 text-bone">
      <section className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB · PRIVATE CARE</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-.05em]">Crea tu acceso personal.</h1>
        <p className="mb-8 mt-4 text-sm leading-7 text-muted">
          Regístrate con el correo electrónico que prefieras y verifica que te pertenece.
          Después podrás solicitar acceso a tu plan; tu médico debe confirmar la solicitud.
        </p>
        {isClerkConfigured() ? (
          <SignUp
            routing="path"
            path="/private-care/registro"
            signInUrl="/private-care/iniciar-sesion"
            fallbackRedirectUrl="/private-care/solicitar"
            appearance={{elements:{rootBox:"mx-auto w-full",cardBox:"w-full shadow-calm"}}}
          />
        ) : (
          <p role="alert" className="rounded-2xl border border-line p-6 text-sm text-muted">
            El registro está temporalmente deshabilitado. Contacta a HAUTLAB.
          </p>
        )}
        <Link href="/private-care/iniciar-sesion" className="mt-8 inline-block text-sm text-muted underline underline-offset-4 hover:text-bone">
          ¿Ya tienes cuenta? Inicia sesión.
        </Link>
      </section>
    </main>
  );
}
