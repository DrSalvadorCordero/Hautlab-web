"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowRight, Crosshair, ScanFace } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const objectives = [
  {
    id: "balance",
    label: "Equilibrio",
    kicker: "Rostro completo",
    title: "Leer antes de intervenir.",
    body: "Se revisan proporciones, transiciones y movimiento para decidir qué conviene tratar, qué conviene dejar intacto y en qué orden hacerlo.",
    global: true
  },
  {
    id: "support",
    label: "Soporte",
    kicker: "Tercio medio",
    title: "A veces el cambio está en el soporte, no en el volumen visible.",
    body: "Se revisa cómo el tercio medio sostiene las transiciones faciales sin asumir que más producto produce un mejor resultado.",
    hotspot: { left: "46%", top: "43%" }
  },
  {
    id: "profile",
    label: "Perfil",
    kicker: "Relación nariz · labios · mentón",
    title: "El perfil se diseña como una relación, no como una zona aislada.",
    body: "La valoración compara proyección y continuidad entre estructuras antes de considerar cualquier procedimiento.",
    hotspot: { left: "65%", top: "49%" }
  },
  {
    id: "definition",
    label: "Definición",
    kicker: "Tercio inferior",
    title: "Definir no significa endurecer.",
    body: "Mandíbula, mentón y transición cervicofacial se analizan juntos para conservar una lectura natural del rostro.",
    hotspot: { left: "57%", top: "76%" }
  }
] as const;

type ObjectiveId = (typeof objectives)[number]["id"];

export function HarmonizationHero() {
  const [activeId, setActiveId] = useState<ObjectiveId>("balance");
  const active = objectives.find((item) => item.id === activeId) ?? objectives[0];
  const whatsappHref = buildWhatsAppLink(
    "Hola, quiero una valoración de armonización facial y entender qué estructuras conviene priorizar en mi caso."
  );

  return (
    <section className="relative overflow-hidden border-b border-line bg-[#090806]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(210,181,137,0.14),transparent_38%),radial-gradient(circle_at_18%_75%,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] w-[min(1280px,calc(100%-24px))] gap-8 py-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:py-12">
        <div className="relative z-10 order-2 pb-4 lg:order-1 lg:pb-0">
          <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-champagne">
            <ScanFace className="h-4 w-4" /> Diseño facial · Mérida
          </div>

          <h1 className="max-w-[8ch] font-serif text-[clamp(3.4rem,8.8vw,7.9rem)] leading-[0.83] tracking-[-0.075em] text-bone">
            Armonización facial
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
            No se trata de rellenar más. Se trata de entender qué necesita estructura, qué necesita equilibrio y qué conviene no tocar.
          </p>

          <div className="mt-9 flex flex-wrap gap-2" aria-label="Objetivos de valoración facial">
            {objectives.map((item) => {
              const selected = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  data-event={`armonizacion_objective_${item.id}`}
                  aria-pressed={selected}
                  className={`min-h-11 rounded-full border px-4 text-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 ${
                    selected
                      ? "border-champagne/70 bg-champagne text-background"
                      : "border-line bg-white/[0.035] text-muted hover:border-champagne/40 hover:text-bone"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-7 min-h-[190px] max-w-xl rounded-[1.75rem] border border-line bg-white/[0.035] p-6 backdrop-blur-xl sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.2em] text-champagne">{active.kicker}</p>
            <h2 className="mt-3 font-serif text-3xl leading-[1] tracking-[-0.045em] text-bone sm:text-4xl">{active.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{active.body}</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              data-event="whatsapp_armonizacion_interactive"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-champagne px-6 text-sm font-medium text-background transition hover:bg-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60"
            >
              Diseñar mi valoración <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#que-es"
              data-event="armonizacion_explore_content"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line bg-white/[0.03] px-6 text-sm font-medium text-bone transition hover:border-bone/30 hover:bg-white/[0.06]"
            >
              Cómo se decide <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-5 max-w-xl text-xs leading-5 text-quiet">
            Esta experiencia es informativa: no diagnostica, no recomienda cantidades y no sustituye la valoración médica individual.
          </p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[760px] lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-soft shadow-calm sm:rounded-[2.5rem]">
            <Image
              src="/visuals/hautlab-armonizacion.webp"
              alt="Valoración editorial de proporciones y contorno facial para armonización facial"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover object-center scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090806]/90 via-transparent to-[#090806]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090806]/35 via-transparent to-transparent" />

            <svg
              viewBox="0 0 100 125"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
            >
              <path d="M38 20 C53 15 68 26 72 43 C76 60 69 83 53 101" fill="none" stroke="rgba(225,198,157,.45)" strokeWidth="0.35" />
              <path d="M44 38 C52 45 59 47 69 46" fill="none" stroke="rgba(225,198,157,.38)" strokeWidth="0.28" strokeDasharray="1 1.8" />
              <path d="M42 55 C53 58 61 62 66 69" fill="none" stroke="rgba(225,198,157,.34)" strokeWidth="0.28" strokeDasharray="1 1.8" />
              <path d="M38 78 C48 84 57 88 63 91" fill="none" stroke="rgba(225,198,157,.34)" strokeWidth="0.28" strokeDasharray="1 1.8" />
            </svg>

            {activeId === "balance" && (
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute left-[50%] top-[50%] h-[68%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border border-champagne/28 shadow-[0_0_40px_rgba(210,181,137,.08)]" />
                <div className="absolute left-[50%] top-[46%] h-px w-[58%] -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne/45 to-transparent" />
                <div className="absolute left-[50%] top-[62%] h-px w-[50%] -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
                <div className="absolute left-[50%] top-[20%] h-[62%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-champagne/35 to-transparent" />
              </div>
            )}

            {objectives
              .filter((item) => "hotspot" in item)
              .map((item) => {
                const selected = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    data-event={`armonizacion_hotspot_${item.id}`}
                    aria-label={`Explorar ${item.label}`}
                    className={`absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/70 ${
                      selected
                        ? "scale-110 border-champagne bg-champagne text-background shadow-[0_0_0_8px_rgba(210,181,137,.12)]"
                        : "border-bone/35 bg-background/35 text-bone hover:scale-110 hover:border-champagne/70"
                    }`}
                    style={item.hotspot}
                  >
                    <Crosshair className="h-4 w-4" />
                  </button>
                );
              })}

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div className="rounded-full border border-bone/15 bg-background/55 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-bone backdrop-blur-xl">
                {activeId === "balance" ? "Lectura global del rostro" : "Explora zonas · entiende la lectura facial"}
              </div>
              <div className="hidden rounded-full border border-bone/15 bg-background/55 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted backdrop-blur-xl sm:block">
                HAUTLAB facial map
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
