import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TreatmentPageLayout } from "@/components/treatments/treatment-page-layout";
import { treatmentFamilies } from "@/data/site";
import { getTreatmentPage, treatmentPages } from "@/data/treatment-pages";
import { siteConfig } from "@/lib/siteConfig";
import { whatsappForTreatment } from "@/lib/whatsapp";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    ...treatmentFamilies.map((family) => ({ slug: family.slug })),
    ...treatmentPages.map((treatment) => ({ slug: treatment.slug }))
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatmentPage(slug);

  if (treatment) {
    return {
      title: treatment.metaTitle,
      description: treatment.metaDescription,
      alternates: { canonical: `${siteConfig.url}/tratamientos/${treatment.slug}` },
      openGraph: {
        title: treatment.metaTitle,
        description: treatment.metaDescription,
        url: `${siteConfig.url}/tratamientos/${treatment.slug}`,
        type: "article",
        images: [{ url: treatment.image, alt: treatment.imageAlt }]
      },
      twitter: {
        card: "summary_large_image",
        title: treatment.metaTitle,
        description: treatment.metaDescription,
        images: [treatment.image]
      }
    };
  }

  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) return {};

  return {
    title: `${family.title} | HAUTLAB + Dr. Salvador Cordero`,
    description: `${family.summary} ${family.approach}`,
    alternates: { canonical: `${siteConfig.url}/tratamientos/${family.slug}` }
  };
}

export default async function TreatmentPage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = getTreatmentPage(slug);

  if (treatment) {
    const pageUrl = `${siteConfig.url}/tratamientos/${treatment.slug}`;
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: treatment.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: treatment.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href ? `${siteConfig.url}${item.href}` : pageUrl
      }))
    };

    return (
      <>
        <TreatmentPageLayout content={treatment} />
        <Script id={`faq-${treatment.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <Script id={`breadcrumbs-${treatment.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </>
    );
  }

  const family = treatmentFamilies.find((item) => item.slug === slug);
  if (!family) notFound();

  const Icon = family.icon;
  const familyTreatments = treatmentPages.filter((item) => {
    const mapping: Record<string, string> = {
      "medicina-estetica-facial": "diseno-facial",
      "calidad-de-piel-y-soporte": "piel-y-textura",
      "dermatologia-clinica": "condiciones-de-piel",
      "dermatologia-procedimental": "procedimientos-focales"
    };

    const areaBySlug: Record<string, string> = {
      rinomodelacion: "diseno-facial",
      "toxina-botulinica": "diseno-facial",
      labios: "diseno-facial",
      acne: "condiciones-de-piel",
      melasma: "condiciones-de-piel",
      verrugas: "procedimientos-focales"
    };

    return areaBySlug[item.slug] === mapping[family.slug];
  });

  return (
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

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card className="p-7">
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

          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Páginas disponibles</p>
            <div className="mt-6 grid gap-3">
              {familyTreatments.length ? (
                familyTreatments.map((item) => (
                  <Link key={item.slug} href={`/tratamientos/${item.slug}`} className="group rounded-2xl border border-line bg-white/[0.025] p-5 transition hover:border-champagne/40">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-medium text-bone">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-champagne transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted">Esta área se está preparando para revisión y publicación progresiva.</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
