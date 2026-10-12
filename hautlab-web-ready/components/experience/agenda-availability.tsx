"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, RefreshCcw, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { PublicAppointmentAvailability, PublicAppointmentSlot } from "@/lib/agenda-availability";

type ChosenSlot = PublicAppointmentSlot | null;

const fallbackLink = buildWhatsAppLink("Hola, deseo agendar una valoración en HAUTLAB. ¿Podrían compartirme opciones de horario para Mérida?");

function dayTitle(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return value;
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 16));
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Merida", weekday: "long", day: "numeric", month: "long",
  }).format(date);
}

function requestLink(slot: PublicAppointmentSlot) {
  const date = new Date(slot.startsAt);
  const when = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Merida", weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
  return buildWhatsAppLink(
    `Hola, quiero solicitar una valoración médica en HAUTLAB el ${when} (hora Mérida). Vi este horario orientativo en su página. Entiendo que no queda reservado hasta que me confirmen.`,
  );
}

export function AgendaAvailability() {
  const [result, setResult] = useState<PublicAppointmentAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChosenSlot>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const response = await fetch("/api/agenda/disponibilidad", { cache: "no-store" });
      const data = (await response.json()) as PublicAppointmentAvailability;
      if (!response.ok || data.status !== "ok" || !Array.isArray(data.days)) {
        setResult({ status: "unavailable", checkedAt: null, days: [] });
      } else setResult(data);
    } catch {
      setResult({ status: "unavailable", checkedAt: null, days: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const count = useMemo(() => result?.days.reduce((sum, day) => sum + day.slots.length, 0) ?? 0, [result]);
  const updated = result?.checkedAt ? new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Merida", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(result.checkedAt)) : null;

  return (
    <div className="rounded-[2rem] border border-line bg-white/[0.025] p-5 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-champagne">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Próximos siete días
          </p>
          <h2 className="mt-4 font-serif text-3xl tracking-[-.045em] text-bone sm:text-4xl">Horarios orientativos</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {loading ? "Consultando la última disponibilidad verificada." :
              result?.status === "ok" ? `Agenda consultada a las ${updated ?? "—"} h (Mérida). Horarios sujetos a confirmación.` :
              "No podemos verificar horarios en este momento. Puedes coordinar tu cita directamente."}
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-bone transition hover:border-champagne/45 disabled:opacity-50">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      <div className="mt-8" aria-live="polite">
        {loading ? (
          <div role="status" className="grid min-h-40 place-items-center rounded-[1.5rem] border border-line text-sm text-muted">
            Consultando horarios…
          </div>
        ) : result?.status === "ok" && count > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {result.days.map((day) => (
              <div key={day.date} className="rounded-[1.4rem] border border-line bg-background/65 p-5">
                <h3 className="text-sm font-medium capitalize text-bone">{dayTitle(day.date)}</h3>
                <div className="mt-4 flex flex-wrap gap-2" aria-label={`Horarios para ${dayTitle(day.date)}`}>
                  {day.slots.map((slot) => (
                    <button key={slot.startsAt} type="button" aria-pressed={selected?.startsAt === slot.startsAt}
                      onClick={() => setSelected(slot)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne ${selected?.startsAt === slot.startsAt ? "border-champagne bg-champagne text-background" : "border-line text-bone hover:border-champagne/60"}`}>
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-line p-7 text-sm leading-7 text-muted">
            {result?.status === "ok" ? "No se encontraron propuestas de horario en los próximos siete días en la última consulta." :
              "La disponibilidad no está verificada ahora. No mostraremos horarios antiguos como si estuvieran disponibles."}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-line pt-7">
        <a href={selected ? requestLink(selected) : fallbackLink} target="_blank" rel="noreferrer"
          data-event={selected ? "agenda_slot_whatsapp_request" : "agenda_assisted_whatsapp_request"}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background transition hover:opacity-90">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {selected ? "Solicitar el horario seleccionado" : "Coordinar por WhatsApp"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <p className="max-w-lg text-xs leading-6 text-quiet">
          {selected ? `Horario seleccionado: ${selected.label} h. El equipo debe reconfirmarlo en Nimbo.` :
            "Consulta orientativa. No se ha creado una reserva ni se ha realizado ningún cobro."}
        </p>
      </div>
    </div>
  );
}
