import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["cicatrices-acne-no-todas-se-tratan-igual"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Cicatrices de acné: por qué no todas se tratan igual | HAUTLAB Journal",
  description:
    "Ice-pick, boxcar y rolling no tienen la misma arquitectura. Por qué clasificar la cicatriz cambia la elección entre técnicas focales, subcisión, microneedling y energía.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: article.title,
    description: article.description,
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "article"
  }
};

const scarTypes = [
  {
    title: "Ice-pick",
    text: "Depresiones estrechas y profundas. Su geometría hace que una estrategia puramente superficial pueda quedarse corta."
  },
  {
    title: "Boxcar",
    text: "Depresiones de bordes más definidos y profundidad variable. La conducta cambia según anchura, profundidad y transición con la piel vecina."
  },
  {
    title: "Rolling",
    text: "Ondulaciones amplias asociadas con frecuencia a anclajes fibrosos subdérmicos. El componente mecánico importa tanto como la superficie."
  }
];

const faq = [
  {
    question: "¿Un láser puede tratar todas las cicatrices de acné?",
    answer:
      "No de la misma manera. Los dispositivos pueden mejorar textura y remodelación, pero la morfología de la cicatriz puede hacer necesario combinar o priorizar otras técnicas."
  },
  {
    question: "¿La subcisión sirve para cualquier cicatriz?",
    answer:
      "No. Tiene más lógica cuando existe un componente de anclaje o tethering, especialmente en cicatrices rolling seleccionadas. La exploración determina si ese componente está presente."
  },
  {
    question: "¿Se puede tratar una cicatriz con punch?",
    answer:
      "En cicatrices focales seleccionadas, técnicas de punch pueden formar parte del plan. La indicación depende de diámetro, profundidad, localización, tensión cutánea y riesgo de dejar una nueva cicatriz visible."
  },
  {
    question: "¿Primero se trata el acné activo o las cicatrices?",
    answer:
      "En general conviene controlar la actividad inflamatoria para reducir la aparición de nuevas cicatrices y después diseñar el tratamiento de secuelas por tipo y prioridad."
  }
];

const references = [
  {
    label:
      "Jennings T, et al. Acne scarring—pathophysiology, diagnosis, prevention and education: Part I. J Am Acad Dermatol. 2024.",
    href: "https://pubmed.ncbi.nlm.nih.gov/35792196/"
  },
  {
    label:
      "Evidence-based management of cutaneous scarring in dermatology part 2: atrophic acne scarring. 2023.",
    href: "https://pubmed.ncbi.nlm.nih.gov/38059974/"
  },
  {
    label:
      "Acne Scar Treatment: A Multimodality Approach Tailored to Scar Type. Dermatol Surg.",
    href: "https://pubmed.ncbi.nlm.nih.gov/27128240/"
  }
];

export default function AcneScarsJournalArticle() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: article.title,
        description: article.description,
        inLanguage: "es-MX",
        dateCreated: article.preparedAt,
        dateModified: "2026-09-29",
        author: { "@id": `${siteConfig.url}#clinic` },
        reviewedBy: { "@id": `${siteConfig.url}#doctor` },
        publisher: { "@id": `${siteConfig.url}#clinic` },
        isPartOf: { "@id": `${siteConfig.url}#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${siteConfig.url}/journal` },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };

  return (
    <main>
      <article>
        <section className="border-b border-line bg-aurora py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Link href="/journal" className="text-sm text-muted transition hover:text-bone">
              HAUTLAB Journal / {article.axis} / {article.category}
            </Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">
              Guía clínica · {article.readingTime}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
            <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 29 de septiembre de 2026 · Revisado por Dr. Salvador Cordero</p>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tesis</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                Una cicatriz de acné no se trata por el nombre del aparato disponible, sino por su arquitectura.
                Identificar profundidad, bordes, anclajes y distribución evita usar la misma técnica para problemas distintos.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Morfología antes que tecnología</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
              Tres patrones frecuentes. Tres problemas estructurales diferentes.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {scarTypes.map((type) => (
                <Card key={type.title} className="p-7">
                  <h3 className="text-xl font-medium text-bone">{type.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{type.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué cambia el plan</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
                El mismo rostro puede necesitar más de un mecanismo.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                Las revisiones actuales apoyan varias modalidades para cicatrices atróficas, entre ellas láseres fraccionados,
                microneedling, peelings, rellenos y otras técnicas. La calidad de evidencia no es idéntica para todas y los protocolos son heterogéneos.
              </p>
              <p>
                El punto clínico es más importante que la lista de dispositivos: si existe anclaje, profundidad focal o pérdida de volumen,
                una sola intervención superficial puede no cubrir todos los componentes.
              </p>
              <p>
                Por eso un plan razonable suele ordenar objetivos por etapas en lugar de prometer que una sesión o una tecnología resolverá
                cada cicatriz de la misma forma.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
              Qué conviene evaluar antes de intervenir.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Actividad de acné y aparición de nuevas lesiones.",
                "Tipo de cicatriz, profundidad, bordes y presencia de anclajes.",
                "Eritema o pigmentación que puede confundirse con cicatriz estructural.",
                "Fototipo, antecedentes de pigmentación y tendencia a cicatrización anómala.",
                "Tratamientos previos y respuesta real, no solo número de sesiones.",
                "Tolerancia a recuperación, riesgo y necesidad de combinar técnicas."
              ].map((item) => (
                <Card key={item} className="p-6 text-sm leading-7 text-muted">{item}</Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto w-[min(900px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.question} className="py-5">
                  <summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-20">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="p-7 sm:p-8">
              <BookOpen className="h-5 w-5 text-champagne" />
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes</p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
                {references.map((reference) => (
                  <li key={reference.href}>
                    <a href={reference.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">
                      {reference.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p>
              <p className="mt-5 text-lg font-medium text-bone">Revisado por Dr. Salvador Cordero</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Contenido educativo revisado por el Dr. Salvador Cordero el 29 de septiembre de 2026.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">
              La indicación empieza por clasificar la cicatriz.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              Si el problema principal ya es textura, una valoración puede separar lo focal, lo anclado y lo superficial antes de elegir técnica.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración por cicatrices de acné.")} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos/cicatrices-acne">Ver cicatrices de acné</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
