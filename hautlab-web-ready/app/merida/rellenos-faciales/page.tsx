import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/merida/rellenos-faciales`;

export const metadata: Metadata = {
  title: "Rellenos faciales en Mérida | Ácido hialurónico | HAUTLAB",
  description:
    "Valoración para rellenos faciales con ácido hialurónico en Mérida. Zonas, candidatura, límites, riesgos y alternativas antes de decidir cuánto y dónde tratar.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Rellenos faciales en Mérida | Ácido hialurónico | HAUTLAB",
    description:
      "Conoce el enfoque HAUTLAB para ácido hialurónico: anatomía, proporción, producto, riesgos y seguimiento antes de añadir volumen.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const zones = [
  {
    title: "Nariz",
    href: "/procedimientos/rinomodelacion",
    text: "La rinomodelación exige valorar anatomía vascular, proyección, perfil y si el objetivo puede lograrse sin cirugía."
  },
  {
    title: "Labios",
    href: "/procedimientos/labios",
    text: "Puede trabajarse soporte, borde, simetría o proyección; aumentar volumen no es el objetivo automático."
  },
  {
    title: "Ojeras",
    href: "/procedimientos/ojeras",
    text: "Primero se distingue hundimiento, pigmento, bolsas, edema y calidad de piel porque no toda ojera debe rellenarse."
  },
  {
    title: "Mentón",
    href: "/procedimientos/menton",
    text: "La proyección se interpreta junto con nariz, labios y mandíbula para evitar corregir una zona aislada a costa del perfil completo."
  },
  {
    title: "Mandíbula",
    href: "/procedimientos/mandibula",
    text: "El relleno puede aportar soporte en puntos seleccionados, pero no sustituye el manejo de grasa, flacidez o estructura ósea."
  }
];

const faq = [
  {
    question: "¿Qué es un relleno facial con ácido hialurónico?",
    answer:
      "Es un producto inyectable utilizado para aportar soporte, modificar transiciones o recuperar volumen en zonas seleccionadas. La indicación depende de la anatomía, el objetivo, el tipo de producto y el balance entre beneficio y riesgo."
  },
  {
    question: "¿Todos los rellenos de ácido hialurónico sirven para cualquier zona?",
    answer:
      "No. Los productos tienen propiedades distintas y una misma consistencia no es adecuada para todas las zonas o planos. La selección se hace según soporte requerido, movilidad, grosor de tejidos y objetivo anatómico."
  },
  {
    question: "¿El ácido hialurónico siempre puede revertirse?",
    answer:
      "La hialuronidasa puede utilizarse para degradar ciertos rellenos de ácido hialurónico cuando existe indicación, pero eso no convierte el procedimiento en libre de riesgo ni garantiza revertir de forma completa todas las complicaciones."
  },
  {
    question: "¿Cuánto duran los rellenos faciales?",
    answer:
      "La duración varía por producto, zona, movilidad, técnica y respuesta individual. No conviene asumir un tiempo idéntico para labios, mentón, nariz, mandíbula u ojeras."
  },
  {
    question: "¿Se puede tratar más de una zona el mismo día?",
    answer:
      "En algunos casos sí, pero no es una regla. Un plan por etapas puede ser más útil cuando se necesita observar proporción, inflamación e integración antes de decidir si otra zona realmente requiere intervención."
  },
  {
    question: "¿Dónde se realiza la valoración para rellenos faciales en Mérida?",
    answer: `La atención se realiza en HAUTLAB, ${siteConfig.address}, únicamente con cita previa.`
  }
];

const risks = [
  "Inflamación, sensibilidad, hematomas, asimetría o irregularidad temporal.",
  "Nódulos, reacción inflamatoria, infección o resultado que requiera ajuste o disolución cuando esté indicado.",
  "La inyección dentro o alrededor de un vaso puede comprometer la circulación y producir lesión de piel o tejidos.",
  "Las complicaciones visuales o neurológicas son raras, graves y requieren atención inmediata."
];

const warningSigns = [
  "Dolor intenso o progresivo que no corresponde a la evolución explicada.",
  "Piel pálida, grisácea, violácea, moteada o un cambio de color que se extiende.",
  "Visión borrosa nueva, pérdida de visión, caída del párpado, debilidad, dificultad para hablar o síntomas neurológicos.",
  "Fiebre, secreción o inflamación y enrojecimiento que aumentan rápidamente."
];

export default function MeridaFacialFillersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Rellenos faciales con ácido hialurónico en Mérida",
        description:
          "Información sobre valoración, zonas, límites, riesgos y seguimiento de rellenos faciales con ácido hialurónico en HAUTLAB Mérida.",
        inLanguage: "es-MX",
        about: { "@id": `${pageUrl}#service` },
        isPartOf: { "@id": `${siteConfig.url}#website` },
        author: { "@id": `${siteConfig.url}#doctor` },
        reviewedBy: { "@id": `${siteConfig.url}#doctor` },
        dateModified: "2026-08-11",
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Rellenos faciales con ácido hialurónico en Mérida",
        serviceType: "Valoración y aplicación de rellenos faciales con ácido hialurónico",
        description:
          "Valoración anatómica para decidir zona, producto, cantidad, límites y seguimiento antes de utilizar rellenos faciales.",
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Mérida", item: `${siteConfig.url}/merida` },
          { "@type": "ListItem", position: 3, name: "Medicina estética", item: `${siteConfig.url}/merida/medicina-estetica` },
          { "@type": "ListItem", position: 4, name: "Rellenos faciales", item: pageUrl }
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
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
          <div>
            <Link href="/merida/medicina-estetica" className="text-sm text-muted transition hover:text-bone">
              Mérida / Medicina estética / Rellenos faciales
            </Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Ácido hialurónico por indicación</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.92] tracking-[-.06em] text-bone">
              Rellenos faciales en Mérida: primero anatomía, después producto.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              El ácido hialurónico puede aportar soporte, proyección o transición en zonas seleccionadas. La decisión correcta no empieza por cuántas jeringas usar, sino por qué cambio tiene sentido y qué riesgo implica en ese rostro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={buildWhatsAppLink("Hola, quiero agendar una valoración para rellenos faciales con ácido hialurónico en HAUTLAB Mérida.")}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_merida_fillers_hero"
                >
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/merida/medicina-estetica">Ver medicina estética</Link>
              </Button>
            </div>
          </div>

          <Card className="p-6 sm:p-7">
            <MapPin className="h-5 w-5 text-champagne" />
            <p className="mt-5 text-sm font-medium text-bone">HAUTLAB Mérida · San Ramón Norte</p>
            <p className="mt-3 text-sm leading-7 text-muted">{siteConfig.address}</p>
            <p className="mt-3 text-xs leading-5 text-quiet">{siteConfig.hours}</p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Syringe className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.6rem,5vw,4.7rem)] leading-[.95] tracking-[-.05em] text-bone">
              Un relleno no se elige solo por la zona.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Antes de aplicar se revisan soporte, grosor de tejidos, movilidad, vascularización relevante, procedimientos previos y la relación de esa zona con el resto del rostro.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Objetivo", "Definir si se busca soporte, proyección, transición, simetría o recuperación de volumen."],
              ["02", "Anatomía", "Valorar estructura, tejidos, movilidad y antecedentes que cambian la seguridad o el resultado."],
              ["03", "Producto", "Elegir propiedades y plano de aplicación en función de la zona y no por una marca o jeringa predeterminada."],
              ["04", "Cantidad", "Usar lo necesario para el objetivo acordado; más producto no equivale a mejor resultado."],
              ["05", "Riesgos", "Explicar complicaciones esperables, riesgos graves y signos que requieren atención urgente."],
              ["06", "Seguimiento", "Revisar integración y evolución cuando el procedimiento o la zona lo justifican."]
            ].map(([number, title, text]) => (
              <Card key={number} className="p-6">
                <p className="text-xs tracking-[0.2em] text-champagne">{number}</p>
                <h3 className="mt-5 text-xl font-medium text-bone">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft/25 py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Zonas que pueden valorarse</p>
            <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.7rem)] leading-[.95] tracking-[-.05em] text-bone">
              La misma sustancia cumple funciones distintas según la anatomía.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {zones.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.75rem] border border-line bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-champagne/40 focus:outline-none focus:ring-2 focus:ring-champagne"
              >
                <h3 className="text-xl font-medium text-bone">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">
                  Ver valoración específica <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-2">
          <div>
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">Riesgos que deben explicarse antes de aplicar.</h2>
            <div className="mt-7 space-y-3">
              {risks.map((item) => (
                <Card key={item} className="p-5 text-sm leading-7 text-muted">{item}</Card>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Signos de alarma</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">Después de un relleno, algunos síntomas no deben esperar.</h2>
            <div className="mt-7 space-y-3">
              {warningSigns.map((item) => (
                <Card key={item} className="p-5 text-sm leading-7 text-muted">{item}</Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
        <div className="mx-auto w-[min(900px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">Ácido hialurónico sin simplificar decisiones complejas.</h2>
          <div className="mt-9 divide-y divide-line border-y border-line">
            {faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-6 text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{item.question}</summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Revisión médica</p>
            <p className="mt-5 text-lg font-medium text-bone">{siteConfig.legalDoctorName}</p>
            <p className="mt-2 text-sm text-muted">{siteConfig.professionalTitle} · {siteConfig.practiceArea}</p>
            <p className="mt-1 text-xs text-quiet">{siteConfig.professionalLicense}</p>
            <p className="mt-5 text-xs text-quiet">Última revisión: 11 de agosto de 2026.</p>
          </Card>

          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Fuentes de seguridad</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <a className="block text-bone underline decoration-line underline-offset-4" href="https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers" target="_blank" rel="noreferrer">
                FDA · Dermal Fillers (Soft Tissue Fillers)
              </a>
              <a className="block text-bone underline decoration-line underline-offset-4" href="https://www.fda.gov/consumers/consumer-updates/dermal-filler-dos-and-donts-wrinkles-lips-and-more" target="_blank" rel="noreferrer">
                FDA · Dermal Filler Do’s and Don’ts
              </a>
              <p>Información educativa. La candidatura, técnica y seguimiento se definen durante una valoración individual.</p>
            </div>
          </Card>
        </div>

        <div className="mx-auto mt-10 flex w-[min(900px,calc(100%-32px))] flex-wrap items-center gap-4">
          <Button asChild>
            <a
              href={buildWhatsAppLink("Hola, quiero consultar disponibilidad para una valoración de rellenos faciales en HAUTLAB Mérida.")}
              target="_blank"
              rel="noreferrer"
              data-event="whatsapp_merida_fillers_footer"
            >
              Consultar disponibilidad <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="text-xs leading-5 text-quiet">No se confirma candidatura ni cantidad de producto sin valoración.</p>
        </div>
      </section>

      <script id="merida-fillers-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
