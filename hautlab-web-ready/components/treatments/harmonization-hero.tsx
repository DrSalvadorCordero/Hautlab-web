"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function HarmonizationHero() {
  const whatsappHref = buildWhatsAppLink(
    "Hola, quiero una valoración de armonización facial y entender qué conviene priorizar en mi caso."
  );

  return (
    <>
      <section className="relative isolate min-h-[84svh] overflow-hidden border-b border-line bg-[#0d0b09] text-bone">
        <div className="absolute inset-0 lg:left-[48%]">
          <Image
            src="/visuals/hautlab-armonizacion.webp"
            alt="Valoración editorial de proporciones y contorno facial para armonización facial"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="hautlab-portrait-film object-cover object-[53%_48%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-[#0d0b09]/10 to-[#0d0b09]/10 lg:bg-gradient-to-r lg:from-[#0d0b09] lg:via-[#0d0b09]/58 lg:to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,11,9,.08),rgba(13,11,9,.28))]" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(200,179,154,.08),transparent_30%)]" />

        <div className="relative mx-auto flex min-h-[84svh] w-[min(1380px,calc(100%-24px))] flex-col justify-between px-2 pb-7 pt-6 sm:px-5 sm:pb-9 sm:pt-8 lg:px-7 lg:pb-10 lg:pt-9">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-champagne">
                HAUTLAB · Mérida
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-bone/55">
                Armonización facial
              </p>
            </div>
            <p className="hidden text-right text-[9px] uppercase leading-5 tracking-[0.18em] text-bone/45 sm:block">
              Valoración médica individual
              <span className="block">Dr. Salvador Cordero</span>
            </p>
          </div>

          <div className="relative z-10 mt-auto max-w-[72rem] pb-[7vh] pt-[34vh] sm:pt-[30vh] lg:pb-[5vh] lg:pt-20">
            <h1 className="max-w-[10ch] font-serif text-[clamp(3.4rem,7.4vw,7.2rem)] leading-[0.79] tracking-[-0.075em] text-bone">
              ARMONIZACIÓN
              <span className="block text-champagne">FACIAL</span>
            </h1>

            <p className="mt-7 max-w-[16ch] font-serif text-[clamp(1.8rem,3.2vw,3.1rem)] leading-[0.94] tracking-[-0.045em] text-bone/95">
              Proporción sin perder identidad.
            </p>

            <p className="mt-6 max-w-[38rem] text-sm leading-7 text-bone/65 sm:text-base sm:leading-8">
              La técnica empieza después de entender el rostro: proporciones, movimiento, soporte y aquello que conviene preservar.
            </p>

            <div className="mt-8">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_armonizacion_portrait_film"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-background transition hover:-translate-y-0.5 hover:bg-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/70"
              >
                Solicitar valoración <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-6 border-t border-bone/15 pt-4">
            <p className="max-w-xl text-[10px] uppercase leading-5 tracking-[0.18em] text-bone/45">
              Información orientativa · La indicación se define después de una valoración individual
            </p>
            <a
              href="#que-es"
              data-event="armonizacion_scroll_portrait_film"
              className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-bone/55 transition hover:text-champagne sm:inline-flex"
            >
              Continuar <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <style jsx global>{`
          .hautlab-portrait-film {
            animation: hautlabPortraitFilm 10s cubic-bezier(.45,0,.2,1) infinite alternate;
            transform-origin: 54% 48%;
            filter: saturate(0.82) contrast(1.03) brightness(0.88);
            will-change: transform, object-position;
          }

          @keyframes hautlabPortraitFilm {
            0% {
              transform: scale(1.035);
              object-position: 54% 48%;
            }
            100% {
              transform: scale(1.095);
              object-position: 58% 50%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hautlab-portrait-film {
              animation: none;
              transform: scale(1.02);
            }
          }
        `}</style>
      </section>

      <section
        className="relative overflow-hidden border-b border-line bg-[#efe9df] text-[#16130f]"
        aria-label="Criterio de armonización facial"
      >
        <div className="mx-auto grid w-[min(1380px,calc(100%-24px))] gap-10 px-2 py-16 sm:px-5 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:px-7 lg:py-28">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#7b644b]">
            Criterio HAUTLAB
          </p>
          <p className="max-w-[18ch] font-serif text-[clamp(2.8rem,6vw,6.4rem)] leading-[0.9] tracking-[-0.06em]">
            No todas las zonas que pueden tratarse necesitan tratarse.
          </p>
        </div>
      </section>
    </>
  );
}
