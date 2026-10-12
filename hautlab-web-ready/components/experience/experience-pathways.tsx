"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, HeartHandshake, MessageCircle } from "lucide-react";
import { PlanResume } from "@/components/plan/plan-resume";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type Stage = "preparar" | "coordinar" | "seguimiento";

const stages = [
  {
    id: "preparar" as const,
    label: "Antes de la valoración",
    kicker: "01 · Preparación",
    title: "Aclara tus prioridades.",
    summary: "Construye un punto de partida. El Plan HAUTLAB ayuda a ordenar tus objetivos; no prescribe ni determina procedimientos.",
    steps: [
      "Identifica qué quieres mejorar y qué deseas conservar.",
      "Revisa tu plan orientativo y llévalo a la valoración.",
      "El equipo confirma el horario de tu cita por un canal directo."
    ],
    cta: "Diseñar mi Plan HAUTLAB",
    href: "/plan",
    icon: ClipboardList
  },
  {
    id: "coordinar" as const,
    label: "Coordinar la atención",
    kicker: "02 · Coordinación",
    title: "Confirma antes de trasladarte.",
    summary: "La solicitud por WhatsApp inicia la coordinación. Un pago o una solicitud enviados desde la web no asignan automáticamente una fecha.",
    steps: [
      "Solicita disponibilidad al equipo de HAUTLAB.",
      "Recibe la confirmación expresa de fecha, hora y modalidad.",
      "Si te indican un anticipo, usa solamente el enlace de pago confirmado."
    ],
    cta: "Solicitar disponibilidad",
    href: buildWhatsAppLink("Hola, deseo coordinar una valoración en HAUTLAB. ¿Podrían confirmarme la disponibilidad?"),
    icon: CalendarDays
  },
  {
    id: "seguimiento" as const,
    label: "Después de mi atención",
    kicker: "03 · Continuidad",
    title: "El cuidado tiene seguimiento.",
    summary: "Conserva las indicaciones entregadas en consulta y solicita revisión cuando corresponda. El equipo establece el canal y el tiempo de respuesta.",
    steps: [
      "Sigue exclusivamente las indicaciones específicas de tu profesional.",
      "Solicita al equipo tu fecha de revisión o aclaración de cuidados.",
      "Si presentas una urgencia, acude a atención médica inmediata: no esperes respuesta por mensajería."
    ],
    cta: "Solicitar seguimiento",
    href: buildWhatsAppLink("Hola, ya fui atendido(a) en HAUTLAB y necesito coordinar mi seguimiento con el equipo."),
    icon: HeartHandshake
  }
] as const;

export function ExperiencePathways() {
  const [selected, setSelected] = useState<Stage>("preparar");
  const active = stages.find((stage) => stage.id === selected) ?? stages[0];
  const Icon = active.icon;
  const external = active.href.startsWith("https://");

  return (
    <div className="mt-9 overflow-hidden rounded-[2rem] border border-line bg-white/[0.025]">
      <div role="tablist" aria-label="Etapa de atención" className="grid gap-px border-b border-line bg-line sm:grid-cols-3">
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            id={`experience-tab-${stage.id}`}
            aria-controls="experience-panel"
            aria-selected={selected === stage.id}
            onClick={() => setSelected(stage.id)}
            className={`min-h-16 bg-background px-5 py-4 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-champagne ${selected === stage.id ? "text-champagne" : "text-muted hover:text-bone"}`}
          >
            <span className="mr-3 text-xs opacity-65">0{stages.indexOf(stage) + 1}</span>
            {stage.label}
          </button>
        ))}
      </div>

      <div id="experience-panel" role="tabpanel" aria-labelledby={`experience-tab-${active.id}`} tabIndex={0} className="grid gap-8 p-6 outline-none sm:p-9 lg:grid-cols-[1.2fr_.8fr] lg:gap-14 lg:p-12">
        <div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.19em] text-champagne">
            <Icon className="h-5 w-5" aria-hidden="true" />
            {active.kicker}
          </div>
          <h3 className="mt-6 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[.96] tracking-[-.055em] text-bone">{active.title}</h3>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted">{active.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            {external ? (
              <a href={active.href} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background transition hover:opacity-90">
                {active.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link href={active.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background transition hover:opacity-90">
                {active.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {selected === "coordinar" && (
              <Link href="/pagos" className="text-sm text-bone underline decoration-line underline-offset-8 transition hover:text-champagne">Consultar pagos</Link>
            )}
          </div>
          {selected === "preparar" && <PlanResume />}
          {selected === "seguimiento" && (
            <p className="mt-6 flex max-w-xl items-start gap-2 text-xs leading-6 text-quiet">
              <MessageCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              Evita enviar datos clínicos sensibles en un primer mensaje. Si hay dolor intenso, cambios de visión, dificultad para respirar u otro signo de alarma, busca atención urgente.
            </p>
          )}
        </div>
        <ol className="space-y-6 rounded-[1.5rem] border border-line bg-background/65 p-6 sm:p-8">
          {active.steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[2rem_1fr] items-start gap-3">
              <span className="font-serif text-2xl text-champagne">0{index + 1}</span>
              <span className="pt-1 text-sm leading-7 text-muted">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
