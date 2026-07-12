import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { treatmentFamilies } from "@/data/site";
import { extraTreatmentsV2 } from "@/data/treatments-v2-extra";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Áreas de atención y procedimientos | HAUTLAB",
  description: "Explora diseño facial, piel y textura, condiciones de piel y procedimientos focales en HAUTLAB Mérida.",
  alternates: { canonical: `${siteConfig.url}/procedimientos` }
};

const allTreatments = { ...treatmentsV2, ...extraTreatmentsV2 };

const areaOrder = ["Diseño facial", "Piel y textura", "Condiciones de piel", "Procedimientos focales"] as const;

const areaIntro: Record<(typeof areaOrder)[number], string> = {
  "Diseño facial": "Proporción, soporte y movimiento sin convertir el rostro en una suma de productos.",
  "Piel y textura": "Calidad cutánea, pigmento, cicatrices y soporte mediante planes progresivos.",
  "Condiciones de piel": "Valoración, diagnóstico y seguimiento antes de intensificar tratamientos.",
  "Procedimientos focales": "Lesiones específicas evaluadas antes de elegir retiro, estudio o seguimiento."
};

const areaIds: Record<(typeof areaOrder)[number], string> = {
  "Diseño facial": "diseno-facial",
  "Piel y textura": "piel-y-textura",
  "Condiciones de piel": "condiciones-de-piel",
  "Procedimientos focales": "procedimientos-focales"
};

export default function ProcedimientosPage() {
  const groupedProcedures = areaOrder.map((area) => ({
    area,
    items: Object.entries(allTreatments)
      .filter(([, item]) => item.category.label === area)
      .map(([slug, item]) => ({ slug, ...item }))
      .sort((a, b) => a.title.localeCompare(b.title, "es"))
  }));

  return (
    <main>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Áreas y procedimientos" }]} />

      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Biblioteca HAUTLAB</p>
          <h1 className="max-w-5xl font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
            Información clara antes de decidir qué hacer.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
            Cada página explica qué es, cuándo puede estar indicada, cuándo no se fuerza y cómo se integra dentro de un plan individual.
          </p>

          <nav className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2" aria-label="Saltar a un área de atención">
            {groupedProcedures.map(({ area, items }) => (
              <a
                key={area}
                href={`#${areaIds[area]}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-muted transition hover:border-champagne/40 hover:text-bone focus:outline-none focus:ring-2 focus:ring-champagne"
              >
                {area}
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-quiet">{items.length}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {groupedProcedures.map(({ area, items }, areaIndex) => (
        <section
          key={area}
          id={areaIds[area]}
          className={`${areaIndex % 2 === 0 ? "border-b border-line bg-background py-20 lg:py-28" : "border-b border-line bg-soft/30 py-20 lg:py-28"} scroll-mt-32`}
        >
          <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
            <div className="mb-10 grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Área {String(areaIndex + 1).padStart(2, "0")}</p>
                <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.7rem)] leading-[.95] tracking-[-.055em] text-bone">
                  {area}
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-muted">{areaIntro[area]}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((procedure) => (
                <Link key={procedure.slug} href={`/procedimientos/${procedure.slug}`} className="group overflow-hidden rounded-[2rem] border border-line bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-champagne/40 focus:outline-none focus:ring-2 focus:ring-champagne">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={procedure.image} alt={procedure.imageAlt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-champagne">{procedure.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">{procedure.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{procedure.summary}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">
                      Entender el enfoque <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Explorar por área</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.7rem)] leading-[.95] tracking-[-.055em] text-bone">
              Cuatro rutas. Un mismo criterio.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {treatmentFamilies.map((family) => {
              const Icon = family.icon;
              return (
                <Link key={family.slug} href={`/tratamientos/${family.slug}`} className="focus:outline-none focus:ring-2 focus:ring-champagne rounded-[2rem]">
                  <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                    <Icon className="mb-8 h-6 w-6 text-champagne" />
                    <p className="text-xs uppercase tracking-[0.18em] text-champagne">Área de atención</p>
                    <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">{family.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{family.summary}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-bone py-16 text-background">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-taupe">Agenda</p>
            <h2 className="font-serif text-4xl tracking-[-.05em]">Si no sabes cuál elegir, empieza por una valoración.</h2>
          </div>
          <Button asChild variant="dark" size="lg">
            <a href={buildWhatsAppLink("Hola, quiero agendar una valoración en HAUTLAB y no sé qué opción es la adecuada para mí.")} target="_blank" rel="noreferrer" data-event="whatsapp_procedure_library">
              WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
