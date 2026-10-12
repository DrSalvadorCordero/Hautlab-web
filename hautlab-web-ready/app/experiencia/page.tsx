import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { ExperiencePathways } from "@/components/experience/experience-pathways";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Tu experiencia | HAUTLAB",
  description: "Organiza tu valoración, continúa tu Plan HAUTLAB y solicita seguimiento después de tu atención. Las citas se confirman con el equipo.",
  alternates: { canonical: `${siteConfig.url}/experiencia` },
};

export default function ExperiencePage() {
  return (
    <main className="border-b border-line bg-background">
      <section className="border-b border-line bg-aurora">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-20 sm:py-24 lg:py-32">
          <p className="text-xs uppercase tracking-[0.25em] text-champagne">HAUTLAB Experience</p>
          <h1 className="mt-6 max-w-4xl font-serif text-[clamp(3.2rem,7vw,6.8rem)] leading-[.91] tracking-[-.06em] text-bone">
            La atención continúa más allá de la consulta.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
            Un punto de entrada para preparar tu visita, retomar tus objetivos y comunicarte con el equipo después de tu atención. Sin pasos innecesarios.
          </p>
          <a className="mt-9 inline-flex items-center gap-2 text-sm text-bone underline decoration-champagne/50 underline-offset-8 transition hover:text-champagne" href="#tu-momento">
            Elegir mi momento <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="tu-momento" className="mx-auto w-[min(1180px,calc(100%-32px))] py-16 sm:py-20 lg:py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-champagne">Tu momento</p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-[-.05em] text-bone sm:text-5xl">
          Empieza donde estás.
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
          Selecciona la etapa que corresponde a tu situación. Esta orientación no sustituye una indicación médica individual ni confirma una cita.
        </p>
        <ExperiencePathways />
      </section>

      <section className="border-t border-line bg-soft">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-12 sm:grid-cols-2 lg:py-16">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-champagne" aria-hidden="true" />
            <div>
              <h2 className="text-base font-medium text-bone">Decisiones médicas, no automáticas.</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Las recomendaciones y los cuidados específicos los establece el profesional tras una valoración. Ningún recorrido digital equivale a un diagnóstico.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-champagne" aria-hidden="true" />
            <div>
              <h2 className="text-base font-medium text-bone">Privacidad por diseño.</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Esta página no solicita fotografías, diagnósticos ni datos de expediente. El acceso a información clínica individual requiere un canal autenticado.</p>
              <Link href="/aviso-de-privacidad" className="mt-3 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">Aviso de privacidad <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
