import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { treatmentFamilies } from "@/data/site";
import { siteConfig } from "@/lib/siteConfig";
import { whatsappForTreatment } from "@/lib/whatsapp";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return treatmentFamilies.map((family) => ({ slug: family.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) return {};

  return {
    title: `${family.title} | HAUTLAB + Dr. Salvador Cordero`,
    description: `${family.summary} ${family.approach}`,
    alternates: { canonical: `${siteConfig.url}/tratamientos/${family.slug}` }
  };
}

export default async function TreatmentFamilyPage({ params }: PageProps) {
  const { slug } = await params;
  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) notFound();

  const Icon = family.icon;

  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <Link href="/#tratamientos" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone">
              <ArrowLeft className="h-4 w-4" /> Volver a tratamientos
            </Link>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Familia de tratamiento</p>
            <h1 className="font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
              {family.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{family.summary}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappForTreatment(family.title)} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pagos">Pagos seguros</Link>
              </Button>
            </div>
          </div>

          <Card className="p-7">
            <div className="mb-8 grid h-14 w-14 place-items-center rounded-full border border-line bg-background/60 text-champagne">
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Enfoque HAUTLAB</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Diagnóstico primero. Indicación después.</h2>
            <p className="mt-5 text-sm leading-7 text-muted">{family.approach}</p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Qué trata</p>
            <div className="mt-6 grid gap-3">
              {family.treats.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.025] p-4 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Rangos de inversión</p>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-none tracking-[-.055em] text-bone">
              La inversión depende de diagnóstico, técnica y secuencia.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">{family.investment}</p>
            <p className="mt-5 text-sm leading-7 text-quiet">
              La valoración define si conviene tratar, esperar, priorizar o replantear. No se indica procedimiento si el beneficio no justifica el riesgo o si el resultado no será sobrio.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
