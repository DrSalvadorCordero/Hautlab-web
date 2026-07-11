import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreatmentPageLayout } from "@/components/treatments/treatment-page-layout";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(treatmentsV2).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = treatmentsV2[slug];
  if (!treatment) return {};

  return {
    title: `${treatment.title} en Mérida | HAUTLAB + Dr. Salvador Cordero`,
    description: treatment.summary,
    alternates: { canonical: `${siteConfig.url}/procedimientos/${slug}` },
    openGraph: {
      title: `${treatment.title} | HAUTLAB`,
      description: treatment.summary,
      url: `${siteConfig.url}/procedimientos/${slug}`,
      type: "article",
      images: [{ url: treatment.image }]
    }
  };
}

export default async function ProcedurePage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = treatmentsV2[slug];
  if (!treatment) notFound();

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
      item: item.href ? `${siteConfig.url}${item.href}` : `${siteConfig.url}/procedimientos/${slug}`
    }))
  };

  return (
    <>
      <TreatmentPageLayout content={content} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
