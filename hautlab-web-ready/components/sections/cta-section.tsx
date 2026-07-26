import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationForm } from "@/components/sections/consultation-form";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";

export function CtaSection() {
  return (
    <section className="border-b border-line bg-bone py-20 text-background lg:py-28">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#6f5944]">Agenda</p>
            <h2 className="font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.95] tracking-[-.055em]">
              Empieza con valoración médica.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#4b4036]">
              {siteConfig.address}. Atención privada con cita previa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="dark" size="lg">
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración privada en HAUTLAB.")} target="_blank" rel="noreferrer">
                  WhatsApp directo <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-background/20 text-background hover:bg-background/5">
                <a href="/pagos">Pagos seguros</a>
              </Button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <ConsultationForm />
        </Reveal>
      </div>
    </section>
  );
}
