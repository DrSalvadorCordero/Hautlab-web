import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["relleno-vs-bioestimulador"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Relleno vs bioestimulador: diferencias | HAUTLAB Journal",
  description:
    "Diferencias entre rellenos de ácido hialurónico y bioestimuladores como PLLA o CaHA: objetivo, tiempo de respuesta, precisión, reversibilidad, riesgos y cuándo valorar cada uno.",
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

const comparison = [
  {
    point: "Objetivo principal",
    filler: "Aportar soporte, proyección o volumen de forma relativamente precisa en una zona seleccionada.",
    biostimulator: "Favorecer remodelación tisular progresiva y mejorar soporte o calidad de tejido según el producto y la técnica."
  },
  {
    point: "Cuándo se aprecia",
    filler: "El cambio suele ser visible desde la aplicación, aunque la inflamación inicial puede distorsionar el resultado temprano.",
    biostimulator: "El efecto relevante suele construirse de forma gradual; algunos productos pueden aportar además un componente estructural inmediato."
  },
  {
    point: "Precisión de volumen",
    filler: "Puede ser útil cuando se busca una corrección anatómica localizada y cuantificable.",
    biostimulator: "No es un sustituto automático cuando se necesita proyectar o corregir un punto estructural muy específico."
  },
  {
    point: "Reversibilidad",
    filler: "Algunos rellenos de ácido hialurónico pueden degradarse con hialuronidasa cuando existe indicación. Eso no elimina los riesgos del procedimiento.",
    biostimulator: "PLLA y CaHA no tienen un equivalente de reversión enzimática con hialuronidasa; la prevención y la selección de plano son especialmente relevantes."
  },
  {
    point: "Plan de tratamiento",
    filler: "Puede plantearse por zona o por etapas, dependiendo del objetivo y de la anatomía.",
    biostimulator: "Con frecuencia requiere valorar sesiones, intervalo y evolución; el protocolo depende del producto, la dilución, la zona y la respuesta individual."
  }
];

const faq = [
  {
    question: "¿Un bioestimulador es mejor que el ácido hialurónico?",
    answer:
      "No existe un ganador universal. La elección cambia según el problema a resolver. Si se necesita proyección o soporte localizado, un relleno puede tener más sentido; si el objetivo es una mejoría gradual de soporte o calidad tisular, un bioestimulador puede ser una opción. En algunos planes se combinan."
  },
  {
    question: "¿El bioestimulador da volumen?",
    answer:
      "Depende del material y de cómo se utilice. PLLA se asocia principalmente con un efecto progresivo por remodelación tisular; CaHA puede aportar soporte inmediato además de bioestimulación. Por eso agrupar todos los productos bajo una sola expectativa simplifica demasiado la decisión."
  },
  {
    question: "¿El ácido hialurónico es más seguro porque puede disolverse?",
    answer:
      "No. La posibilidad de utilizar hialuronidasa en determinados rellenos de ácido hialurónico es una herramienta de manejo, pero no vuelve el procedimiento libre de complicaciones. La inyección intravascular puede ocasionar daño grave y exige prevención, reconocimiento y respuesta inmediata."
  },
  {
    question: "¿Se pueden combinar relleno y bioestimulador?",
    answer:
      "Sí, en pacientes seleccionados pueden formar parte del mismo plan porque resuelven objetivos diferentes. La secuencia, el intervalo y las zonas deben decidirse a partir de anatomía, diagnóstico y antecedentes, no mediante un protocolo fijo."
  }
];

const references = [
  {
    label: "DeVries A, et al. Injectable Fillers and Collagen Stimulators for Facial Aesthetics. J Craniofac Surg. 2026.",
    href: "https://pubmed.ncbi.nlm.nih.gov/42479576/"
  },
  {
    label: "Smith L, et al. Biostimulants in Aesthetic Medicine: A Systematic Review and Meta-analysis. Aesthet Surg J. 2025.",
    href: "https://pubmed.ncbi.nlm.nih.gov/40674466/"
  },
  {
    label: "Efficacy, Durability, and Safety of Collagen Biostimulators Based on PLLA and CaHA in the Face: A Systematic Review.",
    href: "https://pubmed.ncbi.nlm.nih.gov/41184662/"
  },
  {
    label: "FDA. Dermal Fillers (Soft Tissue Fillers): indications, limitations and risks.",
    href: "https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers"
  }
];

export default function FillerVsBiostimulatorArticle() {
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
              Comparativa clínica · {article.readingTime}
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
                Un relleno y un bioestimulador no son dos versiones del mismo tratamiento. El ácido hialurónico suele elegirse cuando se necesita soporte, transición o volumen localizado; los bioestimuladores como PLLA y CaHA buscan una respuesta tisular más progresiva, aunque algunos también aportan soporte estructural. La indicación depende del objetivo, la anatomía, el tejido, los procedimientos previos y el perfil de riesgo.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">La diferencia importante</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
                Elegir por mecanismo, no por tendencia.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted">
                La literatura reciente describe a los rellenos de ácido hialurónico como herramientas de volumización y soporte con efecto inmediato, mientras que PLLA y CaHA se utilizan por su capacidad de estimular neocolagénesis y modificar gradualmente determinadas características del tejido. La frontera no es absoluta: CaHA, por ejemplo, puede combinar soporte inmediato con un efecto bioestimulador posterior.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-line">
              <div className="grid grid-cols-[.72fr_1fr_1fr] border-b border-line bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-bone">
                <div className="p-4 sm:p-5">Punto</div>
                <div className="border-l border-line p-4 sm:p-5">Relleno de ácido hialurónico</div>
                <div className="border-l border-line p-4 sm:p-5">Bioestimulador</div>
              </div>
              {comparison.map((row) => (
                <div key={row.point} className="grid grid-cols-[.72fr_1fr_1fr] border-b border-line last:border-b-0">
                  <div className="p-4 text-sm font-medium leading-6 text-bone sm:p-5">{row.point}</div>
                  <div className="border-l border-line p-4 text-sm leading-7 text-muted sm:p-5">{row.filler}</div>
                  <div className="border-l border-line p-4 text-sm leading-7 text-muted sm:p-5">{row.biostimulator}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cuándo puede tener sentido un relleno</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Cuando el problema es anatómico y localizado.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
                <p>Puede valorarse cuando se busca modificar una transición, recuperar soporte o aportar proyección en un punto concreto.</p>
                <p>La decisión depende de la zona, la movilidad, el grosor de tejidos, el historial de inyectables y la relación con el resto del rostro.</p>
                <p>
                  En HAUTLAB, la información específica sobre esta categoría está en{" "}
                  <Link href="/merida/rellenos-faciales" className="text-bone underline decoration-line underline-offset-4">
                    rellenos faciales con ácido hialurónico
                  </Link>.
                </p>
              </div>
            </Card>

            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Cuándo puede tener sentido un bioestimulador</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Cuando el objetivo es progresivo y tisular.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
                <p>Puede valorarse cuando interesa mejorar soporte o calidad de tejido de forma gradual y el problema no exige una corrección volumétrica precisa.</p>
                <p>PLLA y CaHA no son intercambiables: mecanismo, dilución, plano, zonas y respuesta clínica cambian entre productos y técnicas.</p>
                <p>
                  Consulta también la página de{" "}
                  <Link href="/procedimientos/bioestimuladores" className="text-bone underline decoration-line underline-offset-4">
                    bioestimuladores
                  </Link>.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <ShieldCheck className="h-6 w-6 text-champagne" />
              <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">
                La reversibilidad no sustituye la seguridad.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>
                Hinchazón, hematomas, dolor, sensibilidad, irregularidades, infección y nódulos pueden aparecer después de inyectables. La frecuencia y el tipo de evento dependen del material, la técnica, la zona y el paciente.
              </p>
              <p>
                La complicación de mayor gravedad en los rellenos es la inyección intravascular accidental, que puede comprometer piel y, en situaciones poco frecuentes, causar alteraciones visuales o eventos neurológicos. La posibilidad de degradar ácido hialurónico con hialuronidasa cuando está indicado no convierte una aplicación en un procedimiento de bajo riesgo.
              </p>
              <p>
                Con bioestimuladores también importa la selección de paciente, el plano y la técnica. Las revisiones disponibles muestran mejorías clínicas y una alta satisfacción reportada, pero los estudios son heterogéneos y no justifican afirmar que un material sea superior para todos los pacientes.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto w-[min(900px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
              Lo que conviene decidir antes de elegir producto.
            </h2>
            <div className="mt-9 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none pr-6 text-base font-medium text-bone [&::-webkit-details-marker]:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <BookOpen className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.1rem)] leading-[.96] tracking-[-.045em] text-bone">
              Qué dice la evidencia y qué todavía no permite concluir.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Revisiones recientes respaldan que PLLA y CaHA pueden mejorar variables estéticas y de calidad tisular en pacientes seleccionados. Sin embargo, la heterogeneidad de productos, técnicas, escalas de evaluación y diseños de estudio limita las comparaciones directas. La evidencia actual apoya individualizar la indicación; no respalda convertir “relleno” o “bioestimulador” en una recomendación universal por edad o tendencia.
            </p>

            <div className="mt-8 space-y-4">
              {references.map((reference) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-line bg-white/[0.025] p-5 text-sm leading-7 text-bone transition hover:border-champagne/40"
                >
                  {reference.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Card className="p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p>
              <p className="mt-5 text-lg font-medium text-bone">Revisión médica pendiente</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Este borrador no debe publicarse hasta que el Dr. Salvador Cordero revise y apruebe las afirmaciones clínicas, el encuadre de riesgos y las referencias.
              </p>
            </Card>

            <Card className="p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Si estás considerando un inyectable</p>
              <p className="mt-5 text-lg font-medium text-bone">La pregunta no es “qué producto está de moda”, sino qué problema hay que resolver.</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Una valoración médica puede distinguir si el objetivo requiere volumen localizado, soporte progresivo, tratamiento de piel, otra tecnología o simplemente no intervenir.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a
                    href={buildWhatsAppLink("Hola, quiero agendar una valoración para saber si en mi caso tiene más sentido un relleno o un bioestimulador.")}
                    target="_blank"
                    rel="noreferrer"
                    data-event="whatsapp_journal_filler_vs_biostimulator"
                  >
                    Agendar valoración <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/merida/medicina-estetica">Ver medicina estética</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </article>

      <script
        id="journal-filler-vs-biostimulator-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
