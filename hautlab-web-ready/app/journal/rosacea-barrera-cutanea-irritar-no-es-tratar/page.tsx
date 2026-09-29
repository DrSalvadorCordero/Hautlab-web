import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["rosacea-barrera-cutanea-irritar-no-es-tratar"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Rosácea y barrera cutánea: irritar no es tratar | HAUTLAB Journal",
  description:
    "Qué significa barrera cutánea alterada en rosácea, por qué una rutina agresiva puede empeorar ardor y sensibilidad, cómo simplificar y cuándo buscar valoración médica.",
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

const barrierSignals = [
  {
    title: "Ardor o escozor con productos habituales",
    text: "En rosácea son frecuentes síntomas sensoriales como ardor, escozor y sensibilidad. Si aparecen con varios productos, añadir más activos puede aumentar la carga irritativa."
  },
  {
    title: "Tirantez, descamación o sensación de piel áspera",
    text: "La pérdida de agua y la alteración del estrato córneo pueden coexistir con rosácea. La hidratación y el cuidado suave pueden mejorar tolerancia y confort, aunque no sustituyen tratamiento dirigido."
  },
  {
    title: "Enrojecimiento que empeora después de la rutina",
    text: "No todo eritema posterior a un producto es una reacción alérgica. Irritación, fricción, temperatura y formulaciones mal toleradas también pueden intensificar temporalmente la vasorreactividad."
  },
  {
    title: "Cada cambio de rutina desencadena otro brote",
    text: "Cuando se rotan exfoliantes, retinoides, limpiadores intensos y otros activos con demasiada frecuencia, se vuelve difícil distinguir enfermedad activa de irritación acumulada."
  }
];

const faq = [
  {
    question: "¿La rosácea significa que la barrera cutánea está dañada?",
    answer:
      "La rosácea se asocia con mayor sensibilidad y existen estudios que muestran alteraciones de hidratación y función de barrera en la piel facial. Eso no significa que toda la enfermedad se explique por la barrera ni que una crema por sí sola trate todos sus componentes."
  },
  {
    question: "¿Debo suspender todos los activos si tengo rosácea?",
    answer:
      "No como regla permanente. Durante una fase de irritación puede ser razonable simplificar temporalmente, pero tratamientos como ácido azelaico u otros medicamentos pueden formar parte del manejo cuando están indicados y se toleran. La estrategia depende del fenotipo y del momento clínico."
  },
  {
    question: "¿Un hidratante puede tratar la rosácea?",
    answer:
      "Puede mejorar hidratación, confort y tolerancia, y funcionar como apoyo al tratamiento. No reemplaza terapias dirigidas a lesiones inflamatorias, eritema persistente, telangiectasias, cambios fimatosos o afectación ocular."
  },
  {
    question: "¿La exfoliación ayuda a eliminar el enrojecimiento?",
    answer:
      "No es una estrategia para tratar el eritema de rosácea. La fricción y la exfoliación agresiva pueden aumentar irritación y síntomas en piel susceptible."
  },
  {
    question: "¿Qué síntomas oculares importan?",
    answer:
      "Sequedad, ardor, sensación de cuerpo extraño, enrojecimiento ocular o inflamación palpebral pueden acompañar a la rosácea. Dolor ocular, fotofobia marcada, visión borrosa nueva o disminución visual requieren valoración médica oportuna."
  }
];

const references = [
  {
    label:
      "American Academy of Dermatology. 7 rosacea skin care tips dermatologists recommend. Updated 2024.",
    href: "https://www.aad.org/public/diseases/rosacea/triggers/tips"
  },
  {
    label:
      "American Academy of Dermatology. Rosacea: Diagnosis and treatment.",
    href: "https://www.aad.org/public/diseases/rosacea/treatment/diagnosis-treat"
  },
  {
    label:
      "Schaller M, et al. Recommendations for rosacea diagnosis, classification and management: update from the global ROSacea COnsensus panel. Br J Dermatol. 2020.",
    href: "https://pubmed.ncbi.nlm.nih.gov/31392722/"
  },
  {
    label:
      "Dirr MA, et al. Rosacea Core Domain Set for Clinical Trials and Practice: A Consensus Statement. JAMA Dermatol. 2024.",
    href: "https://pubmed.ncbi.nlm.nih.gov/38656294/"
  },
  {
    label:
      "Del Rosso JQ, et al. Evidence of Barrier Deficiency in Rosacea and the Importance of Integrating OTC Skincare Products into Treatment Regimens. J Drugs Dermatol. 2021.",
    href: "https://pubmed.ncbi.nlm.nih.gov/33852244/"
  },
  {
    label:
      "Mohamed-Noriega K, et al. Ocular Rosacea: An Updated Review. Cornea. 2025.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39808113/"
  }
];

export default function RosaceaBarrierJournalArticle() {
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
              Guía clínica · {article.readingTime}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
            <p className="mt-8 text-xs leading-6 text-quiet">
              Preparado: 29 de septiembre de 2026 · Revisión médica pendiente
            </p>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                En rosácea, ardor, tirantez y sensibilidad no son una invitación a “trabajar más” la piel.
                Una barrera alterada puede hacer que una rutina intensa aumente síntomas y dificulte tolerar el tratamiento que sí está indicado.
                Simplificar puede ser una intervención útil; no es abandonar el tratamiento.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Primero: qué es rosácea</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
                La barrera importa, pero no explica toda la enfermedad.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                La rosácea es una enfermedad inflamatoria crónica con componentes neurovasculares e inmunológicos.
                El enfoque actual favorece describir las manifestaciones predominantes —eritema persistente, flushing, telangiectasias,
                pápulas y pústulas, cambios fimatosos y síntomas oculares— en lugar de asumir que todos los pacientes pertenecen a un único subtipo.
              </p>
              <p>
                La sensibilidad cutánea y la alteración de barrera pueden coexistir con esas manifestaciones. Estudios fisiológicos y revisiones
                describen cambios en hidratación y pérdida transepidérmica de agua en piel facial con rosácea. Son clínicamente relevantes,
                pero no convierten a la rosácea en una simple “piel seca”.
              </p>
              <p>
                Para diagnóstico, manifestaciones, riesgos y opciones de tratamiento, la página clínica de{" "}
                <Link href="/procedimientos/rosacea" className="text-bone underline decoration-line underline-offset-4">
                  rosácea en HAUTLAB
                </Link>{" "}
                sigue siendo la referencia principal.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cuando la rutina empieza a estorbar</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
              La irritación puede parecer actividad de la enfermedad.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {barrierSignals.map((signal) => (
                <Card key={signal.title} className="p-7">
                  <h3 className="text-lg font-medium text-bone">{signal.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{signal.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
              Una rutina mínima puede tener una función terapéutica de soporte.
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-muted">
              <p>
                Las recomendaciones dermatológicas coinciden en tres pilares de cuidado: limpieza suave, hidratación bien tolerada y fotoprotección.
                El objetivo es reducir fricción e irritación y mejorar tolerancia; no perseguir una sensación de “piel profundamente limpia”.
              </p>
              <p>
                La American Academy of Dermatology recomienda evitar fricción, scrubs, astringentes y productos que desencadenen ardor o irritación.
                También señala que la hidratación puede mejorar confort y complementar el tratamiento médico.
              </p>
              <p>
                La elección de una formulación concreta depende de tolerancia individual. No existe un ingrediente único que “repare” todas las barreras
                ni una lista universal de productos que funcione para toda persona con rosácea.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Simplificar no significa</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Suspender todo tratamiento indefinidamente.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                Algunos tratamientos eficaces pueden producir escozor o irritación al inicio. Si una terapia está indicada,
                el objetivo es ajustar frecuencia, vehículo, secuencia o soporte según tolerancia, no concluir automáticamente que “ningún activo sirve”.
              </p>
            </Card>
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tampoco significa</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Que hidratar trate vasos, pústulas u ojos.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                Eritema persistente, telangiectasias, inflamación papulopustular y afectación ocular pueden necesitar intervenciones diferentes.
                La estrategia se construye por manifestación clínica, no por una sola teoría de barrera.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <AlertTriangle className="h-6 w-6 text-champagne" />
              <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
                Los ojos cambian la prioridad.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                La rosácea ocular puede presentarse con sequedad, ardor, sensación de cuerpo extraño, enrojecimiento,
                alteraciones palpebrales y disfunción de glándulas de Meibomio. Puede coexistir con rosácea cutánea o aparecer sin signos faciales llamativos.
              </p>
              <p>
                Dolor ocular, fotofobia marcada, visión borrosa nueva o disminución visual no deben atribuirse simplemente a “piel sensible”.
                Pueden indicar compromiso ocular que requiere valoración médica y, según el caso, evaluación oftalmológica.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
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
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes y nivel de evidencia</p>
              <p className="mt-4 text-sm leading-7 text-muted">
                La pieza combina consensos clínicos, recomendaciones dermatológicas y estudios de función de barrera.
                La evidencia sobre moisturizers y barrera apoya su uso como complemento; no demuestra que un hidratante sustituya tratamiento dirigido a todos los fenotipos.
              </p>
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
                Requiere revisión final del Dr. Salvador Cordero antes de publicación, especialmente en la distinción entre barrera alterada,
                irritación por tratamiento, fenotipos de rosácea y señales de alarma ocular.
              </p>
              <p className="mt-5 text-xs leading-6 text-quiet">
                Contenido educativo. No sustituye una valoración médica ni constituye una prescripción individual.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Siguiente paso</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">
              Si todo arde, añadir otro producto no siempre es el siguiente paso.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              Una valoración puede separar rosácea activa, irritación acumulada, dermatitis coexistente y síntomas oculares antes de volver a intensificar la rutina.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración por rosácea o piel sensible.")} target="_blank" rel="noreferrer">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos/rosacea">Ver rosácea</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
