import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export default function PrivateCareSignIn() {
  return (
    <main className="grid min-h-[80svh] place-items-center bg-background px-5 py-16 text-bone">
      <section className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB · Private Care</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-.04em]">Tu espacio privado.</h1>
        <p className="mb-8 mt-4 text-sm leading-7 text-muted">
          Inicia sesión con el correo que registraste. Si todavía no tienes cuenta, puedes crear una y solicitar autorización a HAUTLAB.
        </p>
        {isClerkConfigured() ? (
          <SignIn
            routing="path"
            path="/private-care/iniciar-sesion"
            fallbackRedirectUrl="/private-care"
            appearance={{elements:{rootBox:"mx-auto w-full",cardBox:"w-full shadow-calm"}}}
          />
        ) : <p role="alert" className="rounded-2xl border border-line p-6 text-sm text-muted">El acceso privado está temporalmente deshabilitado.</p>}
        <Link href="/private-care/registro" className="mt-7 inline-block rounded-full border border-line px-5 py-3 text-sm text-bone hover:border-champagne">Crear mi cuenta</Link>
        <Link href="/" className="mt-8 inline-block text-sm text-muted hover:text-bone">Volver a HAUTLAB</Link>
      </section>
    </main>
  );
}
