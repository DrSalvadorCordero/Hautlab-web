"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Inbox,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";

type Conversation = {
  id: string;
  phone: string;
  profile_name: string | null;
  city: string | null;
  treatment: string | null;
  stage: string | null;
  ai_mode: string;
  assigned_to: string | null;
  priority: string | null;
  clinical_risk: boolean;
  risk_level: string | null;
  last_intent: string | null;
  next_action: string | null;
  human_review_reason: string | null;
  conversation_summary: string | null;
  patient_goal: string | null;
  handoff_status: string | null;
  bot_paused: boolean;
  last_message_at: string | null;
  last_patient_message_at: string | null;
  last_team_message_at: string | null;
  appointment_status: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  direction: string;
  sender_type: string;
  body: string | null;
  message_type: string;
  status: string | null;
  operator_key: string | null;
  proposed_by: string | null;
  approved_by: string | null;
  created_at: string;
  sent_at: string | null;
};

type InboxPayload = {
  canEdit: boolean;
  selectedId: string | null;
  stats: {
    total: number;
    today: number;
    clinicalRisk: number;
    human: number;
    pending: number;
  };
  conversations: Conversation[];
  messages: Message[];
};

type Filter = "all" | "risk" | "human" | "pending";

function formatTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat("es-MX", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
  ).format(date);
}

function initials(name: string | null, phone: string) {
  const source = name?.trim() || phone.slice(-4);
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

function badgeClass(kind: "risk" | "human" | "neutral" | "ai") {
  if (kind === "risk") return "border-red-400/25 bg-red-400/[0.07] text-red-200";
  if (kind === "human") return "border-amber-300/25 bg-amber-300/[0.06] text-amber-100";
  if (kind === "ai") return "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-100";
  return "border-line bg-white/[0.025] text-muted";
}

async function inboxAction(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/whatsapp-inbox", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "No se pudo completar la acción.");
}

export function WhatsAppLiveInbox() {
  const [data, setData] = useState<InboxPayload | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  async function load(requestedId?: string | null, quiet = false) {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const id = requestedId ?? selectedRef.current;
      const suffix = id ? `?conversationId=${encodeURIComponent(id)}` : "";
      const response = await fetch(`/api/admin/whatsapp-inbox${suffix}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as InboxPayload & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo cargar la bandeja.");
      setData(payload);
      setSelectedId(payload.selectedId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la bandeja.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  useEffect(() => {
    void load(null, false);
    const interval = window.setInterval(() => void load(selectedRef.current, true), 10000);
    return () => window.clearInterval(interval);
  }, []);

  const selected = useMemo(
    () => data?.conversations.find((item) => item.id === selectedId) ?? null,
    [data?.conversations, selectedId],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.conversations ?? []).filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "risk" && item.clinical_risk) ||
        (filter === "human" && (item.bot_paused || Boolean(item.assigned_to))) ||
        (filter === "pending" && (item.handoff_status === "pending" || item.handoff_status === "assigned"));
      if (!matchesFilter) return false;
      if (!needle) return true;
      return [item.profile_name, item.phone, item.treatment, item.stage, item.last_intent]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [data?.conversations, filter, query]);

  async function act(payload: Record<string, unknown>) {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      await inboxAction({ conversationId: selected.id, ...payload });
      await load(selected.id, true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const message = draft.trim();
    if (!message || !selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      await inboxAction({ action: "send", conversationId: selected.id, message });
      setDraft("");
      await load(selected.id, true);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo enviar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6 text-sm text-muted">
        Cargando centro de conversaciones…
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-[1.75rem] border border-red-400/20 bg-red-400/[0.04] p-6 text-sm text-red-200">
        <p>{error ?? "No fue posible cargar la bandeja."}</p>
        <button type="button" onClick={() => void load(null, false)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300/20 px-4 py-2">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </section>
    );
  }

  const stats = [
    { label: "Conversaciones hoy", value: data.stats.today, icon: MessageSquareText },
    { label: "Intervención humana", value: data.stats.human, icon: UserRoundCheck },
    { label: "Alertas clínicas", value: data.stats.clinicalRisk, icon: ShieldAlert },
    { label: "Pases pendientes", value: data.stats.pending, icon: AlertTriangle },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Centro de conversaciones</p>
          <h2 className="mt-2 font-serif text-2xl text-bone sm:text-3xl">Bandeja de WhatsApp</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Conversaciones reales, control humano y alertas clínicas en una sola vista. Actualización automática cada 10 segundos.
          </p>
        </div>
        <button type="button" onClick={() => void load(selectedId, false)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-muted transition hover:text-bone">
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[1.25rem] border border-line bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted">{label}</p>
              <Icon className="h-4 w-4 text-champagne" />
            </div>
            <p className="mt-3 text-2xl font-medium text-bone">{value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="grid min-h-[690px] overflow-hidden rounded-[1.75rem] border border-line bg-white/[0.018] xl:grid-cols-[360px_1fr]">
        <aside className="border-b border-line p-4 xl:border-b-0 xl:border-r">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar conversación"
              className="w-full rounded-xl border border-line bg-black/20 py-2.5 pl-9 pr-3 text-sm text-bone outline-none focus:border-champagne/50"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              ["all", "Todas"],
              ["risk", "Riesgo"],
              ["human", "Humano"],
              ["pending", "Pendientes"],
            ] as Array<[Filter, string]>).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === key ? "border-champagne/40 bg-champagne/[0.07] text-bone" : "border-line text-muted hover:text-bone"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 max-h-[580px] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">No hay conversaciones con este filtro.</div>
            ) : filtered.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelectedId(item.id); void load(item.id, true); }}
                  className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-champagne/45 bg-champagne/[0.06]" : "border-line bg-black/10 hover:bg-white/[0.03]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.03] text-xs font-medium text-bone">
                      {initials(item.profile_name, item.phone)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-bone">{item.profile_name || item.phone}</p>
                        <span className="shrink-0 text-[10px] text-muted">{formatTime(item.last_message_at)}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted">{item.treatment || item.last_intent || item.stage || "Conversación"}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.clinical_risk ? <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badgeClass("risk")}`}>Riesgo clínico</span> : null}
                        {item.bot_paused || item.assigned_to ? <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badgeClass("human")}`}>Humano</span> : <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badgeClass("ai")}`}>IA activa</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-[690px] flex-col">
          {selected ? (
            <>
              <header className="border-b border-line p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-bone">{selected.profile_name || "Paciente"}</h3>
                      {selected.clinical_risk ? <ShieldAlert className="h-4 w-4 text-red-300" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted">{selected.phone}{selected.city ? ` · ${selected.city}` : ""}{selected.stage ? ` · ${selected.stage}` : ""}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.treatment ? <span className={`rounded-full border px-2.5 py-1 text-[10px] ${badgeClass("neutral")}`}>{selected.treatment}</span> : null}
                      {selected.assigned_to ? <span className={`rounded-full border px-2.5 py-1 text-[10px] ${badgeClass("human")}`}>Asignado: {selected.assigned_to}</span> : null}
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] ${badgeClass(selected.bot_paused ? "human" : "ai")}`}>{selected.bot_paused ? "IA pausada" : "IA disponible"}</span>
                    </div>
                  </div>
                  {data.canEdit ? (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => void act({ action: "take", operator: "doctor" })} className="rounded-full border border-line px-3 py-2 text-xs text-muted hover:text-bone disabled:opacity-40">Tomar Dr.</button>
                      <button type="button" disabled={busy} onClick={() => void act({ action: "take", operator: "karen" })} className="rounded-full border border-line px-3 py-2 text-xs text-muted hover:text-bone disabled:opacity-40">Tomar Karen</button>
                      <button type="button" disabled={busy} onClick={() => void act({ action: "resume" })} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-300/[0.05] disabled:opacity-40"><Bot className="h-3.5 w-3.5" /> Reactivar IA</button>
                      <button type="button" disabled={busy} onClick={() => void act({ action: "close" })} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-muted hover:text-bone disabled:opacity-40"><CheckCircle2 className="h-3.5 w-3.5" /> Cerrar</button>
                    </div>
                  ) : null}
                </div>
                {selected.human_review_reason || selected.conversation_summary || selected.patient_goal ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {selected.human_review_reason ? <div className="rounded-xl border border-red-400/15 bg-red-400/[0.03] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-red-200">Motivo de pase</p><p className="mt-1 text-xs leading-5 text-muted">{selected.human_review_reason}</p></div> : null}
                    {selected.conversation_summary ? <div className="rounded-xl border border-line bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-muted">Resumen</p><p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{selected.conversation_summary}</p></div> : null}
                    {selected.patient_goal ? <div className="rounded-xl border border-line bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-muted">Objetivo</p><p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{selected.patient_goal}</p></div> : null}
                  </div>
                ) : null}
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-black/[0.08] p-5">
                {data.messages.length === 0 ? (
                  <div className="flex min-h-64 items-center justify-center text-sm text-muted">Aún no hay mensajes almacenados en esta conversación.</div>
                ) : data.messages.map((message) => {
                  const outbound = message.direction === "outbound";
                  const draftMessage = message.status === "draft";
                  return (
                    <div key={message.id} className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-2xl border px-4 py-3 ${draftMessage ? "border-champagne/25 bg-champagne/[0.05]" : outbound ? "border-line bg-white/[0.055]" : "border-line bg-black/25"}`}>
                        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
                          <span>{message.sender_type === "patient" ? "Paciente" : message.sender_type === "ai" ? "IA" : "HAUTLAB"}</span>
                          {draftMessage ? <span className="text-champagne">Borrador</span> : null}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-bone">{message.body || `[${message.message_type}]`}</p>
                        <p className="mt-1.5 text-right text-[10px] text-muted">{formatTime(message.sent_at || message.created_at)}{message.status ? ` · ${message.status}` : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="border-t border-line p-4">
                <div className="flex gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    placeholder={data.canEdit ? "Responder como equipo HAUTLAB…" : "Acceso de solo lectura"}
                    readOnly={!data.canEdit}
                    className="min-h-12 flex-1 resize-none rounded-xl border border-line bg-black/20 px-3 py-3 text-sm text-bone outline-none focus:border-champagne/50"
                  />
                  <button type="button" onClick={() => void send()} disabled={!data.canEdit || busy || !draft.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-bone px-5 text-sm font-medium text-[#0b0a09] transition hover:opacity-90 disabled:opacity-35">
                    <Send className="h-4 w-4" /> Enviar
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-muted">El envío manual pausa la IA para evitar respuestas simultáneas. Reactívala cuando termines.</p>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <Inbox className="mx-auto h-7 w-7 text-muted" />
                <p className="mt-3 text-sm text-muted">No hay conversaciones disponibles.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {data.stats.clinicalRisk > 0 ? (
        <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-400/20 bg-red-400/[0.035] p-4">
          <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-red-200" />
          <p className="text-xs leading-5 text-red-100">Hay conversaciones marcadas con riesgo clínico. En esos casos la IA debe permanecer fuera de la toma de decisiones clínicas y el seguimiento corresponde al médico.</p>
        </div>
      ) : null}
    </section>
  );
}
