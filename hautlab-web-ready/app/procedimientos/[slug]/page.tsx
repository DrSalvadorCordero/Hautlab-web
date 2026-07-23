import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreatmentPageLayout } from "@/components/treatments/treatment-page-layout";
import { procedureContentDate } from "@/data/content-dates";
import { treatmentCatalog } from "@/data/treatment-catalog";
import { siteConfig } from "@/lib/siteConfig";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(treatmentCatalog).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = treatmentCatalog[slug];
  if (!treatment) return {};

  const title = `${treatment.title} en Mérida | HAUTLAB + Dr. Salvador Cordero`;
  const url = `${siteConfig.url}/procedimientos/${slug}`;
  const socialImage = `${url}/opengraph-image`;

  return {
    title,
    description: treatment.summary,
    authors: treatment.medicalReview
      ? [{ name: treatment.medicalReview.author, url: `${siteConfig.url}#doctor` }]
      : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: `${treatment.title} | HAUTLAB`,
      description: treatment.summary,
      url,
      siteName: "HAUTLAB",
      locale: "es_MX",
      type: "article",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${treatment.title} | HAUTLAB` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${treatment.title} | HAUTLAB`,
      description: treatment.summary,
      images: [socialImage]
    }
  };
}

export default async function ProcedurePage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = treatmentCatalog[slug];
  if (!treatment) notFound();

  const url = `${siteConfig.url}/procedimientos/${slug}`;
  const modifiedAt = procedureContentDate(slug).toISOString();
  const content = {
    ...treatment,
    breadcrumbs: [...treatment.breadcrumbs, { label: treatment.title }]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: treatment.faq.map((item) => ({
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

  const medicalPageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#webpage`,
        name: treatment.title,
        description: treatment.summary,
        url,
        inLanguage: "es-MX",
        dateModified: modifiedAt,
        isPartOf: { "@id": `${siteConfig.url}#website` },
        publisher: { "@id": `${siteConfig.url}#clinic` },
        author: { "@id": `${siteConfig.url}#doctor` },
        audience: { "@type": "Patient" },
        citation: treatment.medicalReview?.sources.map((source) => source.href)
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Valoración para ${treatment.title}`,
        serviceType: treatment.title,
        description: treatment.summary,
        url,
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" },
        offers: {
          "@type": "Offer",
          priceCurrency: "MXN",
          description: treatment.investment.label
        }
      }
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
