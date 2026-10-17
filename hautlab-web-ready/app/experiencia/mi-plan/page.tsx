import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { CarePlanDemo } from "@/components/experience/care-plan-demo";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Care Plan | HAUTLAB Experience",
  description: "Demostración interactiva de un plan de seguimiento dermatológico por fases. Sin datos personales ni expediente clínico.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
  alternates: { canonical: `${siteConfig.url}/experiencia/mi-plan` },
};

export default function CarePlanPage() {
  return (
    <main id="contenido-principal" className="min-h-[80svh] border-b border-line bg-background">
      <div className="mx-auto w-[min(1080px,calc(100%-32px))] pb-20 pt-12 sm:pt-20">
        <Link
          href="/experiencia"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Regresar a HAUTLAB Experience
        </Link>

        <header className="mb-10 mt-12 max-w-3xl sm:mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-champagne">
            HAUTLAB Experience / Care Plan
          </p>
          <h1 className="mt-5 font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.93] tracking-[-.06em] text-bone">
            Tu tratamiento. Una fase a la vez.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            Consulta el orden de los cuidados, revisa qué sigue y reconoce los cambios
            que necesitan atención. Diseñado para utilizarse desde el celular.
          </p>
        </header>

        <CarePlanDemo />

        <aside className="mt-8 grid gap-5 rounded-[1.5rem] border border-line bg-white/[0.025] p-6 sm:grid-cols-2 sm:p-8">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-champagne" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-bone">Demostración sin expediente</p>
              <p className="mt-2 text-xs leading-6 text-muted">
                El contenido es un ejemplo educativo, no una receta vigente ni un plan
                asignado a un paciente. Ninguna acción modifica tratamientos clínicos.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-champagne" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-bone">Privacidad por diseño</p>
              <p className="mt-2 text-xs leading-6 text-muted">
                Esta versión no solicita nombre, fotografías, diagnóstico personal ni
                identificación. El seguimiento individual requerirá acceso autenticado.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
