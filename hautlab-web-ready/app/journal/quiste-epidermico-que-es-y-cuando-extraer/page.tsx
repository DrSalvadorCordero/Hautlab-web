import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["quiste-epidermico-que-es-y-cuando-extraer"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Quiste epidérmico: qué es, síntomas y extracción | HAUTLAB",
  description: "Quiste epidérmico o mal llamado quiste sebáceo: qué contiene, cuándo observarlo, diferencias entre inflamación e infección y cómo es su extracción en Mérida.",
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

const scenarios = [
  {
    index: "01",
    title: "Pequeño y sin síntomas",
    text: "No todos los quistes necesitan extirparse. Si la exploración confirma una lesión típica, estable y sin molestias, la observación es una opción razonable."
  },
  {
    index: "02",
    title: "Doloroso o inflamado",
    text: "La ruptura de la cápsula puede desencadenar inflamación intensa sin infección bacteriana. Se valora la zona, la presencia de absceso y la necesidad de controlar el episodio antes de operar."
  },
  {
    index: "03",
    title: "Recurrente, incómodo o en crecimiento",
    text: "Puede recomendarse extirpación si crece, se inflama repetidamente, se traumatiza, causa molestias o existe duda diagnóstica. La técnica y la cicatriz dependen de la localización y el tamaño."
  }
];

const questions = [
  {
    question: "¿Un quiste epidérmico es lo mismo que un quiste sebáceo?",
    answer: "No exactamente. Se suele llamar «sebáceo» a un quiste epidérmico, pero este contiene principalmente queratina y está revestido por epitelio similar al de la epidermis. Un verdadero quiste de origen sebáceo es mucho menos frecuente."
  },
  {
    question: "¿Se puede vaciar con una aguja o exprimir?",
    answer: "No se recomienda manipularlo en casa. Sacar el contenido no significa retirar la cápsula; puede volver a llenarse y la manipulación puede provocar ruptura, inflamación, infección o cicatriz."
  },
  {
    question: "¿Siempre necesito antibióticos si está rojo?",
    answer: "No. El enrojecimiento puede deberse a una reacción inflamatoria por ruptura del quiste. Los antibióticos se consideran cuando hay evidencia clínica de infección y según su gravedad; no se indican de forma rutinaria para todo quiste inflamado."
  },
  {
    question: "¿La extracción garantiza que nunca volverá?",
    answer: "No hay garantía absoluta. Retirar completamente la cápsula reduce la posibilidad de recurrencia, pero la extracción puede ser más difícil si el quiste se ha roto o está inflamado. La cirugía también deja una cicatriz."
  },
  {
    question: "¿Se manda la lesión a patología?",
    answer: "El estudio histopatológico permite confirmar el diagnóstico y descartar otras lesiones. Es especialmente importante cuando existen hallazgos atípicos, crecimiento inusual o dudas diagnósticas; la indicación se define en la valoración."
  }
];

const references = [
  { label: "DermNet. Epidermoid cyst. Revisión editorial de 2024.", href: "https://dermnetnz.org/topics/epidermoid-cyst" },
  { label: "American Academy of Dermatology. Choosing Wisely: antibióticos en quistes epidérmicos inflamados.", href: "https://www.aad.org/member/clinical-quality/clinical-care/wisely" },
  { label: "Mayo Clinic. Epidermoid cysts: diagnosis and treatment. 2024.", href: "https://www.mayoclinic.org/diseases-conditions/epidermoid-cysts/diagnosis-treatment/drc-20352706" }
];

export default function EpidermoidCystJournalPage() {
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
        dateModified: article.preparedAt,
        author: { "@id": siteConfig.url + "#clinic" },
        publisher: { "@id": siteConfig.url + "#clinic" },
        isPartOf: { "@id": siteConfig.url + "#website" },
        image: [siteConfig.url + "/visuals/quiste-epidermico-anatomia.svg"],
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
        mainEntity: questions.map((item) => ({
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
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <Link href="/journal" className="text-sm text-muted transition hover:text-bone">
              HAUTLAB Journal / {article.axis} / {article.category}
            </Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">
              Guía clínica · {article.readingTime}
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3rem,7vw,6rem)] leading-[.93] tracking-[-.06em] text-bone">
              Quiste epidérmico. No todo bulto bajo la piel es lo que parece.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Se conoce popularmente como «quiste sebáceo», pero su contenido no es sebo. Entender de qué está hecho cambia cómo se maneja y por qué puede regresar después de vaciarlo.
            </p>
            <p className="mt-8 text-xs leading-6 text-quiet">
              Preparado: 20 de octubre de 2026 · Material educativo sujeto a revisión clínica antes de su publicación.
            </p>
          </div>
        </section>

        <section className="border-b border-line py-12 lg:py-20">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">En pocas palabras</p>
              <p className="mt-5 max-w-4xl text-xl leading-9 text-bone">
                Un quiste epidérmico es una lesión habitualmente benigna formada por una cápsula revestida por epitelio que acumula queratina debajo de la piel. Puede permanecer estable durante años, inflamarse o crecer. La extracción completa de la cápsula, cuando está indicada, reduce el riesgo de que aparezca de nuevo.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1100px,calc(100%-32px))] gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">El nombre correcto</p>
              <h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Quiste epidérmico o epidermoide.</h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-muted">
                <p>También se denomina quiste infundibular o quiste de inclusión epidérmica. Suele originarse en la parte superior de un folículo piloso, aunque también puede aparecer después de una lesión cutánea.</p>
                <p>«Pilosebáceo» describe una unidad anatómica de la piel; no equivale a un diagnóstico específico. «Quiste sebáceo» es un término frecuente, pero habitualmente impreciso.</p>
                <p>El material espeso que a veces sale del quiste corresponde principalmente a <strong className="font-medium text-bone">queratina acumulada</strong>, no a grasa.</p>
              </div>
            </div>
            <figure>
              <Image src="/visuals/quiste-epidermico-anatomia.svg" width={1200} height={760} alt="Ilustración médica de la cápsula de un quiste epidérmico bajo la epidermis, con queratina acumulada y un punto central." className="h-auto w-full rounded-[2rem] border border-line" unoptimized priority />
              <figcaption className="mt-3 text-xs leading-5 text-quiet">Ilustración médica esquemática original de HAUTLAB. No representa una fotografía clínica ni una escala anatómica exacta.</figcaption>
            </figure>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué observar</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.7rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">Una bolita lenta, a veces con un pequeño punto central.</h2>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Aspecto habitual</h3><p className="mt-4 text-sm leading-7 text-muted">Nódulo redondeado, firme o elástico, bajo la piel, frecuentemente móvil respecto a los planos profundos. Puede observarse un orificio o punto central.</p></Card>
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Localización</h3><p className="mt-4 text-sm leading-7 text-muted">Es común en cara, cuello, pecho y espalda, aunque puede aparecer en otras regiones. Los quistes del cuero cabelludo suelen pertenecer a otro tipo: el quiste pilar.</p></Card>
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Evolución</h3><p className="mt-4 text-sm leading-7 text-muted">Generalmente crece despacio y puede no producir dolor. Un cambio rápido de tamaño o aspecto requiere revisión y no debe atribuirse automáticamente a un quiste benigno.</p></Card>
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Cuando se inflama</h3><p className="mt-4 text-sm leading-7 text-muted">Puede aumentar de tamaño, ponerse rojo, doler o drenar material. La inflamación también puede ocurrir sin infección bacteriana.</p></Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(1100px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Opciones de manejo</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.7rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">La decisión depende del estado del quiste, no solo de su tamaño.</h2>
            <figure className="mt-9">
              <Image src="/visuals/quiste-epidermico-tratamientos.svg" width={1200} height={700} alt="Infografía de tres posibilidades: observar un quiste sin síntomas, evaluar un quiste inflamado o extraer su cápsula cuando existe indicación médica." className="h-auto w-full rounded-[2rem] border border-line" unoptimized />
              <figcaption className="mt-3 text-xs leading-5 text-quiet">Las tres rutas son orientativas. La elección depende de exploración, diagnóstico diferencial y riesgos individuales.</figcaption>
            </figure>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {scenarios.map((scenario) => (
                <Card key={scenario.index} className="p-7">
                  <p className="text-xs tracking-[0.2em] text-champagne">{scenario.index}</p>
                  <h3 className="mt-4 text-xl font-medium text-bone">{scenario.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{scenario.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Un matiz importante</p><h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.2rem)] leading-[.96] tracking-[-.05em] text-bone">Inflamado no significa necesariamente infectado.</h2></div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>Si se rompe la cápsula, la queratina puede entrar en contacto con el tejido circundante y producir una respuesta inflamatoria intensa. En esos casos, un quiste rojo y doloroso puede no requerir antibióticos.</p>
              <p>Cuando existe absceso, drenaje purulento o signos compatibles con infección, el manejo cambia: puede incluir drenaje y, en casos seleccionados, tratamiento antibiótico. La extirpación definitiva en ocasiones se programa cuando el tejido está menos inflamado.</p>
              <p><strong className="font-medium text-bone">No se recomienda exprimirlo ni perforarlo en casa.</strong> Vaciar el contenido no equivale a eliminar la pared del quiste y puede complicar la extracción posterior.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cirugía menor</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[.96] tracking-[-.05em] text-bone">Por qué la cápsula importa tanto como el contenido.</h2>
            <div className="mt-8 grid gap-7 lg:grid-cols-2">
              <div className="space-y-5 text-base leading-8 text-muted">
                <p>Si se decide retirar el quiste, el procedimiento generalmente se realiza con anestesia local. La meta es extraer el contenido junto con su revestimiento o cápsula, preservando el tejido sano en la medida posible.</p>
                <p>La incisión, la necesidad de suturas y el seguimiento dependen de la zona, el tamaño, los episodios inflamatorios previos y la relación del quiste con otros tejidos.</p>
                <p>Como toda cirugía, implica riesgos de sangrado, infección, cicatriz y recurrencia. La evaluación previa también determina si la muestra debe enviarse a estudio histopatológico para confirmar el diagnóstico.</p>
              </div>
              <Card className="p-7 sm:p-9">
                <ShieldCheck className="h-6 w-6 text-champagne" />
                <h3 className="mt-5 font-serif text-3xl text-bone">Después del procedimiento</h3>
                <p className="mt-5 text-sm leading-7 text-muted">Los cuidados se individualizan según localización, tipo de cierre y características de la herida. Es importante respetar las indicaciones de limpieza, apósitos, actividad física y revisión de suturas.</p>
                <p className="mt-4 text-sm leading-7 text-muted">Consulta ante dolor progresivo, enrojecimiento que se extiende, secreción purulenta, fiebre, apertura de la herida o sangrado persistente.</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Diagnóstico diferencial</p>
            <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">No toda masa subcutánea es un quiste epidérmico.</h2>
            <p className="mt-7 text-base leading-8 text-muted">Una lesión similar puede ser un lipoma, un quiste pilar, un absceso u otro tumor cutáneo. La exploración suele orientar el diagnóstico; las masas profundas, adheridas, de crecimiento rápido, con sangrado espontáneo o presentación atípica pueden requerir estudio complementario. Se debe valorar antes si aparece dolor intenso, fiebre o enrojecimiento que progresa.</p>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {questions.map((item) => (
                <details key={item.question} className="py-5">
                  <summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{item.question}</summary>
                  <p className="mt-4 text-sm leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-20">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="p-7">
              <BookOpen className="h-5 w-5 text-champagne" />
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes clínicas</p>
              <p className="mt-4 text-sm leading-7 text-muted">Las decisiones descritas se basan en referencias médicas sobre diagnóstico, manejo conservador, extirpación y uso prudente de antibióticos.</p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
                {references.map((ref) => (
                  <li key={ref.href}><a href={ref.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">{ref.label}</a></li>
                ))}
              </ul>
            </Card>
            <Card className="p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p>
              <p className="mt-5 text-lg font-medium text-bone">Borrador clínico para validación</p>
              <p className="mt-3 text-sm leading-7 text-muted">Contenido preparado el 20 de octubre de 2026. La revisión clínica y autorización editorial deben confirmarse antes de publicar. Las ilustraciones son esquemáticas y no sustituyen una exploración.</p>
              <p className="mt-5 text-xs leading-6 text-quiet">Información educativa, no un diagnóstico ni una indicación de cirugía para un caso particular.</p>
            </Card>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Siguiente paso</p>
            <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">Primero identificar la lesión. Después decidir si conviene retirarla.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">En HAUTLAB, la valoración permite distinguir un quiste típico de otras lesiones, revisar síntomas y definir si se observa, trata la inflamación o se programa un procedimiento.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración de un posible quiste epidérmico.")} target="_blank" rel="noreferrer">Agendar valoración <ArrowRight className="h-4 w-4" /></a></Button>
              <Button asChild variant="outline"><Link href="/tratamientos/dermatologia-procedimental">Procedimientos focales</Link></Button>
            </div>
          </div>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
