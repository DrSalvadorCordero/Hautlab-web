import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreatmentPageLayout, type TreatmentPageContent } from "@/components/treatments/treatment-page-layout";
import { procedureContentDate } from "@/data/content-dates";
import { prioritySeoPages, type PrioritySeoPage } from "@/data/seo-priority-pages";
import { searchConsoleSeoPages } from "@/data/seo-search-console-pages";
import { treatmentCatalog } from "@/data/treatment-catalog";
import { siteConfig } from "@/lib/siteConfig";

type PageProps = { params: Promise<{ slug: string }> };

const canonicalInternalRoutes: Record<string, string> = {
  "/tratamientos/medicina-estetica-facial": "/merida/medicina-estetica",
  "/tratamientos/dermatologia-clinica": "/merida/dermatologia"
};

const procedureVisuals: Record<string, { image: string; imageAlt: string }> = {
  rinomodelacion: {
    image: "/visuals/hautlab-rinomodelacion.webp",
    imageAlt: "Marcaje anatómico previo a rinomodelación en HAUTLAB"
  },
  "armonizacion-facial": {
    image: "/visuals/hautlab-armonizacion.webp",
    imageAlt: "Valoración de proporciones y contorno facial frente al espejo"
  },
  menton: {
    image: "/visuals/hautlab-menton.webp",
    imageAlt: "Marcaje clínico de mentón y tercio inferior facial"
  },
  mandibula: {
    image: "/visuals/hautlab-mandibula-hombre.webp",
    imageAlt: "Marcaje clínico de contorno mandibular masculino"
  }
};

function canonicalHref(href: string) {
  return canonicalInternalRoutes[href] ?? href;
}

function canonicalizeInternalLinks(treatment: TreatmentPageContent): TreatmentPageContent {
  return {
    ...treatment,
    category: {
      ...treatment.category,
      href: canonicalHref(treatment.category.href)
    },
    related: treatment.related.map((item) => ({
      ...item,
      href: canonicalHref(item.href)
    }))
  };
}

function commercialSeoOverride(slug: string, seo?: PrioritySeoPage): PrioritySeoPage | undefined {
  if (!seo || slug !== "rinomodelacion") return seo;

  return {
    ...seo,
    schema: {
      ...seo.schema,
      offerPrice: "5400"
    },
    additionalFaq: seo.additionalFaq.map((item) =>
      item.question === "¿Cuánto cuesta una rinomodelación en Mérida?"
        ? {
            ...item,
            answer:
              "En HAUTLAB la rinomodelación tiene una inversión de $5,400 MXN en modalidad preferencial de pago o $6,300 MXN hasta 6 meses sin intereses. Incluye valoración, procedimiento, revisión y retoque cuando existe indicación clínica."
          }
        : item
    )
  };
}

function mergePriorityContent(treatment: TreatmentPageContent, seo?: PrioritySeoPage): TreatmentPageContent {
  const merged = seo
    ? {
        ...treatment,
        summary: seo.pageSummary,
        faq: [...treatment.faq, ...seo.additionalFaq],
        clinicalDetails: seo.clinicalDetails ?? treatment.clinicalDetails,
        medicalReview: seo.medicalReview ?? treatment.medicalReview
      }
    : treatment;

  return canonicalizeInternalLinks(merged);
}

function applyProcedureOverrides(slug: string, treatment: TreatmentPageContent): TreatmentPageContent {
  const visual = procedureVisuals[slug];

  return {
    ...treatment,
    ...(visual ?? {}),
    ...(slug === "rinomodelacion"
      ? {
          investment: {
            label: "$5,400 MXN · modalidad preferencial",
            note:
              "También disponible en $6,300 MXN hasta 6 meses sin intereses. Incluye valoración, procedimiento, revisión y retoque cuando esté indicado. La viabilidad se confirma durante la valoración."
          }
        }
      : {})
  };
}

function seoFor(slug: string) {
  return commercialSeoOverride(slug, prioritySeoPages[slug] ?? searchConsoleSeoPages[slug]);
}

export function generateStaticParams() {
  return Object.keys(treatmentCatalog).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = treatmentCatalog[slug];
  if (!treatment) return {};

  const seo = seoFor(slug);
  const effectiveTreatment = applyProcedureOverrides(slug, mergePriorityContent(treatment, seo));
  const title = seo?.title ?? `${treatment.title} en Mérida | HAUTLAB + Dr. Salvador Cordero`;
  const description = seo?.description ?? effectiveTreatment.summary;
  const url = `${siteConfig.url}/procedimientos/${slug}`;
  const socialImage = `${url}/opengraph-image`;

  return {
    title,
    description,
    authors: effectiveTreatment.medicalReview
      ? [{ name: effectiveTreatment.medicalReview.author, url: `${siteConfig.url}#doctor` }]
      : undefined,
    category: "Salud",
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "HAUTLAB",
      locale: "es_MX",
      type: "article",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${effectiveTreatment.title} | HAUTLAB` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage]
    }
  };
}

export default async function ProcedurePage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = treatmentCatalog[slug];
  if (!treatment) notFound();

  const seo = seoFor(slug);
  const effectiveTreatment = applyProcedureOverrides(slug, mergePriorityContent(treatment, seo));
  const url = `${siteConfig.url}/procedimientos/${slug}`;
  const modifiedAt = procedureContentDate(slug).toISOString();
  const content = {
    ...effectiveTreatment,
    breadcrumbs: [...effectiveTreatment.breadcrumbs, { label: effectiveTreatment.title }]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: effectiveTreatment.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: content.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.url}${item.href}` : url
    }))
  };

  const medicalTopic = seo
    ? {
        "@type": seo.schema.type,
        "@id": `${url}#topic`,
        name: seo.schema.name,
        alternateName: seo.schema.alternateName
      }
    : undefined;

  const medicalPageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#webpage`,
        name: effectiveTreatment.title,
        headline: seo?.title ?? effectiveTreatment.title,
        description: seo?.description ?? effectiveTreatment.summary,
        url,
        inLanguage: "es-MX",
        dateModified: modifiedAt,
        mainEntityOfPage: url,
        isPartOf: { "@id": `${siteConfig.url}#website` },
        publisher: { "@id": `${siteConfig.url}#clinic` },
        author: { "@id": `${siteConfig.url}#doctor` },
        audience: { "@type": "Patient" },
        about: medicalTopic,
        citation: effectiveTreatment.medicalReview?.sources.map((source) => source.href)
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Valoración para ${effectiveTreatment.title}`,
        serviceType: seo?.schema.name ?? effectiveTreatment.title,
        description: seo?.description ?? effectiveTreatment.summary,
        url,
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" },
        category: "Dermatología clínica y medicina estética",
        offers: seo?.schema.offerPrice
          ? {
              "@type": "Offer",
              price: seo.schema.offerPrice,
              priceCurrency: "MXN",
              url
            }
          : undefined
      },
      ...(medicalTopic ? [medicalTopic] : [])
    ]
  };

  return (
    <>
      <TreatmentPageLayout content={content} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
