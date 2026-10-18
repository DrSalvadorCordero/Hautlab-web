import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["dermatitis-seborreica-por-que-vuelve"];
const pageUrl = siteConfig.url + "/journal/" + article.slug;

export const metadata: Metadata = {
  title: "Dermatitis seborreica: por qué vuelve y cómo controlarla | HAUTLAB",
  description:
    "Por qué recae la dermatitis seborreica de cara y cuero cabelludo, qué cambia entre un brote y el mantenimiento, y cuándo la irritación obliga a revisar el diagnóstico.",
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

const situations = [
  {
    title: "La descamación regresa al suspender el manejo",
    body: "Es común que el brote mejore mientras se trata y reaparezca después. En adultos, el objetivo suele ser controlar la inflamación y diseñar un mantenimiento tolerable, no prometer una eliminación definitiva."
  },
  {
    title: "Un producto útil en el cuero cabelludo irrita la cara",
    body: "La concentración, el vehículo, el tiempo de contacto y la sensibilidad de la piel cambian la tolerancia. Que un champú funcione en el cuero cabelludo no significa que deba aplicarse a toda la cara sin valoración."
  },
  {
    title: "El enrojecimiento empeora pese a utilizar más productos",
    body: "Exfoliación, fricción y varias fórmulas medicadas pueden añadir irritación al brote. La intolerancia al vehículo o una segunda dermatitis pueden explicar parte de los síntomas."
  }
];

const faq = [
  {
    question: "¿La dermatitis seborreica se cura para siempre?",
    answer: "En adultos es frecuente que tenga una evolución recurrente. Muchas personas logran periodos prolongados de control, pero no es adecuado prometer una curación definitiva. La estrategia puede combinar manejo de brotes y mantenimiento."
  },
  {
    question: "¿La causa es tener un hongo contagioso?",
    answer: "No. Malassezia es una levadura que forma parte de la microbiota habitual de la piel. Su participación en la dermatitis seborreica depende también de la respuesta inflamatoria y otros factores del huésped; la afección no se transmite como una infección contagiosa corriente."
  },
  {
    question: "¿Puedo usar el champú medicado en la cara?",
    answer: "En casos seleccionados se utiliza en zonas distintas del cuero cabelludo, pero no siempre es adecuado. El producto, vehículo, tiempo de contacto y tolerancia facial importan. Si produce ardor significativo, se debe consultar antes de insistir."
  },
  {
    question: "¿Por qué no mantener corticoides en la cara todos los días?",
    answer: "Pueden reducir rápido la inflamación, pero su uso facial repetido o prolongado sin supervisión aumenta riesgos como atrofia, telangiectasias o dermatitis inducida por esteroides. La potencia y duración deben limitarse según valoración; para mantenimiento pueden preferirse otras estrategias."
  },
  {
    question: "¿Toda mancha clara o descamación es dermatitis seborreica?",
    answer: "No. Rosácea, psoriasis, dermatitis por contacto, tiñas y otras causas de cambios de pigmentación pueden confundirse o coexistir. La distribución, evolución y exploración orientan si hacen falta pruebas complementarias."
  },
  {
    question: "¿Qué ocurre si el antimicótico produce ardor?",
    answer: "El ardor puede ser un efecto irritativo del producto, del vehículo o de una barrera cutánea sensibilizada. No demuestra por sí solo alergia ni resistencia. Conviene detener la aplicación que agrava los síntomas y solicitar revisión para ajustar la estrategia."
  }
];

const references = [
  {
    label: "American Academy of Dermatology. Seborrheic dermatitis: Diagnosis and treatment. Actualizado en 2024.",
    href: "https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-treatment"
  },
  {
    label: "American Academy of Dermatology. Seborrheic dermatitis: Overview and self-care.",
    href: "https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-overview"
  },
  {
    label: "DermNet. Seborrhoeic dermatitis: clinical features, differential diagnosis and management. Actualización menor de 2024.",
    href: "https://dermnetnz.org/topics/seborrhoeic-dermatitis"
  },
  {
    label: "Naldi L, et al. Practical recommendations for seborrheic dermatitis management: An expert consensus. JEADV. 2026.",
    href: "https://onlinelibrary.wiley.com/doi/10.1111/jdv.70444"
  },
  {
    label: "Okokon EO, et al. Topical antifungals for seborrhoeic dermatitis. Cochrane Database Syst Rev. 2015; CD008138.",
    href: "https://www.cochrane.org/es/evidence/CD008138_antifungal-treatments-applied-skin-treat-seborrhoeic-dermatitis"
  }
];

export default function SeborrheicDermatitisJournalPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": pageUrl + "#article",
        url: pageUrl,
        headline: article.title,
        description: article.description,
        inLanguage: "es-MX",
        dateCreated: article.preparedAt,
        dateModified: "2026-10-18",
        datePublished: "2026-10-18",
        reviewedBy: { "@id": siteConfig.url + "#doctor" },
        author: { "@id": siteConfig.url + "#clinic" },
        publisher: { "@id": siteConfig.url + "#clinic" },
        isPartOf: { "@id": siteConfig.url + "#website" },
        breadcrumb: { "@id": pageUrl + "#breadcrumb" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Journal", item: siteConfig.url + "/journal" },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": pageUrl + "#faq",
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
              Preparado: 17 de octubre de 2026 · Revisión médica: 18 de octubre de 2026
            </p>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                La dermatitis seborreica puede volver porque es una enfermedad inflamatoria
                habitualmente recurrente en adultos. Que mejore con un champú o crema no
                significa que se haya eliminado su predisposición. La meta clínica es
                tratar el brote, recuperar tolerancia y mantener el control con el menor
                tratamiento necesario para cada zona.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.84fr_1.16fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">El mecanismo</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
                No es falta de higiene ni una infección que se contagia.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                La dermatitis seborreica produce descamación, eritema o cambios de color,
                a veces picor y sensibilidad. Aparece con frecuencia en el cuero cabelludo,
                las cejas, alrededor de la nariz, la barba, detrás de las orejas y el pecho.
                La caspa puede representar una forma leve en el cuero cabelludo.
              </p>
              <p>
                Las levaduras del género <em>Malassezia</em> forman parte de la microbiota
                cutánea. La enfermedad se relaciona con una respuesta inflamatoria compleja
                en zonas ricas en sebo; no significa que la persona esté sucia ni que pueda
                contagiar a quienes conviven con ella.
              </p>
              <p>
                Estrés y cambios estacionales pueden asociarse a brotes en algunas personas,
                pero no deben emplearse para atribuir toda recaída a una única causa.
                La coexistencia con otras dermatosis también modifica la presentación.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tres situaciones distintas</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
              Una recaída no siempre pide un tratamiento más fuerte.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {situations.map((item) => (
                <Card key={item.title} className="p-7">
                  <h3 className="text-lg font-medium text-bone">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{item.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.86fr_1.14fr]">
            <div>
              <ShieldCheck className="h-6 w-6 text-champagne" aria-hidden="true" />
              <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
                El brote y el mantenimiento tienen objetivos diferentes.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                Durante un brote se busca disminuir descamación e inflamación. Los
                antifúngicos tópicos, como ketoconazol o ciclopirox, son opciones estudiadas.
                Su elección y formulación dependen de la región afectada y la tolerancia.
                Si la inflamación es importante, puede considerarse un antiinflamatorio
                tópico durante un periodo limitado y bajo supervisión.
              </p>
              <p>
                Cuando la piel mejora, el médico puede proponer aplicaciones
                intermitentes de determinados tratamientos para prevenir recaídas.
                Las estrategias de mantenimiento del cuero cabelludo no son idénticas
                a las de la cara. Tampoco todo paciente necesita tratarse
                indefinidamente con la misma frecuencia.
              </p>
              <p>
                Los corticoides faciales pueden controlar inflamación a corto plazo,
                pero el uso continuo o repetido sin reevaluación aumenta el riesgo
                de efectos adversos. En pacientes seleccionados, los inhibidores
                tópicos de calcineurina permiten alternativas ahorradoras de esteroides.
                Ninguna de estas opciones equivale a una receta universal.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cuero cabelludo</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">
                Lo que funciona en un champú depende de cómo se utiliza.
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                Los champús medicados tienen ingredientes y tiempos de contacto distintos.
                El dermatólogo ajusta la frecuencia según tipo de cabello, inflamación,
                tolerancia y objetivos de mantenimiento. Lavar con fuerza o rascar
                para desprender escamas puede empeorar la irritación.
              </p>
            </Card>
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cara y barba</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">
                La barrera cutánea cambia el tratamiento.
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                La piel facial puede tolerar peor ciertos vehículos y concentraciones.
                Limpieza suave, hidratación sin fragancia y una pauta adaptada a
                la zona permiten distinguir mejor entre enfermedad activa y
                reacción irritativa al producto. Más ardor no significa mayor eficacia.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Si también hay flushing, brotes papulares u otras manifestaciones
                compatibles con rosácea, puede servir la lectura
                {" "}<Link href="/journal/rosacea-barrera-cutanea-irritar-no-es-tratar" className="text-bone underline decoration-line underline-offset-4">
                  rosácea y barrera cutánea
                </Link>.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.2rem)] leading-[.95] tracking-[-.05em] text-bone">
              ¿Cuándo replantear el diagnóstico?
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-muted">
              <p>
                Si aparecen lesiones muy dolorosas, pústulas, costras con secreción,
                caída de cabello en placas, cambios de pigmentación persistentes o
                un empeoramiento marcado pese al manejo indicado, la prioridad
                es una nueva exploración. No toda descamación es seborrea:
                psoriasis, dermatitis alérgica de contacto, rosácea y algunas
                infecciones pueden parecerse o coexistir.
              </p>
              <p>
                Las lesiones cercanas al ojo requieren especial atención si hay
                dolor ocular, fotofobia o cambios visuales. Ante estos síntomas,
                la evaluación médica no debe esperar a terminar una rutina cosmética.
              </p>
              <p>
                Un tratamiento que previamente funcionaba y ahora produce ardor
                intenso merece revisión del vehículo, concentración y diagnóstico,
                no simplemente duplicar la aplicación.
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
                  <summary className="cursor-pointer text-base font-medium text-bone">
                    {item.question}
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-20">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.12fr_.88fr]">
            <Card className="p-7 sm:p-8">
              <BookOpen className="h-5 w-5 text-champagne" aria-hidden="true" />
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes y nivel de evidencia</p>
              <p className="mt-4 text-sm leading-7 text-muted">
                La eficacia a corto plazo de ketoconazol y ciclopirox cuenta con
                ensayos y una revisión Cochrane. Sin embargo, muchos estudios
                son breves y la evidencia comparativa de mantenimiento prolongado
                es menos sólida. Las pautas de mantenimiento propuestas por un
                consenso internacional de 2026 son recomendaciones de expertos,
                no resultados equivalentes a un ensayo clínico de larga duración.
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
                {references.map((reference) => (
                  <li key={reference.href}>
                    <a href={reference.href} target="_blank" rel="noreferrer"
                      className="underline decoration-line underline-offset-4 transition hover:text-bone">
                      {reference.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Criterio HAUTLAB</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">
                Controlar no es intensificar sin límite.
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                Una indicación útil distingue el brote de la prevención,
                la cara del cuero cabelludo y la irritación del proceso inflamatorio
                que se pretende tratar. La tolerancia también forma parte
                de la eficacia.
              </p>
              <p className="mt-6 text-xs leading-6 text-quiet">
                Revisado por el Dr. Salvador Cordero el 18 de octubre de 2026.
                Material informativo para público general; no reproduce expedientes
                ni constituye una prescripción individual.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Siguiente paso</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.3rem)] tracking-[-.05em] text-bone">
              Si vuelve, conviene entender por qué.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
              La evaluación clínica permite confirmar si se trata de dermatitis seborreica,
              identificar irritación por productos y elegir tratamiento o mantenimiento
              solo cuando corresponda.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración por dermatitis seborreica recurrente.")}
                  target="_blank" rel="noreferrer">
                  Solicitar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/journal/rosacea-barrera-cutanea-irritar-no-es-tratar">
                  Rosácea y sensibilidad
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </article>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
