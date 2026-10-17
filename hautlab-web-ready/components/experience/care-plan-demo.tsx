"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type PanelKey = "fase1" | "fase2" | "cuidados" | "alertas";
type CareItem = { title: string; explanation: string };

const panels: Array<{
  id: PanelKey;
  number: string;
  tab: string;
  eyebrow: string;
  heading: string;
  lead: string;
  items: CareItem[];
}> = [
  {
    id: "fase1",
    number: "01",
    tab: "Calmar la piel",
    eyebrow: "Ejemplo · días 1–3",
    heading: "Control de la inflamación",
    lead: "La prioridad es recuperar la tolerancia cutánea antes de introducir otro producto activo.",
    items: [
      {
        title: "Pausar los productos que provocan ardor",
        explanation: "No insistir con ketoconazol facial ni reiniciar Synalar por cuenta propia.",
      },
      {
        title: "Tratamiento antiinflamatorio solo bajo indicación individual",
        explanation: "En algunos brotes se utiliza desonida 0.05% en capa fina durante un periodo muy breve. No iniciar ni repetir corticoides sin que el profesional confirme la pauta.",
      },
      {
        title: "Proteger la barrera cutánea",
        explanation: "Limpieza suave y una capa fina de vaselina blanca pura, si se tolera. Evitar agua caliente y fricción.",
      },
      {
        title: "Documentar cómo evoluciona el brote",
        explanation: "Comparar enrojecimiento y ardor; si empeora o no mejora, solicitar revisión clínica.",
      },
    ],
  },
  {
    id: "fase2",
    number: "02",
    tab: "Control antifúngico",
    eyebrow: "Ejemplo · después de mejorar",
    heading: "Introducción gradual",
    lead: "Iniciar únicamente cuando el ardor haya cedido claramente y el profesional confirme el tratamiento.",
    items: [
      {
        title: "Confirmar que la piel está menos reactiva",
        explanation: "No comenzar nuevos activos sobre placas intensamente inflamadas.",
      },
      {
        title: "Valorar un antifúngico alternativo",
        explanation: "El ciclopirox olamina 1% es una alternativa tópica para dermatitis seborreica. La frecuencia y duración deben estar indicadas individualmente.",
      },
      {
        title: "Introducir un solo producto a la vez",
        explanation: "Observar tolerancia antes de aumentar la frecuencia. Suspender y avisar si reaparece ardor o inflamación relevante.",
      },
      {
        title: "Diferenciar dermatitis seborreica de pitiriasis versicolor",
        explanation: "Las placas de distinta pigmentación pueden necesitar confirmación diagnóstica; la luz de Wood sola no confirma una micosis.",
      },
    ],
  },
  {
    id: "cuidados",
    number: "03",
    tab: "Cuidados diarios",
    eyebrow: "Durante todas las fases",
    heading: "Lo que ayuda a recuperar la piel",
    lead: "Cuidados sencillos y consistentes. No hace falta añadir más productos.",
    items: [
      { title: "No exfoliar", explanation: "Evitar ácidos, retinoides, cepillos faciales y productos con fragancia que produzcan ardor." },
      { title: "Limpiar sin tallar", explanation: "Usar agua tibia y, si la piel lo tolera, un limpiador suave." },
      { title: "Proteger del sol", explanation: "Priorizar sombra y barreras físicas; retomar protector solar cuando sea tolerado." },
      { title: "No modificar el esquema por cuenta propia", explanation: "No mezclar cremas, reiniciar corticoides ni añadir tratamientos orales sin confirmación médica." },
    ],
  },
  {
    id: "alertas",
    number: "04",
    tab: "Señales de alarma",
    eyebrow: "Atención prioritaria",
    heading: "Cuándo pedir ayuda",
    lead: "No esperar una respuesta por mensajería si aparecen síntomas oculares o deterioro importante.",
    items: [
      { title: "Dolor ocular, fotofobia o cambios en la visión", explanation: "Requieren valoración médica urgente." },
      { title: "Hinchazón progresiva alrededor de los ojos", explanation: "Buscar atención médica presencial sin demora." },
      { title: "Ampollas, secreción, fiebre o dolor importante", explanation: "Necesitan evaluación para descartar complicaciones e infección secundaria." },
      { title: "Empeoramiento rápido o falta de mejoría", explanation: "Solicitar revaloración presencial; una fotografía no sustituye una exploración." },
    ],
  },
];

const contactUrl = buildWhatsAppLink(
  "Hola, quisiera coordinar una revisión de mi tratamiento dermatológico con el equipo de HAUTLAB."
);

export function CarePlanDemo() {
  const [selected, setSelected] = useState<PanelKey>("fase1");
  const [read, setRead] = useState<Record<string, boolean>>({});
  const active = panels.find((panel) => panel.id === selected) ?? panels[0];
  const isAlert = selected === "alertas";
  const readCount = active.items.filter((_, index) => read[active.id + ":" + index]).length;

  function toggleRead(index: number) {
    const key = active.id + ":" + index;
    setRead((previous) => ({ ...previous, [key]: !previous[key] }));
  }

  return (
    <section aria-label="Demo de Care Plan" className="overflow-hidden rounded-[2rem] border border-line bg-white/[0.025]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-6 sm:px-9">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Care Plan / vista de demostración</p>
          <p className="mt-2 text-sm text-muted">Ejemplo de manejo dermatológico por fases · no asignado a un paciente</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-champagne" aria-hidden="true" />
          Sin datos clínicos personales
        </span>
      </div>

      <div className="grid gap-px border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-4" aria-label="Secciones del plan">
        {panels.map((panel) => {
          const isActive = panel.id === selected;
          return (
            <button
              key={panel.id}
              type="button"
              aria-pressed={isActive}
              aria-controls="care-plan-detail"
              onClick={() => setSelected(panel.id)}
              className={
                "min-h-24 bg-background px-5 py-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-champagne " +
                (isActive ? "text-bone" : "text-muted hover:text-bone")
              }
            >
              <span className="flex items-center justify-between gap-3">
                <span className={"text-xs tracking-[0.16em] " + (isActive ? "text-champagne" : "text-quiet")}>{panel.number}</span>
                {isActive ? <CheckCircle2 className="h-4 w-4 text-champagne" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </span>
              <span className="mt-3 block text-sm font-medium">{panel.tab}</span>
              <span className={"mt-3 block h-px w-full " + (isActive ? "bg-champagne" : "bg-line")} />
            </button>
          );
        })}
      </div>

      <div id="care-plan-detail" aria-live="polite" className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[.75fr_1.25fr] lg:gap-12 lg:p-12">
        <div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-champagne">
            {isAlert ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : selected === "fase1" ? <HeartPulse className="h-5 w-5" aria-hidden="true" /> : selected === "fase2" ? <Sparkles className="h-5 w-5" aria-hidden="true" /> : <ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
            {active.eyebrow}
          </div>
          <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.1rem)] leading-[.98] tracking-[-.05em] text-bone">{active.heading}</h2>
          <p className="mt-6 text-sm leading-7 text-muted">{active.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-champagne px-5 py-3 text-sm font-medium text-background transition hover:opacity-90">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Solicitar seguimiento
            </a>
          </div>
          <p className="mt-5 text-xs leading-6 text-quiet">
            Este demo no determina cuándo avanzar de fase. El ajuste del tratamiento corresponde al profesional tratante.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-line bg-background/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-7">
            <div>
              <p className="text-sm font-medium text-bone">{isAlert ? "Criterios de atención" : "Pasos de orientación"}</p>
              <p className="mt-1 text-xs text-quiet">{isAlert ? "Ante señales graves, busca atención inmediata." : "Puedes marcar lo que ya leíste."}</p>
            </div>
            {!isAlert && (
              <span className="rounded-full border border-line px-3 py-2 text-xs tabular-nums text-muted">
                Leídos {readCount} de {active.items.length}
              </span>
            )}
          </div>

          <ol className="divide-y divide-line">
            {active.items.map((item, index) => {
              const checked = Boolean(read[active.id + ":" + index]);
              return (
                <li key={item.title} className="p-5 sm:p-7">
                  <div className="flex items-start gap-4">
                    {isAlert ? (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10 text-red-200">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={(checked ? "Desmarcar lectura: " : "Marcar como leído: ") + item.title}
                        aria-pressed={checked}
                        onClick={() => toggleRead(index)}
                        className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne " + (checked ? "border-champagne bg-champagne text-background" : "border-line text-muted hover:border-champagne hover:text-bone")}
                      >
                        {checked ? <Check className="h-5 w-5" aria-hidden="true" /> : <span className="text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>}
                      </button>
                    )}
                    <div>
                      <p className="text-sm font-medium leading-6 text-bone">{item.title}</p>
                      <p className="mt-2 text-xs leading-6 text-muted">{item.explanation}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {!isAlert && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-7">
              <p className="max-w-sm text-xs leading-5 text-quiet">Las marcas solo sirven para organizar la lectura en esta sesión. No se guardan ni registran cumplimiento clínico.</p>
              <button type="button" onClick={() => setRead((previous) => Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith(active.id + ":"))))} className="inline-flex items-center gap-2 text-xs text-muted underline underline-offset-4 transition hover:text-bone">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reiniciar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
