import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/merida/dermatologia`;

export const metadata: Metadata = {
  title: "Dermatología en Mérida | Piel, cabello y uñas | HAUTLAB",
  description:
    "Consulta médica de piel, cabello y uñas en Mérida. Valoración clínica, diagnóstico diferencial, tratamiento y seguimiento con el Dr. Salvador Cordero.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Dermatología clínica en Mérida | HAUTLAB",
    description:
      "Valoración médica de piel, cabello y uñas en San Ramón Norte, Mérida, con diagnóstico primero y seguimiento individualizado.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const conditionLinks = [
  { label: "Acné", href: "/procedimientos/acne", description: "Brotes inflamatorios, comedones, pigmentación y riesgo de cicatriz." },
  { label: "Rosácea", href: "/procedimientos/rosacea", description: "Enrojecimiento, ardor, vasos visibles y lesiones inflamatorias." },
  { label: "Melasma", href: "/procedimientos/melasma", description: "Pigmentación facial con evaluación de desencadenantes y tratamientos previos." },
  { label: "Alopecia", href: "/procedimientos/alopecia", description: "Caída de cabello, pérdida de densidad y alteraciones del cuero cabelludo." },
  { label: "Lunares", href: "/procedimientos/lunares", description: "Valoración de lesiones pigmentadas y cambios que requieren revisión médica." },
  { label: "Verrugas", href: "/procedimientos/verrugas", description: "Diagnóstico y opciones de manejo según localización, número y contexto clínico." }
];

const faq = [
  {
    question: "¿Qué problemas se pueden valorar en una consulta dermatológica en Mérida?",
    answer:
      "Se pueden valorar problemas de piel, cabello y uñas, incluyendo acné, rosácea, pigmentación, caída de cabello, dermatitis, lesiones cutáneas, verrugas y cambios en lunares. El diagnóstico final depende de la historia clínica y la exploración."
  },
  {
    question: "¿La primera consulta siempre termina con un procedimiento?",
    answer:
      "No. La prioridad es definir el diagnóstico y la indicación. Algunos casos se manejan con tratamiento médico, otros requieren estudios o seguimiento y solo una parte se beneficia de un procedimiento en ese momento."
  },
  {
    question: "¿Cuánto cuesta la consulta médica en HAUTLAB Mérida?",
    answer: `La consulta médica tiene una inversión de ${siteConfig.consultationPrice}. Los procedimientos, estudios o tratamientos adicionales se explican por separado cuando están indicados.`
  },
  {
    question: "¿Necesito estudios antes de acudir?",
    answer:
      "No de forma rutinaria. Si ya cuentas con estudios, recetas, biopsias o fotografías de evolución conviene llevarlos. Cuando hace falta un estudio adicional, se solicita después de valorar qué información puede cambiar la conducta."
  },
  {
    question: "¿Dónde es la consulta en Mérida?",
    answer: `La atención se realiza en HAUTLAB, ${siteConfig.address}, con cita previa.`
  }
];

export default function MeridaDermatologiaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Dermatología clínica en Mérida",
        description:
          "Información sobre valoración médica de piel, cabello y uñas en HAUTLAB Mérida, con diagnóstico diferencial, tratamiento y seguimiento individualizado.",
        inLanguage: "es-MX",
        isPartOf: { "@id": `${siteConfig.url}#website` },
        about: { "@id": `${pageUrl}#service` },
        author: { "@id": `${siteConfig.url}#doctor` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Consulta médica de dermatología clínica en Mérida",
        serviceType: "Valoración médica de piel, cabello y uñas",
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" },
        url: pageUrl
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Mérida", item: `${siteConfig.url}/merida` },
          { "@type": "ListItem", position: 3, name: "Dermatología", item: pageUrl }
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
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <Link href="/merida" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone">
              Mérida <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">Consulta médica · HAUTLAB Mérida</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.92] tracking-[-.06em] text-bone">
              Dermatología clínica en Mérida.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Valoración médica de piel, cabello y uñas con un enfoque que prioriza diagnóstico diferencial, indicación y seguimiento antes de elegir un tratamiento o procedimiento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={buildWhatsAppLink("Hola, quiero agendar una consulta médica de piel, cabello o uñas en HAUTLAB Mérida.")}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_merida_dermatologia_hero"
                >
                  Agendar consulta <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contacto">Cómo solicitar valoración</Link>
              </Button>
            </div>
          </div>

          <Card className="p-7">
            <MapPin className="h-5 w-5 text-champagne" />
            <p className="mt-5 text-sm font-medium text-bone">San Ramón Norte · Mérida, Yucatán</p>
            <p className="mt-3 text-sm leading-7 text-muted">{siteConfig.address}</p>
            <p className="mt-3 text-xs leading-5 text-quiet">{siteConfig.hours}</p>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-champagne">Consulta médica</p>
              <p className="mt-2 text-lg font-medium text-bone">{siteConfig.consultationPrice}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <Stethoscope className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
              Una consulta no empieza por la receta.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Síntomas parecidos pueden corresponder a problemas distintos. La consulta organiza evolución, antecedentes, productos, medicamentos, tratamientos previos y hallazgos físicos para decidir qué explicación es más probable y qué conducta tiene sentido.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Historia clínica", "Inicio, evolución, síntomas, tratamientos previos, alergias, medicamentos y factores que modifican el caso."],
              ["02", "Exploración dirigida", "Revisión de la distribución, morfología y características relevantes de piel, cabello o uñas."],
              ["03", "Diagnóstico diferencial", "Se comparan las posibilidades que mejor explican el cuadro y se evita tratar solo por apariencia."],
              ["04", "Plan y seguimiento", "Se define tratamiento, tolerancia esperada, tiempos razonables y criterios para ajustar la conducta."]
            ].map(([number, title, body]) => (
              <Card key={number} className="p-6">
                <p className="text-xs tracking-[0.2em] text-champagne">{number}</p>
                <h3 className="mt-5 text-xl font-medium text-bone">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Motivos frecuentes de consulta</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
              Páginas clínicas para entender el problema antes de agendar.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {conditionLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.75rem] border border-line bg-background/55 p-6 transition hover:-translate-y-1 hover:border-champagne/40"
              >
                <h3 className="text-xl font-medium text-bone">{item.label}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">
                  Ver información <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <Card className="mt-6 p-6 sm:p-7">
            <div className="flex gap-4">
              <Search className="mt-1 h-5 w-5 shrink-0 text-champagne" />
              <div>
                <h3 className="text-lg font-medium text-bone">¿Tu problema no aparece en esta lista?</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  La consulta no se limita a las condiciones con página propia. También pueden valorarse dermatitis, cambios en uñas, infecciones cutáneas, lesiones nuevas, alteraciones del cuero cabelludo y otros problemas que requieran diagnóstico clínico.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
              Cuándo un estudio o procedimiento sí aporta información.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "Los estudios se solicitan cuando pueden confirmar, descartar o modificar una decisión clínica; no como requisito automático para toda consulta.",
              "La dermatoscopia, biopsia u otros procedimientos se indican cuando la exploración plantea una pregunta concreta que justifica realizarlos.",
              "En condiciones crónicas, la respuesta al tratamiento y la tolerancia forman parte del diagnóstico operativo y del seguimiento.",
              "Cuando una lesión, síntoma o evolución no encaja con el diagnóstico inicial, se reconsidera la conducta antes de escalar tratamiento."
            ].map((text) => (
              <div key={text} className="flex gap-3 rounded-2xl border border-line bg-white/[0.025] p-5 text-sm leading-7 text-muted">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-champagne" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-[min(900px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
            Antes de una consulta de piel, cabello o uñas en Mérida.
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

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild>
              <a
                href={buildWhatsAppLink("Hola, quiero consultar disponibilidad para una consulta médica en HAUTLAB Mérida.")}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_merida_dermatologia_footer"
              >
                Consultar disponibilidad <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs leading-5 text-quiet">Información orientativa. No confirma un diagnóstico ni sustituye una valoración individual.</p>
          </div>
        </div>
      </section>

      <script
        id="merida-dermatologia-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
