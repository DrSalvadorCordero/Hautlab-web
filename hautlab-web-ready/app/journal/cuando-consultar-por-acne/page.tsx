import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["cuando-consultar-por-acne"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Cuándo consultar por acné: señales clave | HAUTLAB Journal",
  description:
    "Cuándo conviene consultar por acné: nódulos dolorosos, cicatrices, manchas persistentes, brotes corporales, recaídas o falta de respuesta. Guía clínica basada en evidencia.",
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

const consultationSignals = [
  {
    title: "Hay nódulos, quistes o dolor",
    text: "Las lesiones profundas e inflamatorias tienen mayor potencial de dejar cicatriz y suelen justificar una estrategia médica más temprana que un brote leve de comedones."
  },
  {
    title: "Ya aparecen cicatrices",
    text: "La cicatriz cambia la prioridad: no conviene esperar a que el acné desaparezca por sí solo mientras siguen apareciendo lesiones que pueden dejar secuelas permanentes."
  },
  {
    title: "El acné afecta pecho o espalda",
    text: "La extensión corporal puede dificultar el tratamiento tópico, aumentar la carga inflamatoria y modificar la elección del tratamiento."
  },
  {
    title: "Hay recaídas o respuesta insuficiente",
    text: "Si un plan bien utilizado no controla el acné, conviene revisar diagnóstico, adherencia, tolerancia, severidad y si hace falta escalar o cambiar el mecanismo terapéutico."
  },
  {
    title: "Está dejando manchas persistentes",
    text: "La hiperpigmentación postinflamatoria no es lo mismo que una cicatriz, pero puede durar más que la lesión activa. Controlar nuevos brotes reduce la generación continua de nuevas marcas."
  },
  {
    title: "Está afectando bienestar o vida social",
    text: "La carga psicosocial forma parte de la severidad clínica. Las guías actuales contemplan este impacto al decidir cuándo intensificar el tratamiento."
  }
];

const faq = [
  {
    question: "¿Cuándo debería consultar por acné?",
    answer:
      "Conviene valorar el acné cuando hay lesiones profundas o dolorosas, cicatrices, afectación extensa, manchas persistentes, recaídas frecuentes, impacto emocional o falta de respuesta a un manejo razonable. No es necesario esperar a que sea severo para pedir una valoración."
  },
  {
    question: "¿Cuándo se considera isotretinoína?",
    answer:
      "Las guías de la American Academy of Dermatology recomiendan isotretinoína de forma sólida para acné severo, acné que produce cicatrices o carga psicosocial, y enfermedad que no responde al tratamiento tópico u oral estándar. La indicación requiere valoración individual, revisión de contraindicaciones y seguimiento."
  },
  {
    question: "¿Los antibióticos orales son siempre el siguiente paso?",
    answer:
      "No. La elección depende del patrón y la severidad. Cuando se usan antibióticos sistémicos, las guías recomiendan limitar su duración y combinarlos con tratamiento tópico, incluido peróxido de benzoilo, para reducir el riesgo de resistencia antimicrobiana."
  },
  {
    question: "¿Hay que hacer estudios de laboratorio a toda persona con acné?",
    answer:
      "No de rutina. Los estudios se seleccionan cuando la historia clínica, el patrón del acné o síntomas asociados hacen sospechar un componente hormonal u otra condición que cambie el manejo."
  },
  {
    question: "¿Primero se tratan las cicatrices o el acné activo?",
    answer:
      "En general, la prioridad es controlar la actividad inflamatoria para evitar nuevas cicatrices. El tratamiento de secuelas se planifica después o por etapas, según el tipo de cicatriz y la estabilidad del acné."
  }
];

const references = [
  {
    label: "Reynolds RV, et al. Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol. 2024;90(5):1006.e1-1006.e30.",
    href: "https://pubmed.ncbi.nlm.nih.gov/38300170/"
  },
  {
    label: "American Academy of Dermatology. Acne clinical guideline: recommendations and good practice statements.",
    href: "https://www.aad.org/member/clinical-quality/guidelines/acne"
  },
  {
    label: "Rocha M, et al. Acne treatment challenges — Recommendations of Latin American expert consensus. An Bras Dermatol. 2024;99(3):414-424.",
    href: "https://pubmed.ncbi.nlm.nih.gov/38402012/"
  },
  {
    label: "Swearingen A, et al. Assessing the inclusion of postinflammatory hyperpigmentation outcomes in acne vulgaris clinical trials. J Am Acad Dermatol. 2025;92(2):323-324.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39393546/"
  }
];

export default function WhenToConsultForAcneArticle() {
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
              HAUTLAB Journal / {article.category}
            </Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">
              Guía clínica · {article.readingTime}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs leading-5 text-quiet">
              <span>Preparado: 22 de septiembre de 2026</span>
              <span aria-hidden="true">·</span>
              <span>Revisión médica requerida antes de publicación</span>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                No hace falta esperar a tener “acné severo” para consultar. Una valoración médica cobra especial sentido cuando aparecen lesiones profundas o dolorosas, cicatrices, brotes extensos, marcas persistentes, recaídas frecuentes, impacto emocional o falta de respuesta a un manejo bien utilizado. La prioridad es controlar la actividad antes de que siga dejando secuelas.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">La decisión clínica</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
                La severidad no se mide solo contando granos.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted">
                El tipo de lesión, la profundidad de la inflamación, la extensión, la velocidad con la que aparecen cicatrices, la pigmentación residual, la respuesta a tratamientos previos y el impacto en la vida diaria cambian el nivel de intervención necesario. Dos personas con un número parecido de lesiones pueden requerir estrategias distintas.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {consultationSignals.map((signal) => (
                <Card key={signal.title} className="p-6 sm:p-7">
                  <h3 className="text-lg font-medium text-bone">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{signal.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <ShieldCheck className="h-6 w-6 text-champagne" />
              <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
                Qué tiene respaldo sólido hoy.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                La guía de la American Academy of Dermatology de 2024 emitió recomendaciones fuertes a favor del peróxido de benzoilo, retinoides tópicos, antibióticos tópicos y doxiciclina oral. También recomienda de forma sólida isotretinoína cuando el acné es severo, produce cicatrices o carga psicosocial, o no responde al tratamiento tópico u oral estándar.
              </p>
              <p>
                Como buena práctica, la guía favorece combinar mecanismos tópicos, limitar el uso de antibióticos sistémicos y acompañarlos de tratamiento tópico, incluido peróxido de benzoilo. El objetivo no es acumular productos: es cubrir mecanismos relevantes sin prolongar antibióticos de manera innecesaria.
              </p>
              <p>
                Existen recomendaciones condicionales para opciones como ácido azelaico, ácido salicílico, clascoterona, anticonceptivos orales combinados y espironolactona. “Condicional” no significa ineficaz: indica que la elección depende más del contexto individual, preferencias, riesgos y certeza de la evidencia.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-7 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-champagne">Lo que no debe simplificarse</p>
                <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">No todo brote necesita estudios hormonales.</h2>
                <p className="mt-5 text-sm leading-7 text-muted">
                  Los estudios se solicitan cuando la historia y la exploración aportan razones para buscar un factor hormonal o sistémico. Hacer paneles amplios de rutina sin una pregunta clínica concreta puede añadir costo sin cambiar el manejo.
                </p>
              </Card>
              <Card className="p-7 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-champagne">Otra distinción importante</p>
                <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Mancha no es igual a cicatriz.</h2>
                <p className="mt-5 text-sm leading-7 text-muted">
                  Una marca plana roja o marrón después de un brote puede corresponder a cambio postinflamatorio y evolucionar con el tiempo. Una cicatriz implica alteración de la estructura de la piel. La prevención de nuevas lesiones sigue siendo central en ambos escenarios.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <AlertTriangle className="h-6 w-6 text-champagne" />
              <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[.96] tracking-[-.05em] text-bone">
                Cuándo no conviene seguir probando productos al azar.
              </h2>
            </div>
            <div className="space-y-4 text-base leading-8 text-muted">
              <p>
                Cambiar de rutina cada pocos días hace difícil saber qué funciona y puede aumentar irritación. Lo mismo ocurre al combinar exfoliantes, retinoides, peróxido de benzoilo y otros activos sin una estrategia de tolerancia.
              </p>
              <p>
                Si el acné está dejando cicatrices, es profundo, recidivante o extenso, el costo de esperar no es solo seguir teniendo brotes: puede significar acumular secuelas que después requieren un tratamiento diferente.
              </p>
              <p>
                Para información sobre valoración y manejo en HAUTLAB, consulta la página de{" "}
                <Link href="/procedimientos/acne" className="text-bone underline decoration-line underline-offset-4">
                  acné
                </Link>. Si el problema principal ya son secuelas de textura, revisa también{" "}
                <Link href="/procedimientos/cicatrices-acne" className="text-bone underline decoration-line underline-offset-4">
                  cicatrices de acné
                </Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">
              Lo que suele cambiar la conducta.
            </h2>
            <div className="mt-10 space-y-4">
              {faq.map((item) => (
                <Card key={item.question} className="p-6 sm:p-7">
                  <h3 className="text-lg font-medium text-bone">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-20">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-8 lg:grid-cols-[1.1fr_.9fr]">
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
                Este borrador requiere revisión del Dr. Salvador Cordero antes de publicación, en especial las afirmaciones sobre escalamiento terapéutico, isotretinoína, antibióticos, estudios hormonales y prevención de secuelas.
              </p>
              <p className="mt-5 text-xs leading-6 text-quiet">
                Contenido educativo. No sustituye una valoración médica ni constituye una indicación terapéutica individual.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Siguiente paso</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.6rem)] tracking-[-.05em] text-bone">
              Si el acné está dejando secuelas, conviene valorar la actividad antes de tratar las marcas.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              Una valoración permite diferenciar patrón, severidad, secuelas y factores que pueden cambiar el plan. No todos los casos necesitan el mismo tratamiento ni la misma intensidad.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración por acné.")} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos/acne">Ver información sobre acné</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
