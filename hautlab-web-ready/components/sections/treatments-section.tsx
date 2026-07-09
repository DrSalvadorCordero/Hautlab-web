import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { treatmentFamilies } from "@/data/site";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { whatsappForTreatment } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";

export function TreatmentsSection() {
  return (
    <section className="border-b border-line bg-soft/30 py-20 lg:py-28" id="tratamientos">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <Reveal>
          <div className="mb-12 grid gap-7 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-champagne">Familias de tratamientos</p>
              <h2 className="font-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[.95] tracking-[-.055em] text-bone">
                Todo dividido por intención médica.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-muted">
              Las cuatro familias ordenan el sitio y la consulta. Cada ruta incluye enfoque HAUTLAB, qué trata, rangos de inversión y CTA directo a WhatsApp.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {treatmentFamilies.map((family, index) => {
            const Icon = family.icon;
            return (
              <Reveal key={family.slug} delay={index * 0.05}>
                <Card className="group h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-champagne/40">
                  <div className="mb-7 flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-line bg-background/50 text-champagne">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-quiet">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-2xl font-medium tracking-[-0.04em] text-bone">{family.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{family.summary}</p>
                  <div className="mt-6 rounded-3xl border border-line bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-champagne">Rango de inversión</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{family.investment}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tratamientos/${family.slug}`}>
                        Ver enfoque <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a href={whatsappForTreatment(family.title)} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
