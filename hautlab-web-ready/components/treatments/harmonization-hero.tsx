"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const chapters = [
  {
    number: "01",
    title: "Proporción",
    copy: "Las relaciones importan más que una zona aislada.",
    position: "0% 50%"
  },
  {
    number: "02",
    title: "Movimiento",
    copy: "El rostro también se valora en expresión.",
    position: "50% 50%"
  },
  {
    number: "03",
    title: "Identidad",
    copy: "Preservar lo propio forma parte del plan.",
    position: "100% 50%"
  }
] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

export function HarmonizationHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [reveal, setReveal] = useState(0);

  const whatsappHref = buildWhatsAppLink(
    "Hola, quiero una valoración de armonización facial y entender qué conviene priorizar en mi caso."
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      frameRef.current = null;

      if (reduceMotion.matches) {
        setReveal(1);
        return;
      }

      const node = heroRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const travel = Math.max(node.offsetHeight * 0.58, 1);
      const progress = clamp((72 - rect.top) / travel);
      setReveal(progress);
    };

    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduceMotion.addEventListener?.("change", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener?.("change", schedule);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const revealRadius = 16 + reveal * 116;
  const revealOpacity = 0.12 + reveal * 0.88;

  return (
    <>
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden border-b border-line bg-[#0b0908] text-bone"
      >
        <div className="mx-auto grid w-[min(1380px,calc(100%-24px))] lg:min-h-[66svh] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-20 flex flex-col justify-center px-2 py-12 sm:px-5 sm:py-14 lg:px-7 lg:py-16">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.26em] text-champagne">
                HAUTLAB · Mérida
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-bone/45">
                Medicina estética facial
              </p>
            </div>

            <div className="mt-10 max-w-[38rem] lg:mt-14">
              <h1 className="font-serif text-[clamp(3rem,5.7vw,5.9rem)] leading-[0.86] tracking-[-0.06em] text-bone">
                Armonización
                <span className="block text-champagne">facial</span>
              </h1>

              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-bone/62 sm:text-xs">
                Proporción. Movimiento. Identidad.
              </p>

              <p className="mt-6 max-w-[30rem] font-serif text-[clamp(1.65rem,2.6vw,2.7rem)] leading-[1.02] tracking-[-0.035em] text-bone/94">
                El tratamiento empieza después de entender el rostro.
              </p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_armonizacion_still_light"
                className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-bone px-6 py-3.5 text-sm font-medium text-background transition hover:-translate-y-0.5 hover:bg-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/70"
              >
                Solicitar valoración <ArrowRight className="h-4 w-4" />
              </a>

              <p className="mt-5 max-w-[31rem] text-[10px] leading-5 tracking-[0.02em] text-bone/38">
                La indicación y el plan se definen únicamente después de una valoración individual.
              </p>
            </div>
          </div>

          <div className="relative min-h-[56svh] overflow-hidden bg-[#120e0b] lg:min-h-0">
            <Image
              src="/visuals/hautlab-armonizacion.webp"
              alt="Retrato editorial utilizado para representar la valoración de proporciones faciales"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-[54%_48%]"
              style={{
                filter: "brightness(.64) saturate(.78) contrast(1.08)"
              }}
            />

            <Image
              src="/visuals/hautlab-armonizacion.webp"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-[54%_48%]"
              style={{
                clipPath: `circle(${revealRadius}% at 61% 52%)`,
                opacity: revealOpacity,
                filter: "brightness(1.08) saturate(.96) contrast(1.06)",
                transition: "clip-path 90ms linear, opacity 90ms linear"
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              aria-hidden="true"
              style={{
                opacity: reveal * 0.42,
                background:
                  "radial-gradient(circle at 66% 48%, rgba(221,177,126,.34), rgba(221,177,126,.08) 24%, transparent 53%)"
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0908]/40 via-transparent to-[#0b0908]/12 lg:bg-gradient-to-r lg:from-[#0b0908]/28 lg:via-transparent lg:to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
              <p className="max-w-[20rem] text-[9px] uppercase leading-4 tracking-[0.17em] text-bone/44">
                Imagen editorial · no representa un resultado clínico
              </p>
              <div className="hidden text-right sm:block" aria-hidden="true">
                <p className="text-[9px] uppercase tracking-[0.2em] text-champagne/70">
                  Luz / criterio
                </p>
                <div className="mt-2 h-px w-24 bg-bone/15">
                  <div
                    className="h-full bg-champagne/75 transition-[width] duration-100"
                    style={{ width: `${Math.max(7, reveal * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="criterio-armonizacion"
        className="relative overflow-hidden border-b border-[#cfc5b5] bg-[#eee8de] text-[#17130f]"
      >
        <div className="mx-auto grid w-[min(1380px,calc(100%-24px))] gap-10 px-2 py-16 sm:px-5 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-7 lg:py-24">
          <div className="relative min-h-[46svh] overflow-hidden rounded-[1.2rem] bg-[#17130f] lg:min-h-[56svh]">
            <Image
              src="/visuals/hautlab-armonizacion.webp"
              alt="Retrato editorial en iluminación contenida"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-[50%_48%]"
              style={{ filter: "saturate(.78) contrast(1.05) brightness(.78)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          <div className="lg:pl-[7vw]">
            <p className="text-[9px] font-medium uppercase tracking-[0.26em] text-[#826a4f]">
              Criterio HAUTLAB
            </p>
            <p className="mt-7 max-w-[16ch] font-serif text-[clamp(2.7rem,5.2vw,5.7rem)] leading-[0.9] tracking-[-0.055em]">
              No todas las zonas que pueden tratarse necesitan tratarse.
            </p>
            <p className="mt-7 max-w-[32rem] text-sm leading-7 text-[#62594f] sm:text-base sm:leading-8">
              La armonización parte de relaciones, movimiento y soporte. La herramienta se elige después; conservar también puede ser una decisión clínica.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b0908] text-bone" aria-label="Principios de armonización facial">
        <div className="mx-auto w-[min(1380px,calc(100%-24px))] px-2 py-14 sm:px-5 sm:py-18 lg:px-7 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-bone/12 pb-5">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.26em] text-champagne">
                Lectura facial
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-bone sm:text-4xl">
                Tres principios. Ningún menú de jeringas.
              </h2>
            </div>
            <p className="hidden max-w-sm text-right text-xs leading-6 text-bone/42 md:block">
              Cada capítulo describe cómo se valora el rostro, no dónde se inyecta.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {chapters.map((item) => (
              <article
                key={item.number}
                className="group relative min-h-[29rem] overflow-hidden rounded-[1.1rem] border border-bone/10 bg-[#15110e] sm:min-h-[34rem]"
              >
                <div
                  className="absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.018]"
                  aria-hidden="true"
                  style={{
                    backgroundImage: "url('/visuals/hautlab-armonizacion.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: item.position,
                    backgroundRepeat: "no-repeat"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0908] via-[#0b0908]/14 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-champagne/80">
                    {item.number}
                  </p>
                  <h3 className="mt-2 font-serif text-4xl tracking-[-0.045em] text-bone">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[19rem] text-sm leading-6 text-bone/62">
                    {item.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 grid gap-7 border-t border-bone/12 pt-9 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-champagne/75">
                Después del análisis
              </p>
              <p className="mt-3 max-w-[18ch] font-serif text-[clamp(2.3rem,4.2vw,4.5rem)] leading-[0.95] tracking-[-0.05em]">
                La técnica viene después del criterio.
              </p>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              data-event="whatsapp_armonizacion_still_light_footer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-bone/20 px-6 py-3.5 text-sm font-medium text-bone transition hover:border-champagne/60 hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60"
            >
              Solicitar valoración <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
