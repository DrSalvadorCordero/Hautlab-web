import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { CabinaAnalytics } from "@/components/cabina/cabina-analytics";
import { CabinaIntakeForm } from "@/components/cabina/cabina-intake-form";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  cabinaContent,
  visibleCabinaPromotions,
  visibleCabinaReviews,
  visibleCabinaServices
} from "@/lib/cabina-content";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/cabina`;

export const metadata: Metadata = {
  title: "Cabina Dermatocosmética HAUTLAB | Faciales en Mérida",
  description: "Protocolos faciales personalizados y cuidado dermatocosmético profesional en HAUTLAB Mérida. Cabina coordinada por Karen Cruz con respaldo clínico.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Cabina Dermatocosmética HAUTLAB | Faciales en Mérida",
    description: "Protocolos faciales personalizados dentro del ecosistema clínico de HAUTLAB, coordinados por Karen Cruz.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const medicalReferral = [
  "Acné inflamatorio moderado o severo",
  "Brotes persistentes",
  "Dermatitis o rosácea activa",
  "Infecciones o lesiones sospechosas",
  "Irritación intensa o reacciones alérgicas",
  "Pigmentación de origen no identificado",
  "Uso de isotretinoína",
  "Embarazo con dermatosis activa",
  "Dolor, secreción, costras o sangrado",
  "Cualquier condición que requiera diagnóstico o prescripción"
];

const experience = [
  ["01", "Valoración", "Identificación de objetivos, antecedentes y necesidades de la piel."],
  ["02", "Selección del protocolo", "Elección de productos, técnicas y tecnología según cada caso."],
  ["03", "Sesión", "Aplicación del protocolo en un entorno profesional, privado y ordenado."],
  ["04", "Seguimiento", "Indicaciones posteriores, recomendaciones de cuidado y ajuste de futuras sesiones."]
];

function PhotoOrPlaceholder({ path, label, priority = false }: { path: string | null; label: string; priority?: boolean }) {
  return path ? (
    <Image src={path} alt={label} fill priority={priority} sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
  ) : (
    <div className="absolute inset-0 grid place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-line bg-white/[0.04] text-champagne">
          <ImageIcon className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-champagne">Activo fotográfico pendiente</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function CabinaPage() {
  const karenPhoto = cabinaContent.coordinator.photo ?? cabinaContent.gallery.find((item) => item.id === "karen-portrait")?.path ?? null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
        "@id": `${pageUrl}#unit`,
        name: cabinaContent.unitName,
        url: pageUrl,
        description: cabinaContent.hero.subtitle,
        telephone: siteConfig.whatsappDisplay,
        parentOrganization: { "@type": "MedicalClinic", "@id": `${siteConfig.url}#clinic`, name: "HAUTLAB", url: siteConfig.url },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle 43 #299A x 32A, San Ramón Norte",
          addressLocality: "Mérida",
          addressRegion: "Yucatán",
          postalCode: "97117",
          addressCountry: "MX"
        },
        employee: [
          { "@id": `${siteConfig.url}/cabina/karen-cruz#person` },
          { "@id": `${siteConfig.url}#physician` }
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Protocolos dermatocosméticos HAUTLAB",
          itemListElement: visibleCabinaServices.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              description: service.description,
              provider: { "@id": `${pageUrl}#unit` }
            }
          }))
        }
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/cabina/karen-cruz#person`,
        name: cabinaContent.coordinator.name,
        jobTitle: cabinaContent.coordinator.role,
        url: `${siteConfig.url}/cabina/karen-cruz`,
        worksFor: { "@id": `${siteConfig.url}#clinic` }
      },
      {
        "@type": "Physician",
        "@id": `${siteConfig.url}#physician`,
        name: cabinaContent.medicalDirection.name,
        jobTitle: cabinaContent.medicalDirection.role,
        identifier: cabinaContent.medicalDirection.license,
        worksFor: { "@id": `${siteConfig.url}#clinic` }
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cabinaContent.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Cabina Dermatocosmética", item: pageUrl }
    ]
  };

  return (
    <main className="pb-24 lg:pb-0">
      <CabinaAnalytics />
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Cabina Dermatocosmética" }]} />

      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-line bg-white/[0.035] px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted">
              <span className="text-bone">HAUTLAB</span><span className="h-1 w-1 rounded-full bg-champagne" /> Cabina Dermatocosmética
            </div>
            <h1 className="max-w-5xl font-serif text-[clamp(3.1rem,7vw,6.4rem)] leading-[.9] tracking-[-.065em] text-bone">{cabinaContent.hero.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{cabinaContent.hero.subtitle}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-quiet">{cabinaContent.hero.description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={buildWhatsAppLink(cabinaContent.booking.generalMessage)} target="_blank" rel="noreferrer" data-event="cabina_reserve_hero">
                  {cabinaContent.booking.primaryLabel} <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg"><a href="#servicios">{cabinaContent.booking.servicesLabel}</a></Button>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-line bg-[#11100e] shadow-calm">
            <PhotoOrPlaceholder path={karenPhoto} label="Espacio reservado para una fotografía real de Karen dentro de HAUTLAB, con uniforme clínico y encuadre editorial." priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-line bg-background/88 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Coordinada por</p>
              <p className="mt-2 text-2xl font-medium text-bone">{cabinaContent.coordinator.name}</p>
              <p className="mt-2 text-sm text-muted">Dentro de los estándares de atención, higiene y seguimiento de HAUTLAB.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Criterio HAUTLAB</p>
            <h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">{cabinaContent.positioning.title}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted">
            {cabinaContent.positioning.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a href={buildWhatsAppLink(cabinaContent.booking.informationMessage)} target="_blank" rel="noreferrer" data-event="cabina_whatsapp_positioning" className="inline-flex items-center gap-2 pt-3 text-sm text-bone transition hover:text-champagne">Solicitar orientación <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      {visibleCabinaPromotions.length > 0 && (
        <section className="border-b border-line bg-soft/25 py-14">
          <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-4 md:grid-cols-2">
            {visibleCabinaPromotions.map((promotion) => (
              <Card key={promotion.id} className="p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Información vigente</p>
                <h2 className="mt-3 text-2xl font-medium text-bone">{promotion.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted">{promotion.description}</p>
                {promotion.validUntil && <p className="mt-4 text-xs text-quiet">Vigencia: {promotion.validUntil}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section id="servicios" className="scroll-mt-28 border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Protocolos disponibles</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.94] tracking-[-.055em] text-bone">Servicios dermatocosméticos seleccionados por valoración.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleCabinaServices.map((service) => {
              const message = `Hola, me interesa el servicio de ${service.name} en la Cabina Dermatocosmética de HAUTLAB. Me gustaría recibir información y conocer disponibilidad.`;
              return (
                <Card key={service.id} className="flex h-full flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs uppercase tracking-[0.17em] text-champagne">Cabina HAUTLAB</p><h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">{service.name}</h3></div>
                    <Clock3 className="h-5 w-5 shrink-0 text-champagne" />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-muted">{service.description}</p>
                  <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-background/35 p-4 text-xs leading-5 text-muted sm:grid-cols-2">
                    <div><span className="block uppercase tracking-[0.14em] text-quiet">Duración</span><span className="mt-1 block text-bone">{service.duration}</span></div>
                    <div><span className="block uppercase tracking-[0.14em] text-quiet">Inversión</span><span className="mt-1 block text-bone">{service.price}</span></div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-quiet"><strong className="font-medium text-muted">Puede considerarse para:</strong> {service.indications}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <a href="#valoracion" data-event={`cabina_service_select_${service.id}`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 text-xs font-medium text-bone transition hover:border-champagne/45">Solicitar valoración</a>
                    <a href={buildWhatsAppLink(message)} target="_blank" rel="noreferrer" data-event={`cabina_service_reserve_${service.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-champagne px-4 text-xs font-medium text-background transition hover:bg-bone">Reservar <ArrowRight className="h-3.5 w-3.5" /></a>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="mt-9 text-center"><Button asChild size="lg"><a href={buildWhatsAppLink(cabinaContent.booking.generalMessage)} target="_blank" rel="noreferrer" data-event="cabina_reserve_after_services">Consultar disponibilidad <CalendarDays className="h-4 w-4" /></a></Button></div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-line bg-white/[0.025]">
            <PhotoOrPlaceholder path={karenPhoto} label="Este espacio utilizará exclusivamente una fotografía profesional real de Karen dentro de HAUTLAB." />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Coordinación de cabina</p>
            <h2 className="mt-4 font-serif text-[clamp(3rem,6vw,5.2rem)] leading-[.92] tracking-[-.06em] text-bone">{cabinaContent.coordinator.name}</h2>
            <p className="mt-4 text-base font-medium text-bone">{cabinaContent.coordinator.role}</p>
            <p className="mt-6 text-base leading-8 text-muted">{cabinaContent.coordinator.description}</p>
            <div className="mt-7 rounded-2xl border border-line bg-white/[0.025] p-5 text-sm leading-7 text-muted"><ShieldCheck className="mb-4 h-5 w-5 text-champagne" />{cabinaContent.coordinator.medicalBoundary}</div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild><a href={buildWhatsAppLink(cabinaContent.booking.generalMessage)} target="_blank" rel="noreferrer" data-event="cabina_reserve_after_karen">Reservar <ArrowRight className="h-4 w-4" /></a></Button>
              <Button asChild variant="outline"><Link href="/cabina/karen-cruz" data-event="cabina_karen_profile_click">Ver perfil profesional</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10 max-w-3xl"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Experiencia del paciente</p><h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.94] tracking-[-.055em] text-bone">Un proceso claro, de la valoración al seguimiento.</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{experience.map(([number, title, text]) => <Card key={number} className="p-6"><p className="text-xs tracking-[0.2em] text-champagne">{number}</p><h3 className="mt-7 text-xl font-medium text-bone">{title}</h3><p className="mt-4 text-sm leading-7 text-muted">{text}</p></Card>)}</div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-2">
          <Card className="p-7 sm:p-8"><Stethoscope className="h-6 w-6 text-champagne" /><p className="mt-7 text-xs uppercase tracking-[0.18em] text-champagne">Referencia médica</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">¿Cuándo se requiere valoración dermatológica?</h2><div className="mt-6 grid gap-3">{medicalReferral.map((item) => <div key={item} className="flex gap-3 text-sm leading-6 text-muted"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-champagne" />{item}</div>)}</div><p className="mt-7 border-t border-line pt-6 text-sm leading-7 text-bone">La cabina complementa el cuidado profesional de la piel, pero no sustituye una consulta dermatológica.</p></Card>
          <Card className="border-champagne/25 bg-white/[0.035] p-7 sm:p-8"><Sparkles className="h-6 w-6 text-champagne" /><p className="mt-7 text-xs uppercase tracking-[0.18em] text-champagne">Respaldo HAUTLAB</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Una unidad integrada a HAUTLAB</h2><p className="mt-6 text-sm leading-7 text-muted">La Cabina Dermatocosmética forma parte de HAUTLAB y trabaja bajo protocolos de atención, imagen, higiene, documentación y seguimiento definidos por la clínica.</p><p className="mt-4 text-sm leading-7 text-muted">Cuando el caso lo requiere, el paciente puede ser canalizado a consulta dermatológica o medicina estética con el Dr. Salvador Cordero.</p><div className="mt-7 rounded-2xl border border-line bg-background/40 p-5"><p className="text-sm font-medium text-bone">{cabinaContent.medicalDirection.name}</p><p className="mt-2 text-sm text-muted">{cabinaContent.medicalDirection.role}</p><p className="mt-1 text-xs text-quiet">{cabinaContent.medicalDirection.license}</p></div><Link href="/#metodo" className="mt-7 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">Conocer al Dr. Salvador Cordero <ArrowRight className="h-4 w-4" /></Link></Card>
        </div>
      </section>

      <section id="valoracion" className="scroll-mt-28 border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10 max-w-4xl"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Valoración</p><h2 className="mt-4 font-serif text-[clamp(2.9rem,5.5vw,5.3rem)] leading-[.92] tracking-[-.06em] text-bone">Tu protocolo comienza con una valoración</h2><p className="mt-6 max-w-3xl text-base leading-8 text-muted">Antes de iniciar, revisamos el estado actual de la piel, sensibilidad, productos utilizados, antecedentes relevantes y objetivos. Esto permite seleccionar el protocolo más adecuado y detectar situaciones que requieren valoración médica dermatológica.</p></div>
          <CabinaIntakeForm />
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Reseñas verificadas</p><h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">Experiencias específicas de la cabina.</h2></div>
            {visibleCabinaReviews.length > 0 ? (
              <div className="grid gap-4">
                {visibleCabinaReviews.map((review) => (
                  <Card key={review.id} className="p-7">
                    <blockquote className="text-base leading-8 text-muted">“{review.quote}”</blockquote>
                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quiet">
                      <span className="font-medium text-bone">{review.initials}</span>
                      {review.service && <span>{review.service}</span>}
                      {review.date && <span>{review.date}</span>}
                      {review.sourceUrl && <a href={review.sourceUrl} target="_blank" rel="noreferrer" className="text-bone underline decoration-line underline-offset-4">Fuente verificada</a>}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-7"><p className="text-base leading-8 text-muted">{cabinaContent.reviewsPlaceholder}</p><p className="mt-5 text-xs leading-5 text-quiet">La sección no atribuye a la cabina reseñas generales de HAUTLAB.</p></Card>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Archivo visual</p><h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.7rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">Fotografía real, clínica y editorial, sin recurrir a clichés de spa.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cabinaContent.gallery.map((item) => (
              <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line bg-white/[0.02]">
                {item.path ? (
                  <Image src={item.path} alt={item.label} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center p-5 text-center"><div><ImageIcon className="mx-auto h-5 w-5 text-champagne" /><p className="mt-3 text-xs leading-5 text-muted">{item.label}</p></div></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p><h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">Información clara antes de reservar.</h2></div>
          <div className="divide-y divide-line rounded-[1.75rem] border border-line bg-white/[0.025] px-5">{cabinaContent.faq.map((item) => <details key={item.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-bone [&::-webkit-details-marker]:hidden"><span>{item.question}</span><ChevronDown className="h-4 w-4 shrink-0 text-champagne transition group-open:rotate-180" /></summary><p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p></details>)}</div>
        </div>
        <div className="mx-auto mt-10 w-[min(1180px,calc(100%-32px))] text-center"><Button asChild size="lg"><a href={buildWhatsAppLink(cabinaContent.booking.informationMessage)} target="_blank" rel="noreferrer" data-event="cabina_reserve_after_faq">Reservar por WhatsApp <ArrowRight className="h-4 w-4" /></a></Button></div>
      </section>

      <section className="bg-bone py-16 text-background">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div><p className="text-xs uppercase tracking-[0.2em] text-taupe">HAUTLAB · San Ramón Norte</p><h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em]">Cabina dermatocosmética dentro de HAUTLAB.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-[#4b4036]">Calle 43 #299A x 32A, San Ramón Norte, C.P. 97117, Mérida, Yucatán. {cabinaContent.hours.join(" ")}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><a href={buildWhatsAppLink(cabinaContent.booking.generalMessage)} target="_blank" rel="noreferrer" data-event="cabina_contact_whatsapp" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-background px-6 text-sm font-medium text-bone">WhatsApp <ArrowRight className="h-4 w-4" /></a><a href="https://maps.app.goo.gl/8CoPkGjpuYDi8QqE6?g_st=ic" target="_blank" rel="noreferrer" data-event="cabina_contact_maps" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-background/25 px-6 text-sm font-medium">Ubicación <MapPin className="h-4 w-4" /></a></div>
        </div>
      </section>

      <div className="fixed bottom-3 left-3 right-20 z-40 lg:hidden"><a href={buildWhatsAppLink(cabinaContent.booking.generalMessage)} target="_blank" rel="noreferrer" data-event="cabina_mobile_conversion" className="flex min-h-14 items-center justify-between rounded-full border border-champagne/30 bg-champagne px-5 text-sm font-medium text-background shadow-calm"><span>{cabinaContent.booking.primaryLabel}</span><ArrowRight className="h-4 w-4" /></a></div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
