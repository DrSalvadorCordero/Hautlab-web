"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAttributedWhatsAppUrl } from "@/lib/client/growth-attribution";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type Recommendation = {
  key: string;
  name: string;
  why: string;
  publicPrice: number | null;
  preferentialPrice: number | null;
  installments: string | null;
};

type PlanResult = {
  code: string;
  portalUrl: string;
  recommendations: Recommendation[];
  estimate: {
    min: number | null;
    max: number | null;
    currency: "MXN";
  };
};

const GOALS = [
  {
    id: "rested",
    title: "Verme menos cansado",
    detail: "Ojeras, expresión y soporte del tercio medio.",
  },
  {
    id: "definition",
    title: "Definir mi rostro",
    detail: "Mentón, mandíbula y lectura del tercio inferior.",
  },
  {
    id: "profile",
    title: "Mejorar mi perfil",
    detail: "Nariz, proyección y equilibrio de perfil.",
  },
  {
    id: "lips",
    title: "Labios más armónicos",
    detail: "Proporción, soporte y definición sin un volumen predeterminado.",
  },
  {
    id: "texture",
    title: "Mejorar textura",
    detail: "Poros, cicatrices y calidad de superficie.",
  },
  {
    id: "acne",
    title: "Tratar acné y marcas",
    detail: "Primero control médico; después textura y pigmentación.",
  },
  {
    id: "skin_quality",
    title: "Mejorar calidad de piel",
    detail: "Colágeno, hidratación y mantenimiento progresivo.",
  },
  {
    id: "clinical_skin",
    title: "Tengo un problema de piel",
    detail: "Cuando no sabes si necesitas tratamiento médico o procedimiento.",
  },
] as const;

const PRIORITIES = [
  { id: "natural", label: "Que se vea natural" },
  { id: "low_downtime", label: "Poco tiempo de recuperación" },
  { id: "single_visit", label: "Resolver lo posible en una visita" },
  { id: "skin_first", label: "Priorizar salud y calidad de piel" },
] as const;

const TIMING = [
  { id: "now", label: "Quiero avanzar pronto" },
  { id: "month", label: "Dentro del próximo mes" },
  { id: "exploring", label: "Apenas estoy explorando" },
] as const;

const BUDGET = [
  { id: "focused", label: "Prefiero empezar por una prioridad" },
  { id: "flexible", label: "Puedo construir un plan por etapas" },
  { id: "unsure", label: "Quiero entender opciones primero" },
] as const;

const INVESTMENT_RANGE = [
  { id: "under_5k", label: "Hasta $5,000 MXN" },
  { id: "5k_10k", label: "$5,000 – $10,000 MXN" },
  { id: "10k_20k", label: "$10,000 – $20,000 MXN" },
  { id: "over_20k", label: "Más de $20,000 MXN" },
  { id: "unsure", label: "Prefiero definirlo después" },
] as const;

const STORAGE_KEY = "hautlab_plan_v1";

function money(value: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PlanBuilder() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [timing, setTiming] = useState("exploring");
  const [budget, setBudget] = useState("unsure");
  const [investmentRange, setInvestmentRange] = useState("unsure");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const canContinue = useMemo(() => {
    if (step === 0) return goals.length > 0;
    return true;
  }, [goals.length, step]);

  function toggleGoal(id: string) {
    setGoals((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  function togglePriority(id: string) {
    setPriorities((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  async function createPlan() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          priorities,
          preferences: { timing, budget, investmentRange },
          language: "es",
          sourcePath: window.location.pathname,
        }),
      });
      if (!response.ok) throw new Error("plan_unavailable");
      const payload = (await response.json()) as PlanResult;
      setResult(payload);
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            code: payload.code,
            portalUrl: payload.portalUrl,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // The plan still works even when local storage is unavailable.
      }
    } catch {
      setError("No pude guardar tu plan en este momento. Puedes intentarlo de nuevo o continuar por WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  async function continueOnWhatsApp() {
    if (!result) return;
    const base = buildWhatsAppLink(
      `Hola, hice mi plan HAUTLAB y quiero continuar con una valoración.\nPlan: ${result.code}`,
    );
    const attributed = await buildAttributedWhatsAppUrl(base, "es");
    window.location.assign(attributed);
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-[2rem] border border-line bg-white/[0.035] p-6 shadow-calm sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-champagne">Tu plan inicial</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em] text-bone sm:text-5xl">
                Ya tienes un HAUTLAB Code.
              </h2>
            </div>
            <div className="hidden rounded-full border border-line bg-white/[0.04] p-3 text-champagne sm:block">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 rounded-3xl border border-champagne/25 bg-champagne/[0.07] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">HAUTLAB Code</p>
              <p className="mt-1 font-serif text-3xl tracking-[-0.03em] text-bone">{result.code}</p>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-bone transition hover:border-champagne/50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Posibilidades a valorar</p>
            <div className="mt-4 divide-y divide-line rounded-[1.6rem] border border-line bg-background/45">
              {result.recommendations.map((item) => {
                const low = money(item.preferentialPrice ?? item.publicPrice);
                const high = money(item.publicPrice);
                return (
                  <div key={item.key} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div>
                      <h3 className="text-base font-medium text-bone">{item.name}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{item.why}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      {low ? (
                        <>
                          <p className="text-sm font-medium text-bone">
                            {low}{high && high !== low ? ` – ${high}` : ""}
                          </p>
                          {item.installments ? (
                            <p className="mt-1 max-w-40 text-xs leading-5 text-quiet">{item.installments}</p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-xs text-quiet">Precio después de valoración</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-quiet">
              Esto no es diagnóstico ni cotización. El orden, la indicación y el costo final dependen de valoración médica y de tu anatomía.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button type="button" size="lg" onClick={continueOnWhatsApp}>
              Continuar por WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={result.portalUrl}>Abrir My HAUTLAB</a>
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white/[0.025] p-4 text-xs leading-5 text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
            Tu plan guarda preferencias y objetivos, no fotografías, diagnósticos ni historia clínica.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 flex items-center justify-center gap-2" aria-label={`Paso ${step + 1} de 3`}>
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className={
              item === step
                ? "h-2.5 w-8 rounded-full bg-bone"
                : item < step
                  ? "h-2.5 w-8 rounded-full bg-champagne"
                  : "h-2.5 w-8 rounded-full bg-white/10"
            }
          />
        ))}
      </div>

      <div className="rounded-[2rem] border border-line bg-white/[0.035] p-5 shadow-calm sm:p-8 lg:p-10">
        {step === 0 ? (
          <>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">01 · Objetivo</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.05em] text-bone sm:text-5xl">
              ¿Qué quieres que cambie primero?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              Elige hasta tres. No estás escogiendo procedimientos; estás definiendo objetivos.
            </p>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {GOALS.map((goal) => {
                const selected = goals.includes(goal.id);
                return (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "min-h-32 rounded-3xl border border-champagne bg-champagne/[0.09] p-5 text-left transition"
                        : "min-h-32 rounded-3xl border border-line bg-background/40 p-5 text-left transition hover:border-bone/25 hover:bg-white/[0.035]"
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-medium text-bone">{goal.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">{goal.detail}</p>
                      </div>
                      <span
                        className={
                          selected
                            ? "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bone text-background"
                            : "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-transparent"
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">02 · Prioridades</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.05em] text-bone sm:text-5xl">
              ¿Cómo quieres construir el resultado?
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">Elige hasta tres criterios importantes para ti.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {PRIORITIES.map((item) => {
                const selected = priorities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePriority(item.id)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "flex min-h-20 items-center justify-between rounded-3xl border border-champagne bg-champagne/[0.09] px-5 text-left text-sm font-medium text-bone"
                        : "flex min-h-20 items-center justify-between rounded-3xl border border-line bg-background/40 px-5 text-left text-sm font-medium text-bone transition hover:border-bone/25"
                    }
                  >
                    {item.label}
                    {selected ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">03 · Contexto</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.05em] text-bone sm:text-5xl">
              Tres datos para ordenar tu plan.
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-medium text-bone">¿Cuándo te gustaría avanzar?</legend>
                <div className="mt-3 space-y-2">
                  {TIMING.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-background/40 p-4 text-sm text-muted">
                      <input
                        type="radio"
                        name="timing"
                        value={item.id}
                        checked={timing === item.id}
                        onChange={() => setTiming(item.id)}
                        className="accent-[#c8b39a]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-bone">¿Cómo prefieres invertir?</legend>
                <div className="mt-3 space-y-2">
                  {BUDGET.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-background/40 p-4 text-sm text-muted">
                      <input
                        type="radio"
                        name="budget"
                        value={item.id}
                        checked={budget === item.id}
                        onChange={() => setBudget(item.id)}
                        className="accent-[#c8b39a]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset className="mt-8">
              <legend className="text-sm font-medium text-bone">
                ¿Qué rango te gustaría invertir en esta etapa?
              </legend>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-quiet">
                Es una referencia para ordenar opciones; no cambia la indicación médica ni constituye una cotización.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {INVESTMENT_RANGE.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-background/40 p-4 text-sm text-muted">
                    <input
                      type="radio"
                      name="investmentRange"
                      value={item.id}
                      checked={investmentRange === item.id}
                      onChange={() => setInvestmentRange(item.id)}
                      className="accent-[#c8b39a]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {error ? <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-100">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || loading}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Atrás
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((current) => Math.min(2, current + 1))}
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={loading} onClick={createPlan}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Crear mi plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
