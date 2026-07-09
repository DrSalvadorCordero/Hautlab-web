import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { treatmentFamilies } from "@/data/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Procedimientos | HAUTLAB + Dr. Salvador Cordero",
  description: "Procedimientos de dermatología clínica y medicina estética en HAUTLAB Mérida."
};

export default function ProcedimientosPage() {
  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Procedimientos HAUTLAB</p>
          <h1 className="max-w-5xl font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
            Tratamientos divididos por intención médica.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
            Cada ruta explica indicación, objetivo, límites y forma de agenda. La decisión final se toma después de valoración.
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-4 md:grid-cols-2">
          {treatmentFamilies.map((family) => {
            const Icon = family.icon;
            return (
              <Link key={family.slug} href={`/tratamientos/${family.slug}`}>
                <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                  <Icon className="mb-8 h-6 w-6 text-champagne" />
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">Ver ruta</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">{family.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{family.summary}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-bone py-16 text-background">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-taupe">Agenda</p>
            <h2 className="font-serif text-4xl tracking-[-.05em]">No sabes cuál elegir: empieza por valoración.</h2>
          </div>
          <Button asChild variant="dark" size="lg">
            <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
