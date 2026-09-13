"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowRight, ScanFace } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const readings = [
  {
    id: "balance",
    number: "01",
    label: "Equilibrio",
    kicker: "Lectura global",
    title: "No cambiar tu rostro. Entenderlo mejor.",
    body: "La armonización empieza por leer proporciones, transiciones y expresión antes de decidir si conviene intervenir.",
    imageClass: "scale-[1.02] object-[50%_50%]"
  },
  {
    id: "profile",
    number: "02",
    label: "Perfil",
    kicker: "Relaciones",
    title: "Las proporciones se leen en conjunto.",
    body: "Nariz, labios, mentón y contorno se valoran como una relación. Una zona aislada no explica el rostro completo.",
    imageClass: "scale-[1.075] object-[57%_50%]"
  },
  {
    id: "movement",
    number: "03",
    label: "Movimiento",
    kicker: "Expresión",
    title: "La expresión también forma parte del diseño.",
    body: "El rostro se mueve. Por eso la valoración considera dinámica, naturalidad y qué conviene preservar, no solo una fotografía fija.",
    imageClass: "scale-[1.045] object-[45%_48%]"
  }
] as const;

type ReadingId = (typeof readings)[number]["id"];

export function HarmonizationHero() {
  const [activeId, setActiveId] = useState<ReadingId>("balance");
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const activeIndex = readings.findIndex((item) => item.id === activeId);
  const active = readings[activeIndex] ?? readings[0];

  const whatsappHref = buildWhatsAppLink(
    "Hola, quiero una valoración de armonización facial y entender qué conviene priorizar en mi caso."
  );

  return (
    <section className="relative overflow-hidden border-b border-line bg-[#080706]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(210,181,137,0.12),transparent_34%),radial-gradient(circle_at_12%_82%,rgba(255,255,255,0.04),transparent_30%)]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] w-[min(1320px,calc(100%-20px))] gap-5 py-5 lg:grid-cols-[0.84fr_1.16fr] lg:gap-7 lg:py-7">
        <div className="relative z-10 order-2 flex flex-col justify-center rounded-[2rem] border border-line bg-white/[0.025] px-6 py-10 sm:px-9 lg:order-1 lg:px-12 lg:py-14">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-champagne">
            <ScanFace className="h-4 w-4" />
            Diseño facial · Mérida
          </div>

          <h1 className="mt-7 max-w-[8ch] font-serif text-[clamp(3.5rem,8.1vw,7.4rem)] leading-[0.84] tracking-[-0.075em] text-bone">
            Armonización facial
          </h1>

          <p className="mt-7 max-w-lg font-serif text-[clamp(1.75rem,3.2vw,3.2rem)] leading-[0.98] tracking-[-0.045em] text-bone/95">
            No cambiar tu rostro.
            <span className="block text-champagne">Entenderlo mejor.</span>
          </p>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Una valoración global para decidir qué estructura merece atención, qué conviene conservar y qué no necesita tratamiento.
          </p>

          <div className="mt-9 border-y border-line py-2" aria-label="Lecturas de armonización facial">
            <div className="grid grid-cols-3 gap-1">
              {readings.map((item) => {
                const selected = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    data-event={`armonizacion_reading_${item.id}`}
                    aria-pressed={selected}
                    className={`group relative min-h-14 px-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 ${
                      selected ? "text-bone" : "text-quiet hover:text-muted"
                    }`}
                  >
                    <span className="block text-[9px] uppercase tracking-[0.18em]">{item.number}</span>
                    <span className="mt-1 block text-xs sm:text-sm">{item.label}</span>
                    <span
                      className={`absolute inset-x-2 bottom-0 h-px origin-left bg-champagne transition-transform duration-500 ${
                        selected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 min-h-[150px] max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.22em] text-champagne">{active.kicker}</p>
            <h2 className="mt-3 max-w-lg font-serif text-3xl leading-[1.02] tracking-[-0.045em] text-bone sm:text-[2.6rem]">
              {active.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted">{active.body}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              data-event="whatsapp_armonizacion_cinematic"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-champagne px-6 text-sm font-medium text-background transition hover:bg-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60"
            >
              Solicitar valoración <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#que-es"
              data-event="armonizacion_explore_content"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line bg-white/[0.02] px-6 text-sm font-medium text-bone transition hover:border-bone/30 hover:bg-white/[0.05]"
            >
              Conocer el enfoque <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-5 max-w-xl text-xs leading-5 text-quiet">
            Información orientativa. La indicación y el plan se definen únicamente después de una valoración individual.
          </p>
        </div>

        <div
          className="relative order-1 min-h-[58svh] overflow-hidden rounded-[2rem] border border-line bg-soft lg:order-2 lg:min-h-0"
          onPointerMove={(event) => {
            if (event.pointerType === "touch") return;
            const rect = event.currentTarget.getBoundingClientRect();
            setPointer({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100
            });
          }}
          onPointerLeave={() => setPointer({ x: 50, y: 50 })}
        >
          <Image
            src="/visuals/hautlab-armonizacion.webp"
            alt="Valoración editorial de proporciones y contorno facial para armonización facial"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 58vw"
            className={`object-cover transition-[transform,object-position,filter] duration-1000 ease-out ${active.imageClass}`}
            style={{
              transformOrigin: `${pointer.x}% ${pointer.y}%`,
              filter: "saturate(.86) contrast(1.04) brightness(.92)"
            }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080706]/88 via-transparent to-[#080706]/18" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#080706]/28 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.025]" />

          <div className="absolute left-5 top-5 flex items-center gap-3 rounded-full border border-bone/15 bg-[#090806]/45 px-4 py-2 backdrop-blur-xl sm:left-7 sm:top-7">
            <span className="text-[9px] uppercase tracking-[0.2em] text-champagne">{active.number} / 03</span>
            <span className="h-3 w-px bg-bone/20" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-bone">{active.label}</span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-champagne">HAUTLAB · Facial reading</p>
                <p className="mt-2 max-w-md font-serif text-2xl leading-[1.02] tracking-[-0.04em] text-bone sm:text-4xl">
                  {active.label === "Equilibrio" ? "Una lectura completa antes de elegir una herramienta." : active.title}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted">Explora</p>
                <p className="mt-1 text-xs text-bone">Toca una lectura</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
              {readings.map((item, index) => (
                <span
                  key={item.id}
                  className={`h-px transition-colors duration-500 ${
                    index <= activeIndex ? "bg-champagne/80" : "bg-bone/18"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
