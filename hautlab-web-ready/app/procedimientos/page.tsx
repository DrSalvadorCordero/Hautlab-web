import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { treatmentFamilies } from "@/data/site";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Áreas de atención y procedimientos | HAUTLAB",
  description: "Explora diseño facial, piel y textura, condiciones de piel y procedimientos focales en HAUTLAB Mérida.",
  alternates: { canonical: `${siteConfig.url}/procedimientos` }
};

const procedureOrder = ["rinomodelacion", "toxina-botulinica", "labios", "acne", "melasma", "verrugas"];

export default function ProcedimientosPage() {
  const featuredProcedures = procedureOrder.map((slug) => ({ slug, ...treatmentsV2[slug] }));

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
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Páginas desarrolladas</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.7rem)] leading-[.95] tracking-[-.055em] text-bone">
                Procedimientos y condiciones destacados.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted">
              La valoración define si conviene tratar, esperar, priorizar otra zona o no realizar un procedimiento.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredProcedures.map((procedure) => (
              <Link key={procedure.slug} href={`/procedimientos/${procedure.slug}`} className="group overflow-hidden rounded-[2rem] border border-line bg-white/[0.03] transition hover:-translate-y-1 hover:border-champagne/40">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={procedure.image} alt={procedure.imageAlt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">{procedure.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">{procedure.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{procedure.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">Entender el tratamiento <ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft/30 py-20 lg:py-28">
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
                <Link key={family.slug} href={`/tratamientos/${family.slug}`}>
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
