"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const lensReadings = [
  {
    id: "proportion",
    number: "01",
    label: "Proporción",
    x: 70,
    y: 43,
    body: "Relaciones entre tercios, proyección y transiciones antes de pensar en una zona aislada."
  },
  {
    id: "movement",
    number: "02",
    label: "Movimiento",
    x: 77,
    y: 56,
    body: "La expresión cambia la lectura del rostro. El plan debe respetar esa dinámica."
  },
  {
    id: "identity",
    number: "03",
    label: "Identidad",
    x: 72,
    y: 68,
    body: "El objetivo no es estandarizar rasgos, sino decidir qué conviene preservar y qué puede equilibrarse."
  }
] as const;

type LensReadingId = (typeof lensReadings)[number]["id"];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function HarmonizationHero() {
  const [activeId, setActiveId] = useState<LensReadingId>("proportion");
  const [lens, setLens] = useState({ x: 70, y: 43 });
  const active = useMemo(
    () => lensReadings.find((item) => item.id === activeId) ?? lensReadings[0],
    [activeId]
  );

  const whatsappHref = buildWhatsAppLink(
    "Hola, quiero una valoración de armonización facial y entender qué conviene priorizar en mi caso."
  );

  const selectReading = (id: LensReadingId) => {
    const next = lensReadings.find((item) => item.id === id) ?? lensReadings[0];
    setActiveId(next.id);
    setLens({ x: next.x, y: next.y });
  };

  const moveLens = (clientX: number, clientY: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 20, 84);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 30, 75);

    setLens({ x, y });

    const nearest = lensReadings.reduce((best, item) =>
      Math.abs(item.y - y) < Math.abs(best.y - y) ? item : best
    );
    setActiveId(nearest.id);
  };

  return (
    <section
      className="relative isolate overflow-hidden border-b border-black/10 bg-[#ece7dd] text-[#0e0d0b]"
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        moveLens(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        moveLens(event.clientX, event.clientY, event.currentTarget);
      }}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 82% 16%, rgba(143,118,94,.16), transparent 28%), linear-gradient(115deg, transparent 0 63%, rgba(255,255,255,.28) 63% 64%, transparent 64%)"
        }}
      />

      <div className="relative mx-auto min-h-[calc(100svh-6rem)] w-[min(1380px,calc(100%-24px))] px-2 py-6 sm:px-5 sm:py-8 lg:px-7 lg:py-10">
        <div className="flex items-start justify-between gap-5 border-b border-black/15 pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#705d49]">
              HAUTLAB · Mérida
            </p>
            <h1 className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#181510]">
              Armonización facial
            </h1>
          </div>
          <p className="hidden max-w-[25rem] text-right text-[10px] uppercase leading-5 tracking-[0.18em] text-[#6f655a] sm:block">
            Dr. Salvador Cordero · Valoración individual
          </p>
        </div>

        <div className="relative pt-10 sm:pt-14 lg:pt-16">
          <p className="relative z-10 max-w-[10ch] font-serif text-[clamp(4.3rem,10vw,9.4rem)] leading-[0.78] tracking-[-0.075em] text-[#11100e]">
            TU ROSTRO
            <span className="block">NO NECESITA</span>
            <span className="block">MÁS.</span>
          </p>

          <p className="relative z-10 ml-[8vw] mt-4 max-w-[12ch] font-serif text-[clamp(3.2rem,7.2vw,7rem)] leading-[0.82] tracking-[-0.065em] text-[#7e674d] sm:mt-2">
            NECESITA CRITERIO.
          </p>

          <div
            className="absolute z-20 grid aspect-square w-[clamp(15rem,31vw,29rem)] place-items-center overflow-hidden rounded-full bg-[#0b0a09] shadow-[0_40px_120px_rgba(49,39,28,.25)] ring-1 ring-black/15 transition-[left,top,transform] duration-500 ease-out motion-reduce:transition-none"
            style={{
              left: `${lens.x}%`,
              top: `${lens.y}%`,
              transform: "translate(-50%, -50%)"
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-[8%] rounded-full border border-[#c8b39a]/20" />
            <div className="relative w-[72%]">
              <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#c8b39a]/70">
                HAUTLAB · The lens
              </p>
              <div className="mt-5 space-y-1">
                {lensReadings.map((item) => {
                  const selected = item.id === activeId;
                  return (
                    <p
                      key={item.id}
                      className={`font-serif text-[clamp(1.8rem,4vw,4rem)] leading-[0.9] tracking-[-0.045em] transition duration-300 ${
                        selected ? "translate-x-0 text-[#e7d7c1]" : "translate-x-1 text-[#e7d7c1]/25"
                      }`}
                    >
                      {item.label.toUpperCase()}
                    </p>
                  );
                })}
              </div>
              <p className="mt-6 max-w-[23rem] text-[11px] leading-5 text-[#d2c8bb]/70">
                {active.body}
              </p>
            </div>
          </div>

          <div className="relative z-30 mt-[clamp(11rem,23vw,18rem)] grid gap-8 border-t border-black/15 pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#705d49]">
                Mueve el lente
              </p>
              <p className="mt-3 text-base leading-7 text-[#4c4339] sm:text-lg sm:leading-8">
                La valoración no empieza preguntando cuánto agregar. Empieza entendiendo qué relación conviene conservar, equilibrar o dejar intacta.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3" aria-label="Lecturas del lente">
                {lensReadings.map((item) => {
                  const selected = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectReading(item.id)}
                      data-event={`armonizacion_lens_${item.id}`}
                      aria-pressed={selected}
                      className={`group flex items-center gap-2 text-left text-[10px] font-medium uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e674d]/50 ${
                        selected ? "text-[#181510]" : "text-[#7b7064] hover:text-[#181510]"
                      }`}
                    >
                      <span
                        className={`h-px transition-all duration-300 ${
                          selected ? "w-8 bg-[#7e674d]" : "w-3 bg-black/25 group-hover:w-6"
                        }`}
                      />
                      {item.number} {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp_armonizacion_lens"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#0b0a09] px-6 text-sm font-medium text-[#f2eee7] transition hover:-translate-y-0.5 hover:bg-[#1d1b18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e674d]/50"
              >
                Solicitar valoración <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#que-es"
                data-event="armonizacion_explore_content"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-white/20 px-6 text-sm font-medium text-[#181510] transition hover:border-black/25 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e674d]/50"
              >
                Conocer el enfoque <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          <p className="relative z-30 mt-6 max-w-xl text-[11px] leading-5 text-[#756b60]">
            Información orientativa. La indicación y el plan se definen únicamente después de una valoración individual.
          </p>
        </div>
      </div>
    </section>
  );
}
