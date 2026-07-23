import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { ConsultationForm } from "@/components/sections/consultation-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const contactUrl = `${siteConfig.url}/contacto`;

export const metadata: Metadata = {
  title: "Contacto y valoración | Dr. Salvador Cordero · HAUTLAB",
  description:
    "Solicita valoración de dermatología clínica, medicina estética o Cabina HAUTLAB en Mérida. Atención privada con cita previa.",
  alternates: { canonical: contactUrl },
  openGraph: {
    title: "Contacto y valoración | HAUTLAB",
    description: "Solicita una valoración privada en HAUTLAB Mérida.",
    url: contactUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">Contacto</p>
            <h1 className="mt-5 font-serif text-[clamp(3.2rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
              Solicita una valoración privada.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
              Selecciona el tipo de atención y prepara una solicitud ordenada. Recepción confirmará
              disponibilidad, sede y siguiente paso por WhatsApp.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Consulta médica de piel, cabello o uñas.",
                "Medicina estética y diseño facial.",
                "Cabina Dermatocosmética HAUTLAB.",
                "Coordinación para pacientes visitantes."
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-muted">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-champagne" />
                  {item}
                </div>
              ))}
            </div>

            <Card className="mt-9 p-6">
              <MapPin className="h-5 w-5 text-champagne" />
              <p className="mt-5 text-sm font-medium text-bone">HAUTLAB Mérida</p>
              <p className="mt-2 text-sm leading-6 text-muted">{siteConfig.address}</p>
              <p className="mt-2 text-xs text-quiet">{siteConfig.hours}</p>
            </Card>

            <Button asChild variant="outline" className="mt-5">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_contact_direct"
              >
                Abrir WhatsApp directamente <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <ConsultationForm />
        </div>
      </section>
    </main>
  );
}
