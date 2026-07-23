import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { treatmentFamilies } from "@/data/site";
import { extraTreatmentsV2 } from "@/data/treatments-v2-extra";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";
import { whatsappForTreatment } from "@/lib/whatsapp";

const allTreatments = { ...treatmentsV2, ...extraTreatmentsV2 };

type PageProps = { params: Promise<{ slug: string }> };

const categoryByFamilySlug: Record<string, string> = {
  "medicina-estetica-facial": "Diseño facial",
  "calidad-de-piel-y-soporte": "Piel y textura",
  "dermatologia-clinica": "Condiciones de piel",
  "dermatologia-procedimental": "Procedimientos focales"
};

export function generateStaticParams() {
  return [
    ...treatmentFamilies.map((family) => ({ slug: family.slug })),
    ...Object.keys(allTreatments).map((slug) => ({ slug }))
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const legacyTreatment = allTreatments[slug];

  if (legacyTreatment) {
    return {
      title: `${legacyTreatment.title} | HAUTLAB`,
      description: legacyTreatment.summary,
      alternates: { canonical: `${siteConfig.url}/procedimientos/${slug}` },
      robots: { index: false, follow: true }
    };
  }

  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) return {};

  const url = `${siteConfig.url}/tratamientos/${family.slug}`;
  const isClinicalDermatology = family.slug === "dermatologia-clinica";
  return {
    title: isClinicalDermatology
      ? "Dermatología clínica en Mérida | Dr. Salvador Cordero · HAUTLAB"
      : `${family.title} | HAUTLAB + Dr. Salvador Cordero`,
    description: isClinicalDermatology
      ? "Consulta médica de piel, cabello y uñas en San Ramón Norte, Mérida. Valoración, diagnóstico diferencial, tratamiento y seguimiento individualizado."
      : `${family.summary} ${family.approach}`,
    alternates: { canonical: url },
    openGraph: {
      title: `${family.title} | HAUTLAB`,
      description: family.summary,
      url,
      siteName: "HAUTLAB",
      locale: "es_MX",
      type: "website"
    }
  };
}

export default async function TreatmentAreaPage({ params }: PageProps) {
  const { slug } = await params;

  if (allTreatments[slug]) {
    redirect(`/procedimientos/${slug}`);
  }

  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) notFound();

  const categoryLabel = categoryByFamilySlug[family.slug];
  const familyTreatments = Object.entries(allTreatments)
    .filter(([, item]) => item.category.label === categoryLabel)
    .map(([treatmentSlug, item]) => ({ slug: treatmentSlug, ...item }))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));

  const Icon = family.icon;
  const isClinicalDermatology = family.slug === "dermatologia-clinica";
  const pageUrl = `${siteConfig.url}/tratamientos/${family.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: isClinicalDermatology ? "Dermatología clínica en Mérida" : family.title,
        description: `${family.summary} ${family.approach}`,
        url: pageUrl,
        inLanguage: "es-MX",
        dateModified: isClinicalDermatology ? "2026-07-23T12:00:00.000Z" : "2026-07-11T12:00:00.000Z",
        isPartOf: { "@id": `${siteConfig.url}#website` },
        author: { "@id": `${siteConfig.url}#doctor` }
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: family.title,
        serviceType: family.title,
        description: family.summary,
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: family.title, item: pageUrl }
        ]
      }
    ]
  };

  return (
    <>
      <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <Link href="/#tratamientos" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone">
              <ArrowLeft className="h-4 w-4" /> Volver a áreas
            </Link>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Área de atención</p>
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

      {isClinicalDermatology && (
        <section className="border-b border-line bg-soft/25 py-20 lg:py-28">
          <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Consulta médica en Mérida</p>
              <h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">
                Piel, cabello y uñas se valoran dentro del contexto completo.
              </h2>
              <p className="mt-6 text-sm leading-7 text-muted">
                Atención con cita en San Ramón Norte. La consulta médica tiene una inversión de {siteConfig.consultationPrice}.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["01", "Historia clínica", "Evolución, síntomas, tratamientos previos, medicamentos, alergias y factores que modifican el caso."],
                ["02", "Exploración", "Revisión dirigida de piel, cabello o uñas y comparación de patrones clínicos relevantes."],
                ["03", "Diagnóstico diferencial", "Se define qué explica mejor el problema y qué estudios aportarían información real, si fueran necesarios."],
                ["04", "Plan y seguimiento", "Tratamiento por prioridades, tolerancia, objetivos, tiempos y criterios para ajustar la conducta."]
              ].map(([number, title, text]) => (
                <Card key={number} className="p-6">
                  <p className="text-xs tracking-[0.2em] text-champagne">{number}</p>
                  <h3 className="mt-6 text-xl font-medium text-bone">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{text}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 w-[min(1180px,calc(100%-32px))] rounded-[1.75rem] border border-line bg-background/50 p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Autoría y alcance profesional</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <p className="text-lg font-medium text-bone">{siteConfig.legalDoctorName}</p>
                <p className="mt-2 text-sm text-muted">{siteConfig.professionalTitle} · {siteConfig.practiceArea}</p>
                <p className="mt-1 text-xs text-quiet">{siteConfig.professionalLicense}</p>
                <p className="mt-4 text-xs text-quiet">Última revisión médica: 23 de julio de 2026.</p>
              </div>
              <div className="space-y-3 text-xs leading-5 text-muted">
                <p>
                  La información pública orienta sobre el proceso de valoración; no confirma diagnósticos ni sustituye una consulta individual.
                </p>
                <a
                  href="https://www.aad.org/member/clinical-quality/guidelines"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-bone underline decoration-line underline-offset-4"
                >
                  Guías clínicas de la American Academy of Dermatology
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <Card className="h-fit p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Qué atendemos</p>
              <div className="mt-6 grid gap-3">
                {family.treats.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.025] p-4 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <div className="mb-7">
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Páginas disponibles</p>
                <h2 className="mt-4 font-serif text-[clamp(2.4rem,4vw,4rem)] leading-[.95] tracking-[-.055em] text-bone">
                  Información específica, sin convertir la consulta en un catálogo.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {familyTreatments.map((item) => (
                  <Link key={item.slug} href={`/procedimientos/${item.slug}`} className="group rounded-[1.75rem] border border-line bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                    <p className="text-xs uppercase tracking-[0.16em] text-champagne">{item.eyebrow}</p>
                    <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em] text-bone">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{item.summary}</p>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm text-bone">
                      Ver enfoque <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>

              {!familyTreatments.length && (
                <Card className="p-6 text-sm leading-7 text-muted">
                  Esta área está en expansión. La valoración permite orientar el caso aunque la página específica aún no esté publicada.
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </>
  );
}
