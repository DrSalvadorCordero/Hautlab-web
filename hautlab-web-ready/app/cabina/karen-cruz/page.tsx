import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { CabinaAnalytics } from "@/components/cabina/cabina-analytics";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cabinaContent } from "@/lib/cabina-content";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/cabina/karen-cruz`;

export const metadata: Metadata = {
  title: "Karen Cruz | Cabina Dermatocosmética HAUTLAB",
  description: "Conoce a Karen Cruz, coordinadora de la Cabina Dermatocosmética de HAUTLAB en Mérida, integrada al ecosistema clínico del Dr. Salvador Cordero.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Karen Cruz | Cabina Dermatocosmética HAUTLAB",
    description: "Coordinación de protocolos dermatocosméticos dentro de HAUTLAB Mérida.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "profile"
  }
};

export default function KarenCruzPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cabinaContent.coordinator.name,
    jobTitle: "Coordinadora de Cabina Dermatocosmética HAUTLAB",
    url: pageUrl,
    worksFor: {
      "@type": "MedicalClinic",
      name: "HAUTLAB",
      url: siteConfig.url
    },
    knowsAbout: ["Atención dermatocosmética", "Protocolos faciales no invasivos", "Seguimiento de pacientes"]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Cabina Dermatocosmética", item: `${siteConfig.url}/cabina` },
      { "@type": "ListItem", position: 3, name: "Karen Cruz", item: pageUrl }
    ]
  };

  return (
    <main>
      <CabinaAnalytics profile />
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Cabina Dermatocosmética", href: "/cabina" }, { label: "Karen Cruz" }]} />

      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-line bg-[#11100e] shadow-calm">
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div>
                <UserRound className="mx-auto h-14 w-14 text-champagne" />
                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-champagne">Retrato profesional pendiente</p>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted">Se utilizará una fotografía real de Karen con uniforme clínico sobrio, fondo HAUTLAB y luz editorial.</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">HAUTLAB · Cabina Dermatocosmética</p>
            <h1 className="mt-5 font-serif text-[clamp(3.3rem,7vw,6.4rem)] leading-[.9] tracking-[-.065em] text-bone">Karen Cruz</h1>
            <p className="mt-5 text-lg font-medium text-bone">{cabinaContent.coordinator.role}</p>
            <p className="mt-7 max-w-3xl text-base leading-8 text-muted">{cabinaContent.coordinator.description}</p>
            <Card className="mt-7 p-6">
              <ShieldCheck className="h-5 w-5 text-champagne" />
              <p className="mt-4 text-sm leading-7 text-muted">{cabinaContent.coordinator.medicalBoundary}</p>
            </Card>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={buildWhatsAppLink("Hola, me gustaría agendar con la Cabina Dermatocosmética de HAUTLAB coordinada por Karen Cruz.")} target="_blank" rel="noreferrer" data-event="cabina_karen_reserve">
                  Reservar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg"><Link href="/cabina">Ver servicios</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-3">
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Responsabilidad</p>
            <h2 className="mt-4 text-2xl font-medium tracking-[-0.04em] text-bone">Coordinación de experiencia</h2>
            <p className="mt-5 text-sm leading-7 text-muted">Preparación, organización, atención y seguimiento de los protocolos dermatocosméticos de la unidad.</p>
          </Card>
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Estándar</p>
            <h2 className="mt-4 text-2xl font-medium tracking-[-0.04em] text-bone">Trabajo dentro de HAUTLAB</h2>
            <p className="mt-5 text-sm leading-7 text-muted">La cabina conserva la identidad, documentación, higiene y criterios de canalización definidos por HAUTLAB.</p>
          </Card>
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Límites profesionales</p>
            <h2 className="mt-4 text-2xl font-medium tracking-[-0.04em] text-bone">Sin atribución médica</h2>
            <p className="mt-5 text-sm leading-7 text-muted">Karen no es presentada como médica, dermatóloga ni profesional autorizada para diagnosticar, prescribir o realizar procedimientos invasivos.</p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Dirección y respaldo clínico</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,4.9rem)] leading-[.94] tracking-[-.055em] text-bone">La cabina forma parte de una práctica dirigida por el Dr. Salvador Cordero.</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted">Cuando una condición requiere diagnóstico, prescripción, procedimiento médico o valoración dermatológica, el caso se canaliza al Dr. Salvador Cordero.</p>
            <div className="mt-7 rounded-2xl border border-line bg-white/[0.025] p-5">
              <div className="flex items-start gap-4">
                <Stethoscope className="mt-1 h-5 w-5 shrink-0 text-champagne" />
                <div>
                  <p className="font-medium text-bone">{cabinaContent.medicalDirection.name}</p>
                  <p className="mt-2 text-sm text-muted">{cabinaContent.medicalDirection.role}</p>
                  <p className="mt-1 text-xs text-quiet">{cabinaContent.medicalDirection.license}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-soft shadow-calm">
            <Image src="/visuals/dr-salvador-cordero-portrait-final.webp" alt="Dr. Salvador Cordero, dirección clínica de HAUTLAB en Mérida" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="bg-bone py-16 text-background">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-taupe">HAUTLAB</p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-.05em]">Conoce la Cabina Dermatocosmética.</h2>
          </div>
          <Link href="/cabina" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-background px-7 text-sm font-medium text-bone">Explorar servicios <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
