import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, MapPin, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = siteConfig.doctorProfileUrl;

export const metadata: Metadata = {
  title: "Dr. Salvador Cordero en Mérida | HAUTLAB",
  description:
    "Perfil profesional del Dr. Salvador Cordero Romero en HAUTLAB Mérida: atención de piel, cabello y uñas, dermatología clínica, medicina estética y diseño facial.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Dr. Salvador Cordero en Mérida | HAUTLAB",
    description:
      "Información profesional, áreas de atención, publicaciones y datos oficiales de consulta del Dr. Salvador Cordero Romero en HAUTLAB Mérida.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "profile"
  }
};

const clinicalLinks = [
  { label: "Acné", href: "/procedimientos/acne" },
  { label: "Rosácea", href: "/procedimientos/rosacea" },
  { label: "Melasma", href: "/procedimientos/melasma" },
  { label: "Alopecia", href: "/procedimientos/alopecia" }
];

const aestheticLinks = [
  { label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" },
  { label: "Rinomodelación", href: "/procedimientos/rinomodelacion" },
  { label: "Labios", href: "/procedimientos/labios" },
  { label: "Ojeras", href: "/procedimientos/ojeras" }
];

export default function DoctorProfilePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        name: "Dr. Salvador Cordero Romero | HAUTLAB",
        inLanguage: "es-MX",
        mainEntity: { "@id": `${siteConfig.url}#doctor` },
        isPartOf: { "@id": `${siteConfig.url}#website` }
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}#doctor`,
        name: siteConfig.legalDoctorName,
        alternateName: siteConfig.doctorName,
        url: pageUrl,
        jobTitle: siteConfig.professionalTitle,
        identifier: siteConfig.professionalLicense,
        knowsAbout: [
          "Dermatología clínica",
          "Medicina estética",
          "Acné",
          "Rosácea",
          "Melasma",
          "Alopecia y caída de cabello",
          "Lesiones de piel",
          "Diseño facial"
        ],
        worksFor: { "@id": `${siteConfig.url}#clinic` },
        sameAs: [siteConfig.instagram, siteConfig.linkedin],
        subjectOf: [
          { "@type": "WebPage", url: `${siteConfig.url}/publicaciones` },
          ...siteConfig.pubmedArticles.map((url) => ({ "@type": "ScholarlyArticle", url }))
        ]
      }
    ]
  };

  return (
    <main id="contenido-principal">
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">Perfil profesional</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,6.3rem)] leading-[.92] tracking-[-.06em] text-bone">
              Dr. Salvador Cordero.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Médico Cirujano con práctica enfocada en dermatología clínica y estética. En HAUTLAB Mérida realiza valoración de piel, cabello y uñas, así como medicina estética y diseño facial con diagnóstico, indicación y seguimiento como punto de partida.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={buildWhatsAppLink("Hola, quiero agendar una valoración con el Dr. Salvador Cordero en HAUTLAB Mérida.")}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_doctor_profile_hero"
                >
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/merida">Ver HAUTLAB Mérida</Link>
              </Button>
            </div>
          </div>

          <Card className="p-6 sm:p-7">
            <ShieldCheck className="h-5 w-5 text-champagne" />
            <p className="mt-5 text-sm font-medium text-bone">Identidad profesional publicada</p>
            <div className="mt-4 space-y-2 text-sm leading-7 text-muted">
              <p>{siteConfig.legalDoctorName}</p>
              <p>{siteConfig.professionalTitle}</p>
              <p>{siteConfig.practiceArea}</p>
              <p>{siteConfig.professionalLicense}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b border-line py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Áreas de atención</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">
              Atención clínica y estética dentro de una misma valoración médica.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="p-7">
              <Stethoscope className="h-5 w-5 text-champagne" />
              <h3 className="mt-5 text-xl font-medium text-bone">Piel, cabello y uñas</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Valoración clínica de problemas frecuentes de piel y anexos con revisión de antecedentes, exploración, tratamientos previos y necesidad de seguimiento.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {clinicalLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-champagne/40 hover:text-bone">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link href="/merida/dermatologia" className="mt-7 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
                Ver dermatología clínica en Mérida <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-7">
              <ShieldCheck className="h-5 w-5 text-champagne" />
              <h3 className="mt-5 text-xl font-medium text-bone">Medicina estética y diseño facial</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Valoración anatómica y de objetivos antes de indicar toxina botulínica, rellenos, bioestimulación u otros procedimientos estéticos.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {aestheticLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-champagne/40 hover:text-bone">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link href="/merida/medicina-estetica" className="mt-7 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
                Ver medicina estética en Mérida <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-3">
          <Card className="p-7">
            <MapPin className="h-5 w-5 text-champagne" />
            <h2 className="mt-5 text-lg font-medium text-bone">Consulta en Mérida</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{siteConfig.address}</p>
            <a href={siteConfig.googleMaps} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
              Abrir ubicación <ExternalLink className="h-4 w-4" />
            </a>
          </Card>

          <Card className="p-7">
            <BookOpen className="h-5 w-5 text-champagne" />
            <h2 className="mt-5 text-lg font-medium text-bone">Publicaciones</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              El sitio reúne publicaciones científicas de etapa formativa y separa explícitamente la investigación académica de la información clínica para pacientes.
            </p>
            <Link href="/publicaciones" className="mt-6 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
              Consultar publicaciones <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-7">
            <ShieldCheck className="h-5 w-5 text-champagne" />
            <h2 className="mt-5 text-lg font-medium text-bone">Canales oficiales</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Para confirmar ubicación, datos de contacto y servicios vigentes, utiliza HAUTLAB y los canales enlazados desde este perfil.
            </p>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
              Instagram oficial <ExternalLink className="h-4 w-4" />
            </a>
          </Card>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-[min(900px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Valoración</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">
            El procedimiento no sustituye el diagnóstico.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted">
            Cada consulta parte del motivo principal, los antecedentes y la exploración. La indicación final puede ser tratamiento domiciliario, medicamento, procedimiento, estudios complementarios o seguimiento, según el caso.
          </p>
          <div className="mt-9">
            <Button asChild>
              <a
                href={buildWhatsAppLink("Hola, quiero consultar disponibilidad con el Dr. Salvador Cordero.")}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_doctor_profile_footer"
              >
                Consultar disponibilidad <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <script id="doctor-profile-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
