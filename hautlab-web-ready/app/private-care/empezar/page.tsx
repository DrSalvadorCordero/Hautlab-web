import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Activa tu acceso | HAUTLAB Private Care",
  description: "Un acceso personal a tu seguimiento de HAUTLAB, disponible después de una verificación médica.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function StartPrivateCare() {
  const configured = isClerkConfigured();
  const signedIn = configured ? Boolean((await auth()).userId) : false;
  const next = signedIn ? "/private-care/solicitar" : "/private-care/registro";

  return (
    <main id="contenido-principal" className="min-h-[75svh] bg-background px-4 py-12 text-bone sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs uppercase tracking-[.25em] text-champagne">
          HAUTLAB / PRIVATE CARE
        </Link>
        <p className="mt-12 text-xs uppercase tracking-[.2em] text-muted">
          Acceso exclusivo para pacientes
        </p>
        <h1 className="mt-5 max-w-2xl font-serif text-[clamp(3rem,7vw,5.6rem)] leading-[.95] tracking-[-.055em]">
          Tu cuidado, en un solo lugar.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-muted">
          Activa tu cuenta desde el celular. Tú eliges el correo electrónico
          y HAUTLAB verificará tu identidad antes de abrir tus indicaciones médicas.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          {configured ? (
            <Link href={next} className="inline-flex min-h-14 items-center gap-3 rounded-full bg-champagne px-7 py-4 text-sm font-medium text-background transition hover:opacity-90">
              {signedIn ? "Continuar con mi cuenta" : "Crear mi acceso"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <p role="alert" className="rounded-xl border border-line px-5 py-4 text-sm text-muted">
              El registro no está disponible temporalmente. Solicita apoyo al equipo de HAUTLAB.
            </p>
          )}
          {configured && !signedIn && (
            <Link href="/private-care/iniciar-sesion" className="text-sm text-muted underline underline-offset-4 hover:text-bone">
              Ya tengo cuenta
            </Link>
          )}
        </div>

        <section className="mt-14 grid gap-3 sm:grid-cols-3" aria-label="Pasos de acceso">
          {[
            { n: "01", title: "Regístrate", desc: "Utiliza tu propio correo y verifica tu dirección." },
            { n: "02", title: "Solicita acceso", desc: "Confirma tu nombre y envía la solicitud." },
            { n: "03", title: "Consulta tu plan", desc: "Tu médico valida tu identidad y publica tus indicaciones." },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl border border-line bg-white/[.025] p-6">
              <p className="text-xs tracking-[.2em] text-champagne">{step.n}</p>
              <h2 className="mt-4 text-sm font-medium text-bone">{step.title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted">{step.desc}</p>
            </div>
          ))}
        </section>

        <aside className="mt-7 flex items-start gap-3 rounded-2xl border border-line p-5">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-champagne" aria-hidden="true" />
          <p className="text-xs leading-6 text-muted">
            Crear una cuenta no da acceso automático a un expediente.
            Solo el paciente identificado puede ver sus indicaciones aprobadas.
          </p>
        </aside>

        <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4" /> Acceso personal</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Verificación médica</span>
          <Link href="/aviso-de-privacidad" className="underline underline-offset-4 hover:text-bone">Aviso de privacidad</Link>
        </div>
      </div>
    </main>
  );
}
