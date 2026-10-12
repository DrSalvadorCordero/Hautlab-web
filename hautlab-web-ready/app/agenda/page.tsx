import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AgendaAvailability } from "@/components/experience/agenda-availability";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Horarios para valoración | HAUTLAB",
  description: "Consulta horarios orientativos de la agenda médica en Mérida y solicita la confirmación de tu cita con el equipo HAUTLAB.",
  alternates: { canonical: `${siteConfig.url}/agenda` },
};

export default function AgendaPage() {
  return (
    <main className="border-b border-line bg-background">
      <section className="border-b border-line bg-aurora">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Agenda privada</p>
          <h1 className="mt-5 max-w-3xl font-serif text-[clamp(3rem,6vw,5.9rem)] leading-[.95] tracking-[-.06em] text-bone">
            Encuentra el momento para tu valoración.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            Explora propuestas de horario consultadas desde nuestra agenda médica. Tu selección inicia una solicitud; la cita existe únicamente cuando el equipo confirma el registro definitivo.
          </p>
        </div>
      </section>

      <section className="mx-auto w-[min(1180px,calc(100%-32px))] py-14 sm:py-20">
        <AgendaAvailability />
        <div className="mt-10 flex items-start gap-3 rounded-[1.5rem] border border-line p-6">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-champagne" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-bone">Antes de realizar un pago</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Solicita la confirmación de fecha y hora. El pago no reserva automáticamente un horario. Si el equipo te indica un anticipo, utiliza exclusivamente el enlace de pago autorizado.
            </p>
            <Link href="/experiencia" className="mt-3 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
              Conoce el proceso HAUTLAB <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
