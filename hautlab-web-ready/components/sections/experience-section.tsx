import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ExperienceSection() {
  return (
    <section className="border-b border-line bg-soft py-20 lg:py-28">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] items-end gap-9 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB Experience</p>
          <h2 className="mt-5 max-w-2xl font-serif text-[clamp(3rem,5vw,5.3rem)] leading-[.95] tracking-[-.06em] text-bone">
            La atención no termina al salir.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted">
            Prepara tu valoración, retoma tu plan y encuentra el camino adecuado para solicitar seguimiento. Un proceso sencillo, con criterio médico en cada etapa.
          </p>
        </div>
        <Link href="/experiencia" className="group flex items-center justify-between gap-5 rounded-[1.75rem] border border-line bg-background px-7 py-7 text-bone transition hover:border-champagne/45">
          <span className="text-lg">Explorar mi experiencia</span>
          <ArrowUpRight className="h-6 w-6 shrink-0 text-champagne transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
