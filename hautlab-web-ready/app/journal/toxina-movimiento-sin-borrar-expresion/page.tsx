import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["toxina-movimiento-sin-borrar-expresion"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Toxina botulínica: tratar movimiento sin borrar expresión | HAUTLAB Journal",
  description:
    "La toxina botulínica no exige inmovilizar un rostro. Evaluación dinámica, anatomía, dosificación individual y límites del tratamiento.",
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

const faq = [
  {
    question: "¿La toxina botulínica debe dejar la frente completamente inmóvil?",
    answer:
      "No como regla. El grado de reducción de movimiento depende del objetivo, anatomía, patrón muscular, producto, dosis y colocación. La planificación puede buscar modulación en lugar de inmovilidad máxima."
  },
  {
    question: "¿Todas las personas reciben los mismos puntos y unidades?",
    answer:
      "No debería asumirse así. Los consensos actuales enfatizan evaluación dinámica e individualización porque los patrones musculares y las proporciones cambian entre pacientes."
  },
  {
    question: "¿Más unidades significan un mejor resultado?",
    answer:
      "No necesariamente. Más dosis puede producir mayor efecto, pero la calidad del resultado depende de que la intensidad y distribución correspondan al objetivo y reduzcan el riesgo de efectos no deseados."
  },
  {
    question: "¿La toxina cambia volumen o calidad de piel?",
    answer:
      "Su mecanismo principal es neuromuscular. Puede modificar líneas dinámicas y patrones de tracción, pero no sustituye tratamientos destinados a volumen, pigmento, textura o laxitud."
  }
];

const references = [
  {
    label:
      "Choi HS, et al. Consensus Recommendations for Treatment of the Upper Face With LetibotulinumtoxinA. 2024.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39348312/"
  },
  {
    label:
      "SAMCEP Society consensus on the treatment of upper facial lines with botulinum neurotoxin type A: A tailored approach.",
    href: "https://pubmed.ncbi.nlm.nih.gov/37408173/"
  },
  {
    label:
      "Botulinum Toxin for Aesthetic Use in Facial and Cervical Regions: A Review of Techniques Currently Used in Dermatology. 2024.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39722351/"
  }
];

export default function ExpressionJournalArticle() {
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
              Movimiento facial · {article.readingTime}
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
                La toxina botulínica puede modular fuerzas y líneas dinámicas sin convertir la ausencia total de movimiento en la meta.
                La calidad del resultado depende de leer el patrón muscular antes de elegir puntos y dosis.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Evaluación dinámica</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
                La expresión se evalúa en movimiento, no solo en una fotografía.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                Los consensos recientes para tercio superior insisten en adaptar la estrategia al patrón dinámico individual.
                Altura frontal, fuerza muscular, posición de ceja, asimetrías y compensaciones cambian la distribución del tratamiento.
              </p>
              <p>
                Dos pacientes con líneas parecidas en reposo pueden tener una mecánica distinta al elevar las cejas, fruncir o sonreír.
                Copiar un mapa fijo de inyección ignora esa diferencia.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tres variables</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Patrón</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Qué músculos dominan, qué compensaciones existen y cómo cambia la ceja o la mirada con la gesticulación.
                </p>
              </Card>
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Intensidad</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  La dosis útil no es la máxima tolerable. Debe corresponder al objetivo, fuerza muscular y balance entre grupos.
                </p>
              </Card>
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Distribución</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  La colocación modifica qué fibras reciben más efecto y qué movimientos se conservan. Anatomía y técnica importan tanto como las unidades.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
              Qué puede hacer y qué no.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Card className="p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-champagne">Puede</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
                  <li>Reducir actividad muscular en zonas seleccionadas.</li>
                  <li>Suavizar líneas predominantemente dinámicas.</li>
                  <li>Modificar ciertos vectores de tracción y balance muscular.</li>
                  <li>Tratar patrones específicos cuando existe una indicación clínica y anatómica.</li>
                </ul>
              </Card>
              <Card className="p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-champagne">No sustituye</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
                  <li>Reposición de soporte o volumen cuando ese es el problema.</li>
                  <li>Tratamientos de pigmentación, textura o cicatrices.</li>
                  <li>Una valoración anatómica previa.</li>
                  <li>Una estrategia facial completa cuando intervienen varias capas.</li>
                </ul>
              </Card>
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
                Borrador educativo. Los consensos citados apoyan individualización y evaluación dinámica; no convierten una técnica o dosis en universal.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">
              Tratar expresión no exige borrarla.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              La valoración dinámica define qué movimiento conviene modular, cuánto y con qué distribución.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración para toxina botulínica.")} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos/toxina-botulinica">Ver toxina botulínica</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
