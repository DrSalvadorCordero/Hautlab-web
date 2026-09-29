import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["mas-volumen-no-es-mas-armonia"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Más volumen no es más armonía | HAUTLAB Journal",
  description:
    "Por qué corregir soporte y proporción no equivale a sumar mililitros. Sobrecorrección, dinámica facial y planificación por prioridades.",
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
    question: "¿Cómo se evita que un rostro se vea sobrecorregido?",
    answer:
      "La prevención empieza antes de infiltrar: identificar qué rasgo realmente necesita soporte o proyección, qué zonas conviene no tocar y cuál es el límite en el que añadir producto deja de mejorar proporción."
  },
  {
    question: "¿Más jeringas producen un resultado más completo?",
    answer:
      "No necesariamente. El número de jeringas no es una medida de calidad. La cantidad útil depende de anatomía, objetivo, producto, plano y relación entre facciones."
  },
  {
    question: "¿Todo exceso de volumen es permanente?",
    answer:
      "No. La evolución depende del material, la zona y el tiempo. Con ácido hialurónico existe además la posibilidad de degradación en situaciones seleccionadas, pero eso no sustituye la prevención ni elimina sus riesgos."
  },
  {
    question: "¿La armonización facial debe tratar todo el rostro?",
    answer:
      "No. Una planeación integral puede concluir que conviene tratar una sola prioridad, varias por etapas o incluso no añadir volumen en determinadas zonas."
  }
];

const references = [
  {
    label:
      "Lim TS, Wanitphakdeedecha R, Yi KH. Exploring facial overfilled syndrome from the perspective of anatomy and mismatched delivery of fillers. J Cosmet Dermatol. 2024.",
    href: "https://pubmed.ncbi.nlm.nih.gov/38369859/"
  },
  {
    label:
      "Facial Overfilled Syndrome: A Narrative Clinical Review. 2026.",
    href: "https://pubmed.ncbi.nlm.nih.gov/41948082/"
  }
];

export default function ProportionJournalArticle() {
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
        dateModified: article.preparedAt,
        author: { "@id": `${siteConfig.url}#clinic` },
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
              Criterio estético · {article.readingTime}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
            <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 29 de septiembre de 2026 · Revisión médica pendiente</p>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tesis</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                El relleno es una herramienta de corrección, no un objetivo en sí mismo. Cuando el volumen se añade sin una prioridad anatómica clara,
                puede aumentar tamaño sin mejorar proporción y alterar cómo el rostro se lee en reposo y en movimiento.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">La pregunta correcta</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
                No es cuánto falta. Es qué relación conviene corregir.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                Un rostro puede mostrar pérdida de soporte, retrusión, asimetría, transición marcada entre planos o simplemente una característica normal que no necesita corrección.
                Tratar esas situaciones como si todas fueran déficit de volumen empuja a una sola solución para problemas distintos.
              </p>
              <p>
                La literatura estética ha descrito el llamado “facial overfilled syndrome” para agrupar patrones de sobrecorrección y distorsión asociados con uso excesivo
                o mal distribuido de rellenos. Es un término clínico descriptivo, no una escala universal ni un diagnóstico que deba aplicarse por fotografía.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tres límites útiles</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Anatomía</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Producto, plano y vector deben corresponder al problema. Depositar volumen donde no existe una indicación estructural puede crear una nueva desproporción.
                </p>
              </Card>
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Dinámica</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Un resultado debe observarse también al sonreír, hablar y gesticular. El rostro no es una escultura inmóvil.
                </p>
              </Card>
              <Card className="p-7">
                <h3 className="text-xl font-medium text-bone">Prioridad</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Si una corrección pequeña resuelve la relación principal, añadir producto en zonas secundarias puede aumentar complejidad sin aportar la misma ganancia.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
              Señales de que conviene detenerse y reevaluar.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "La indicación se expresa en mililitros antes que en un objetivo anatómico.",
                "Cada visita añade una zona nueva sin revisar el efecto acumulado.",
                "El rostro se evalúa solo en reposo y no en movimiento.",
                "Una asimetría menor lleva a correcciones sucesivas cada vez mayores.",
                "Se intenta resolver calidad de piel o laxitud únicamente con volumen.",
                "El resultado empieza a borrar rasgos propios en vez de ordenarlos."
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
              <p className="mt-5 text-lg font-medium text-bone">Revisión médica pendiente</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                La evidencia sobre sobrecorrección proviene en buena parte de revisiones anatómicas, series y experiencia experta. La pieza separa ese nivel de evidencia del criterio estético de HAUTLAB.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">
              La planeación facial también consiste en decidir qué no tratar.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              Una valoración puede ordenar soporte, perfil, movimiento y piel antes de decidir si el volumen aporta algo o solo añade más.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración de armonización facial.")} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos/armonizacion-facial">Ver armonización facial</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
