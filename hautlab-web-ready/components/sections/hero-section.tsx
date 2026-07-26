import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Languages, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function personalizedCopy(audience: string | null) {
  if (audience === "quintana-roo") {
    return {
      eyebrow: "HAUTLAB · Atención en Mérida para pacientes de Quintana Roo",
      title: "Dermatología clínica y medicina estética en Mérida, con coordinación previa al viaje.",
      triad: "Valoración médica, procedimientos por indicación y seguimiento definido antes de regresar.",
      note: "Cancún, Playa del Carmen, Tulum y otras ciudades de Quintana Roo pueden coordinar disponibilidad antes de trasladarse."
    };
  }

  if (audience === "campeche") {
    return {
      eyebrow: "HAUTLAB · Atención en Mérida para pacientes de Campeche",
      title: "Piel y diseño facial en Mérida, con un plan clínico antes de viajar.",
      triad: "Diagnóstico primero. Tiempos realistas. Seguimiento claramente definido.",
      note: "La valoración y las posibilidades de tratamiento el mismo día se coordinan antes del traslado."
    };
  }

  return {
    eyebrow: "HAUTLAB + Dr. Salvador Cordero",
    title: siteConfig.tagline,
    triad: siteConfig.triad,
    note: siteConfig.philosophy
  };
}

export async function HeroSection() {
  const requestHeaders = await headers();
  const audience = requestHeaders.get("x-hautlab-audience");
  const copy = personalizedCopy(audience);
  const internationalVisitor = audience === "international";

  return (
    <section className="relative overflow-hidden border-b border-line bg-aurora" data-audience={audience ?? "general"}>
      <div className="absolute inset-0 opacity-25 [background:linear-gradient(90deg,rgba(242,238,231,.06)_1px,transparent_1px),linear-gradient(180deg,rgba(242,238,231,.04)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-80px)] w-[min(1180px,calc(100%-32px))] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <Reveal>
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.28em] text-champagne">{copy.eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.2rem,7vw,6.8rem)] leading-[.9] tracking-[-.065em] text-bone">
              {copy.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted md:text-xl">{copy.triad}</p>
            <p className="mt-5 max-w-xl text-base leading-7 text-quiet">{copy.note}</p>
            {internationalVisitor && (
              <Link href="/en" hrefLang="en" className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne/35 bg-white/[0.035] px-4 py-2 text-sm text-bone transition hover:border-champagne hover:text-champagne" data-event="english_geo_prompt">
                <Languages className="h-4 w-4" /> English information for visiting patients
              </Link>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={buildWhatsAppLink("Hola, quiero agendar una valoración privada en HAUTLAB.")} target="_blank" rel="noreferrer" data-event="whatsapp_hero_primary">
                  Agendar valoración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#tratamientos">Ver tratamientos</a>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[2rem] border border-line bg-white/[0.045] p-3 shadow-calm backdrop-blur">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[1.45rem] border border-line bg-soft">
              <Image
                src="/visuals/dr-salvador-cordero-portrait-final.webp"
                alt="Retrato del Dr. Salvador Cordero en HAUTLAB, Mérida"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-[1.35rem] border border-line bg-background/72 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-sm text-bone">
                    <ShieldCheck className="h-5 w-5 text-champagne" />
                    Dr. Salvador Cordero · Piel y diseño facial en Mérida.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
