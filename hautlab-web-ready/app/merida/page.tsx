import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Stethoscope, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/merida`;

export const metadata: Metadata = {
  title: "Dermatología clínica y medicina estética en Mérida | HAUTLAB",
  description:
    "Atención de piel, cabello y uñas, medicina estética y diseño facial en HAUTLAB Mérida con el Dr. Salvador Cordero. Valoración primero y atención con cita previa.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Dermatología clínica y medicina estética en Mérida | HAUTLAB",
    description:
      "Conoce la atención médica, los procedimientos y el proceso de valoración de HAUTLAB en San Ramón Norte, Mérida.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const clinicalLinks = [
  { label: "Acné", href: "/procedimientos/acne" },
  { label: "Rosácea", href: "/procedimientos/rosacea" },
  { label: "Melasma", href: "/procedimientos/melasma" },
  { label: "Alopecia y caída de cabello", href: "/procedimientos/alopecia" }
];

const aestheticLinks = [
  { label: "Rinomodelación", href: "/procedimientos/rinomodelacion" },
  { label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" },
  { label: "Labios", href: "/procedimientos/labios" },
  { label: "Mentón", href: "/procedimientos/menton" },
  { label: "Mandíbula", href: "/procedimientos/mandibula" },
  { label: "Ojeras", href: "/procedimientos/ojeras" }
];

const faq = [
  {
    question: "¿Dónde se encuentra HAUTLAB en Mérida?",
    answer: `HAUTLAB se encuentra en ${siteConfig.address}. La atención es únicamente con cita previa.`
  },
  {
    question: "¿Qué tipo de valoración puedo solicitar en Mérida?",
    answer:
      "Puedes solicitar valoración médica por problemas de piel, cabello o uñas, así como valoración de medicina estética y diseño facial. La indicación se define después de revisar antecedentes, anatomía, objetivos y posibles riesgos."
  },
  {
    question: "¿Puedo agendar directamente un procedimiento?",
    answer:
      "La solicitud puede iniciar por un procedimiento concreto, pero la candidatura se confirma durante la valoración. Si otra alternativa ofrece una relación riesgo-beneficio más adecuada, se explica antes de intervenir."
  },
  {
    question: "¿Atienden pacientes que viajan a Mérida?",
    answer:
      "Sí se pueden coordinar valoraciones para pacientes visitantes. Conviene informar desde el inicio las fechas de estancia para considerar revisión, recuperación y cualquier seguimiento que el caso pueda requerir."
  }
];

export default function MeridaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Dermatología clínica y medicina estética en Mérida",
        description:
          "Información sobre la atención médica, medicina estética y proceso de valoración de HAUTLAB en Mérida, Yucatán.",
        inLanguage: "es-MX",
        about: { "@id": `${siteConfig.url}#clinic` },
        mainEntity: { "@id": `${siteConfig.url}#clinic` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Mérida", item: pageUrl }
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
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">HAUTLAB Mérida</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,6.3rem)] leading-[.92] tracking-[-.06em] text-bone">
              Dermatología clínica y medicina estética en Mérida.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Atención médica de piel, cabello y uñas, junto con valoración de medicina estética y diseño facial. El punto de partida es definir el problema, la indicación y los límites antes de elegir un procedimiento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={buildWhatsAppLink("Hola, quiero agendar una valoración en HAUTLAB Mérida.")}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_merida_hero"
                >
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contacto">Ver proceso de contacto</Link>
              </Button>
            </div>
          </div>

          <Card className="p-6 sm:p-7">
            <MapPin className="h-5 w-5 text-champagne" />
            <p className="mt-5 text-sm font-medium text-bone">San Ramón Norte · Mérida, Yucatán</p>
            <p className="mt-3 text-sm leading-7 text-muted">{siteConfig.address}</p>
            <p className="mt-3 text-xs leading-5 text-quiet">{siteConfig.hours}</p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Atención médica</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
              Si buscas atención dermatológica en Mérida, el diagnóstico va antes del tratamiento.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Una misma lesión, brote o cambio de color puede tener causas distintas. La consulta ordena antecedentes, exploración, tratamientos previos y factores que modifican el riesgo antes de decidir entre cuidado domiciliario, medicamento, procedimiento o seguimiento.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="p-7">
              <Stethoscope className="h-5 w-5 text-champagne" />
              <h3 className="mt-5 text-xl font-medium text-bone">Dermatología clínica</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Valoración de piel, cabello y uñas con un plan que prioriza diagnóstico, tolerancia y seguimiento.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {clinicalLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-champagne/40 hover:text-bone">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link href="/merida/dermatologia" className="mt-7 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
                Explorar dermatología clínica <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-7">
              <Sparkles className="h-5 w-5 text-champagne" />
              <h3 className="mt-5 text-xl font-medium text-bone">Medicina estética y diseño facial</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                La valoración revisa proporciones, movimiento, antecedentes de procedimientos y objetivos antes de decidir si existe una indicación razonable.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {aestheticLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-champagne/40 hover:text-bone">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link href="/merida/medicina-estetica" className="mt-7 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
                Explorar medicina estética <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.95] tracking-[-.05em] text-bone">
              Cómo funciona la valoración en Mérida.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["1", "Motivo y antecedentes", "Se revisan evolución, síntomas, tratamientos previos, medicamentos, procedimientos y objetivo principal."],
              ["2", "Exploración", "Se define qué hallazgos son relevantes y qué información adicional hace falta antes de intervenir."],
              ["3", "Indicación", "Se explican opciones, límites, riesgos, alternativas y situaciones en las que conviene no realizar un procedimiento."],
              ["4", "Seguimiento", "Cuando el caso lo requiere, se establece revisión para valorar respuesta, tolerancia o evolución clínica."]
            ].map(([number, title, body]) => (
              <Card key={number} className="p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Paso {number}</p>
                <h3 className="mt-4 text-lg font-medium text-bone">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-[min(900px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
            Antes de agendar en HAUTLAB Mérida.
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
                href={buildWhatsAppLink("Hola, quiero consultar disponibilidad para una valoración en HAUTLAB Mérida.")}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_merida_footer"
              >
                Consultar disponibilidad <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs leading-5 text-quiet">Información orientativa. La indicación final depende de una valoración individual.</p>
          </div>
        </div>
      </section>

      <script id="merida-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
