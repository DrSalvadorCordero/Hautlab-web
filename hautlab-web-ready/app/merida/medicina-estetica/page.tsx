import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/merida/medicina-estetica`;

export const metadata: Metadata = {
  title: "Medicina estética en Mérida | Diseño facial | HAUTLAB",
  description:
    "Valoración de medicina estética y diseño facial en Mérida. Anatomía, movimiento, proporción, antecedentes y objetivos se revisan antes de indicar un procedimiento.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Medicina estética en Mérida | Diseño facial | HAUTLAB",
    description:
      "Conoce el enfoque de valoración para toxina botulínica, ácido hialurónico y diseño facial en HAUTLAB Mérida.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const procedureLinks = [
  {
    title: "Rellenos faciales",
    href: "/merida/rellenos-faciales",
    text: "Página matriz sobre ácido hialurónico, selección de zonas, producto, cantidad, riesgos y cuándo conviene no añadir volumen."
  },
  {
    title: "Rinomodelación",
    href: "/procedimientos/rinomodelacion",
    text: "Valoración de estructura nasal, proporción del perfil, límites anatómicos y riesgo antes de considerar ácido hialurónico."
  },
  {
    title: "Toxina botulínica",
    href: "/procedimientos/toxina-botulinica",
    text: "Análisis de fuerza, movimiento y asimetrías para modular músculos concretos sin aplicar un mapa idéntico a todos los rostros."
  },
  {
    title: "Labios",
    href: "/procedimientos/labios",
    text: "Proporción, soporte, contorno y relación con el resto del rostro antes de decidir volumen o definición."
  },
  {
    title: "Ojeras",
    href: "/procedimientos/ojeras",
    text: "Se distingue pérdida de soporte, pigmento, vascularidad, bolsas y anatomía antes de decidir si un relleno tiene sentido."
  },
  {
    title: "Mentón",
    href: "/procedimientos/menton",
    text: "Proyección y relación con labios, nariz y mandíbula para decidir si modificar soporte mejora realmente el perfil."
  },
  {
    title: "Mandíbula",
    href: "/procedimientos/mandibula",
    text: "Lectura del contorno inferior, soporte y proporciones antes de plantear definición o corrección focal."
  },
  {
    title: "Armonización facial",
    href: "/procedimientos/armonizacion-facial",
    text: "Plan global por prioridades para evitar tratar zonas aisladas sin considerar el equilibrio del rostro completo."
  }
];

const faq = [
  {
    question: "¿Qué incluye una valoración de medicina estética en Mérida?",
    answer:
      "Se revisan antecedentes, procedimientos previos, anatomía, movimiento, proporciones, objetivos y factores de riesgo. Después se define si existe una indicación razonable, qué alternativa puede aportar más y qué conviene evitar."
  },
  {
    question: "¿Necesito saber qué procedimiento quiero antes de agendar?",
    answer:
      "No. Puedes acudir con un objetivo o una preocupación concreta. La valoración sirve precisamente para decidir si el problema corresponde a toxina botulínica, ácido hialurónico, calidad de piel, otra estrategia o ninguna intervención."
  },
  {
    question: "¿La medicina estética siempre implica usar relleno?",
    answer:
      "No. Dependiendo del caso puede ser más razonable trabajar movimiento, calidad de piel, soporte, proporción o simplemente no añadir volumen. El plan se construye según la anatomía y no según una cantidad predeterminada de producto."
  },
  {
    question: "¿Cómo se busca un resultado natural?",
    answer:
      "Con objetivos limitados, selección cuidadosa de indicaciones y cambios proporcionales al rostro. Naturalidad no significa ausencia de efecto; significa que el resultado no domina la identidad facial ni obliga a perseguir volumen adicional."
  },
  {
    question: "¿Dónde se realiza la valoración en Mérida?",
    answer: `La atención se realiza en HAUTLAB, ${siteConfig.address}, únicamente con cita previa.`
  }
];

export default function MeridaMedicalAestheticsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Medicina estética en Mérida",
        description:
          "Información sobre valoración de medicina estética, diseño facial y procedimientos por indicación en HAUTLAB Mérida.",
        inLanguage: "es-MX",
        about: { "@id": `${pageUrl}#service` },
        isPartOf: { "@id": `${siteConfig.url}#website` },
        author: { "@id": `${siteConfig.url}#doctor` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Medicina estética y diseño facial en Mérida",
        serviceType: "Medicina estética y diseño facial",
        description:
          "Valoración de anatomía, movimiento, proporción y objetivos antes de indicar procedimientos de medicina estética.",
        provider: { "@id": `${siteConfig.url}#clinic` },
        areaServed: { "@type": "City", name: "Mérida, Yucatán" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Mérida", item: `${siteConfig.url}/merida` },
          { "@type": "ListItem", position: 3, name: "Medicina estética", item: pageUrl }
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
            <Link href="/merida" className="text-sm text-muted transition hover:text-bone">
              Mérida / Medicina estética
            </Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Diseño facial por indicación</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.92] tracking-[-.06em] text-bone">
              Medicina estética en Mérida, sin convertir el rostro en un catálogo de procedimientos.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              La valoración parte de anatomía, movimiento, proporciones, antecedentes y objetivos. El procedimiento se elige después, y solo cuando existe una razón suficiente para hacerlo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={buildWhatsAppLink("Hola, quiero agendar una valoración de medicina estética en HAUTLAB Mérida.")}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_merida_aesthetics_hero"
                >
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/procedimientos">Explorar procedimientos</Link>
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
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <Sparkles className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.6rem,5vw,4.7rem)] leading-[.95] tracking-[-.05em] text-bone">
              Primero se decide qué problema vale la pena tratar.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Dos personas que piden el mismo procedimiento pueden necesitar decisiones distintas. La meta no es aplicar una técnica por solicitud, sino entender qué cambio sería coherente con el rostro y qué riesgo no vale la pena asumir.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Anatomía", "Soporte, proporciones, asimetrías y relación entre tercio superior, medio e inferior."],
              ["02", "Movimiento", "Fuerza muscular, gestos, compensaciones y cambios que aparecen al hablar o sonreír."],
              ["03", "Antecedentes", "Rellenos, toxina, cirugías, complicaciones, medicamentos y procedimientos previos."],
              ["04", "Objetivo", "Qué quieres modificar, cuánto cambio esperas y si ese objetivo puede lograrse de forma razonable."],
              ["05", "Indicación", "Qué técnica puede aportar valor, qué alternativa sería mejor y cuándo conviene no intervenir."],
              ["06", "Seguimiento", "Revisión cuando la técnica o la evolución del caso justifican comprobar respuesta y seguridad."]
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
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Procedimientos y objetivos</p>
            <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.7rem)] leading-[.95] tracking-[-.05em] text-bone">
              Explora la técnica después de entender la indicación.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Estas páginas explican límites, candidatura y proceso. No sustituyen la valoración individual ni implican que todas las opciones deban combinarse.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {procedureLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.75rem] border border-line bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-champagne/40 focus:outline-none focus:ring-2 focus:ring-champagne"
              >
                <h3 className="text-xl font-medium text-bone">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">
                  Entender el enfoque <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
              Cuándo una valoración puede terminar en “no hacer”.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "Cuando el objetivo exige una modificación estructural que un procedimiento no quirúrgico no puede ofrecer.",
              "Cuando el riesgo anatómico, los antecedentes o un procedimiento previo hacen que la relación riesgo-beneficio sea desfavorable.",
              "Cuando añadir volumen resolvería una preocupación puntual pero empeoraría la proporción del rostro completo.",
              "Cuando las expectativas dependen de un resultado que no puede predecirse o mantenerse de forma razonable.",
              "Cuando primero conviene tratar inflamación, barrera cutánea, pigmento u otra condición clínica."
            ].map((item) => (
              <Card key={item} className="p-5 text-sm leading-7 text-muted">
                {item}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-[min(900px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
            Antes de una valoración de medicina estética.
          </h2>
          <div className="mt-9 divide-y divide-line border-y border-line">
            {faq.map((item) => (
              <details key={item.question} className="py-5">
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
                href={buildWhatsAppLink("Hola, quiero consultar disponibilidad para medicina estética en HAUTLAB Mérida.")}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_merida_aesthetics_footer"
              >
                Consultar disponibilidad <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs leading-5 text-quiet">Información orientativa. La indicación final depende de una valoración individual.</p>
          </div>
        </div>
      </section>

      <script
        id="merida-medical-aesthetics-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
