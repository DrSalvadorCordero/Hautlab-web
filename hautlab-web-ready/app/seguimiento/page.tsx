import type { Metadata } from "next";
import { ArrowRight, CalendarDays, FileText, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const followUpUrl = `${siteConfig.url}/seguimiento`;

export const metadata: Metadata = {
  title: "Seguimiento dermatológico | HAUTLAB",
  description:
    "Portal de seguimiento para pacientes HAUTLAB: revisión, indicaciones y comunicación clínica.",
  alternates: { canonical: followUpUrl },
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Seguimiento dermatológico | HAUTLAB",
    description: "Revisión, indicaciones y seguimiento clínico con HAUTLAB.",
    url: followUpUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

const reviewUrl = buildWhatsAppLink(
  "Hola, recibí mi Skin Imaging Report de HAUTLAB y quiero agendar mi revisión de seguimiento."
);

const instructionsUrl = buildWhatsAppLink(
  "Hola, recibí mi Skin Imaging Report de HAUTLAB y quiero confirmar mis indicaciones y rutina vigente."
);

const evolutionUrl = buildWhatsAppLink(
  "Hola, recibí mi Skin Imaging Report de HAUTLAB y quiero enviar fotografías de evolución para mi seguimiento."
);

export default function SeguimientoPage() {
  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1fr_.78fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Seguimiento</p>
            <h1 className="mt-5 font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
              Tu seguimiento dermatológico.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
              Este portal acompaña tu registro fotográfico. Úsalo para coordinar revisión,
              confirmar indicaciones o compartir evolución con el equipo.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={reviewUrl} target="_blank" rel="noreferrer" data-event="followup_review_whatsapp">
                  Agendar revisión <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={instructionsUrl} target="_blank" rel="noreferrer" data-event="followup_instructions_whatsapp">
                  Consultar indicaciones
                </a>
              </Button>
            </div>
          </div>

          <Card className="p-7 sm:p-8">
            <ShieldCheck className="h-7 w-7 text-champagne" aria-hidden="true" />
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-champagne">Privacidad por diseño</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">
              El QR no contiene datos clínicos personales.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              No almacena nombre, diagnóstico, fotografías ni número de expediente. Solo abre este
              punto seguro de contacto para continuar el seguimiento.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Siguiente paso</p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-0.055em] text-bone">
              Un registro útil solo sirve si se compara.
            </h2>
            <p className="mt-5 text-base leading-8 text-muted">
              Conserva tu reporte como línea basal. En el control podremos contrastar pigmentación,
              textura y uniformidad con nuevas fotografías tomadas bajo condiciones similares.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-7">
              <CalendarDays className="h-6 w-6 text-champagne" aria-hidden="true" />
              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-champagne">01 · Revisión</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">
                Coordina tu control.
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                El momento del control depende de la indicación clínica y del tratamiento realizado.
              </p>
              <Button asChild variant="ghost" className="mt-5 px-0">
                <a href={reviewUrl} target="_blank" rel="noreferrer">
                  Agendar por WhatsApp <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </Card>

            <Card className="p-7">
              <FileText className="h-6 w-6 text-champagne" aria-hidden="true" />
              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-champagne">02 · Indicaciones</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">
                Confirma tu rutina vigente.
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Si tienes dudas sobre productos, frecuencia o cuidados, confirma antes de modificar
                por tu cuenta lo indicado en consulta.
              </p>
              <Button asChild variant="ghost" className="mt-5 px-0">
                <a href={instructionsUrl} target="_blank" rel="noreferrer">
                  Consultar indicaciones <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </Card>

            <Card className="p-7">
              <MessageCircle className="h-6 w-6 text-champagne" aria-hidden="true" />
              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-champagne">03 · Evolución</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">
                Comparte cambios relevantes.
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Envía fotografías nuevas cuando el equipo te las solicite o si aparece un cambio
                que requiera valoración.
              </p>
              <Button asChild variant="ghost" className="mt-5 px-0">
                <a href={evolutionUrl} target="_blank" rel="noreferrer">
                  Enviar evolución <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-soft py-20 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <Sparkles className="h-7 w-7 text-champagne" aria-hidden="true" />
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-champagne">Skin Imaging Report</p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-0.055em] text-bone">
              Tu reporte es una línea basal, no un diagnóstico aislado.
            </h2>
          </div>
          <div>
            <p className="text-base leading-8 text-muted">
              La interpretación de las imágenes se integra con antecedentes, exploración clínica y
              evolución. El seguimiento permite decidir si el plan debe mantenerse, ajustarse o
              escalarse.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href={reviewUrl} target="_blank" rel="noreferrer">
                  Continuar seguimiento
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/contacto">Contacto HAUTLAB</a>
              </Button>
            </div>
            <p className="mt-6 text-xs leading-6 text-quiet">
              Atención privada en Mérida · {siteConfig.whatsappDisplay}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
