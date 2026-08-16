"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Bot,
  DollarSign,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { WhatsAppPromptEditor } from "@/components/admin/whatsapp-prompt-editor";

type ConsoleTab = "prompt" | "memory" | "knowledge" | "prices" | "bot";

type KnowledgeItem = {
  id: string;
  knowledge_key: string;
  category: string;
  city: string | null;
  title: string;
  content: string;
  priority: number;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  source_note: string | null;
  updated_at: string | null;
};

type ServiceItem = {
  id: string;
  city: string;
  service_key: string;
  service_name: string;
  price_mxn: string | number | null;
  cash_price_mxn: string | number | null;
  installments: string | null;
  includes: string | null;
  notes: string | null;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  updated_at: string | null;
};

type MemoryItem = {
  id: string;
  profile_name: string | null;
  phone: string;
  city: string | null;
  treatment: string | null;
  stage: string | null;
  conversation_summary: string | null;
  patient_goal: string | null;
  communication_style: string | null;
  language: string | null;
  pending_question: string | null;
  last_question_asked: string | null;
  objection: string | null;
  appointment_date_preference: string | null;
  appointment_time_preference: string | null;
  known_facts: Record<string, unknown> | null;
  missing_information: unknown[] | null;
  last_message_at: string | null;
};

type ConsolePayload = {
  canEdit: boolean;
  routerModel: string;
  safetyInstructions: string;
  settings: {
    global_mode: "off" | "manual" | "supervised" | "automatic";
    emergency_stop: boolean;
    updated_at: string | null;
    updated_by: string | null;
  };
  knowledge: KnowledgeItem[];
  services: ServiceItem[];
  memories: MemoryItem[];
};

const tabs: Array<{
  key: ConsoleTab;
  label: string;
  description: string;
  icon: typeof Bot;
}> = [
  { key: "prompt", label: "Prompt", description: "Voz y reglas", icon: Bot },
  { key: "memory", label: "Memoria", description: "Contexto por paciente", icon: Brain },
  { key: "knowledge", label: "Conocimiento", description: "Reglas y hechos", icon: BookOpen },
  { key: "prices", label: "Precios", description: "Catálogo autorizado", icon: DollarSign },
  { key: "bot", label: "Bot", description: "Modo y seguridad", icon: ShieldCheck },
];

function fieldClass() {
  return "w-full rounded-xl border border-line bg-black/20 px-3 py-2.5 text-sm text-bone outline-none transition focus:border-champagne/60";
}

function textAreaClass() {
  return `${fieldClass()} min-h-28 resize-y leading-6`;
}

function nullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

async function putConsole(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/whatsapp-console", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    item?: unknown;
    updatedAt?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "No se pudo guardar el cambio.");
  return body;
}

function StatusMessage({ value }: { value: string | null }) {
  if (!value) return null;
  return (
    <p className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-100">
      {value}
    </p>
  );
}

function ErrorMessage({ value }: { value: string | null }) {
  if (!value) return null;
  return (
    <p className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm text-red-200">
      {value}
    </p>
  );
}

function KnowledgePanel({
  items,
  canEdit,
  onRefresh,
}: {
  items: KnowledgeItem[];
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | "new">(items[0]?.id ?? "new");
  const selected = selectedId === "new" ? null : items.find((item) => item.id === selectedId) ?? null;
  const [draft, setDraft] = useState({
    knowledgeKey: "",
    category: "general",
    city: "",
    title: "",
    content: "",
    priority: "100",
    active: true,
    validFrom: "",
    validUntil: "",
    sourceNote: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setDraft({
        knowledgeKey: "",
        category: "general",
        city: "",
        title: "",
        content: "",
        priority: "100",
        active: true,
        validFrom: "",
        validUntil: "",
        sourceNote: "",
      });
      return;
    }
    setDraft({
      knowledgeKey: selected.knowledge_key,
      category: selected.category,
      city: selected.city ?? "",
      title: selected.title,
      content: selected.content,
      priority: String(selected.priority),
      active: selected.active,
      validFrom: selected.valid_from ?? "",
      validUntil: selected.valid_until ?? "",
      sourceNote: selected.source_note ?? "",
    });
  }, [selectedId, selected]);

  async function save() {
    if (!canEdit || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await putConsole({
        action: "knowledge-upsert",
        ...(selected ? { id: selected.id } : {}),
        knowledgeKey: draft.knowledgeKey,
        category: draft.category,
        city: nullableText(draft.city),
        title: draft.title,
        content: draft.content,
        priority: Number(draft.priority) || 0,
        active: draft.active,
        validFrom: nullableText(draft.validFrom),
        validUntil: nullableText(draft.validUntil),
        sourceNote: nullableText(draft.sourceNote),
      });
      setMessage("Memoria operativa guardada.");
      await onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected || !canEdit || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await putConsole({ action: "knowledge-delete", id: selected.id });
      setSelectedId("new");
      setMessage("Entrada eliminada.");
      await onRefresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Base de conocimiento</p>
            <p className="mt-1 text-sm text-bone">{items.length} entradas</p>
          </div>
          {canEdit ? (
            <button
              type="button"
              onClick={() => setSelectedId("new")}
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-muted hover:text-bone"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva
            </button>
          ) : null}
        </div>
        <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selectedId === item.id
                  ? "border-champagne/45 bg-champagne/[0.06]"
                  : "border-line bg-black/10 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-bone">{item.title}</p>
                <span className="text-[10px] text-muted">P{item.priority}</span>
              </div>
              <p className="mt-1 truncate text-xs text-muted">
                {item.category}{item.city ? ` · ${item.city}` : ""}{item.active ? "" : " · inactiva"}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-champagne">
              {selected ? "Editar conocimiento" : "Nueva entrada"}
            </p>
            <p className="mt-2 text-sm text-muted">
              Esta capa funciona como memoria operativa estable del bot: políticas, sedes, servicios, reglas y contexto autorizado.
            </p>
          </div>
          {selected && canEdit ? (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-400/[0.05] disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-muted">
            Clave
            <input className={`${fieldClass()} mt-2`} value={draft.knowledgeKey} onChange={(e) => setDraft((v) => ({ ...v, knowledgeKey: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted">
            Categoría
            <input list="knowledge-categories" className={`${fieldClass()} mt-2`} value={draft.category} onChange={(e) => setDraft((v) => ({ ...v, category: e.target.value }))} readOnly={!canEdit} />
            <datalist id="knowledge-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
          </label>
          <label className="text-xs text-muted md:col-span-2">
            Título
            <input className={`${fieldClass()} mt-2`} value={draft.title} onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted md:col-span-2">
            Contenido
            <textarea className={`${textAreaClass()} mt-2 min-h-48`} value={draft.content} onChange={(e) => setDraft((v) => ({ ...v, content: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted">
            Ciudad / ámbito
            <input className={`${fieldClass()} mt-2`} value={draft.city} onChange={(e) => setDraft((v) => ({ ...v, city: e.target.value }))} readOnly={!canEdit} placeholder="Global" />
          </label>
          <label className="text-xs text-muted">
            Prioridad
            <input type="number" className={`${fieldClass()} mt-2`} value={draft.priority} onChange={(e) => setDraft((v) => ({ ...v, priority: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted">
            Válida desde
            <input type="date" className={`${fieldClass()} mt-2`} value={draft.validFrom} onChange={(e) => setDraft((v) => ({ ...v, validFrom: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted">
            Válida hasta
            <input type="date" className={`${fieldClass()} mt-2`} value={draft.validUntil} onChange={(e) => setDraft((v) => ({ ...v, validUntil: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="text-xs text-muted md:col-span-2">
            Nota de fuente
            <input className={`${fieldClass()} mt-2`} value={draft.sourceNote} onChange={(e) => setDraft((v) => ({ ...v, sourceNote: e.target.value }))} readOnly={!canEdit} />
          </label>
          <label className="flex items-center gap-3 text-sm text-muted md:col-span-2">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft((v) => ({ ...v, active: e.target.checked }))} disabled={!canEdit} />
            Entrada activa
          </label>
        </div>

        <div className="mt-5 space-y-3">
          <StatusMessage value={message} />
          <ErrorMessage value={error} />
          {canEdit ? (
            <button
              type="button"
              onClick={save}
              disabled={saving || !draft.knowledgeKey.trim() || !draft.title.trim() || !draft.content.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-[#0b0a09] transition hover:opacity-90 disabled:opacity-40"
            >
              <Save className="h-4 w-4" /> {saving ? "Guardando…" : "Guardar"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ServiceRow({ item, canEdit, onSaved }: { item: ServiceItem; canEdit: boolean; onSaved: () => Promise<void> }) {
  const [price, setPrice] = useState(item.price_mxn == null ? "" : String(item.price_mxn));
  const [cashPrice, setCashPrice] = useState(item.cash_price_mxn == null ? "" : String(item.cash_price_mxn));
  const [installments, setInstallments] = useState(item.installments ?? "");
  const [includes, setIncludes] = useState(item.includes ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [active, setActive] = useState(item.active);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await putConsole({
        action: "service-update",
        id: item.id,
        priceMxn: numberOrNull(price),
        cashPriceMxn: numberOrNull(cashPrice),
        installments: nullableText(installments),
        includes: nullableText(includes),
        notes: nullableText(notes),
        active,
      });
      setMessage("Precio actualizado.");
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-[1.35rem] border border-line bg-white/[0.025] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-bone">{item.service_name}</p>
          <p className="mt-1 text-xs text-muted">{item.city} · {item.service_key}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} disabled={!canEdit} /> Activo
        </label>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-muted">Precio MXN<input inputMode="decimal" className={`${fieldClass()} mt-2`} value={price} onChange={(e) => setPrice(e.target.value)} readOnly={!canEdit} /></label>
        <label className="text-xs text-muted">Preferencial / contado<input inputMode="decimal" className={`${fieldClass()} mt-2`} value={cashPrice} onChange={(e) => setCashPrice(e.target.value)} readOnly={!canEdit} /></label>
        <label className="text-xs text-muted md:col-span-2">Meses / condiciones<input className={`${fieldClass()} mt-2`} value={installments} onChange={(e) => setInstallments(e.target.value)} readOnly={!canEdit} /></label>
        <label className="text-xs text-muted md:col-span-2">Incluye<textarea className={`${textAreaClass()} mt-2`} value={includes} onChange={(e) => setIncludes(e.target.value)} readOnly={!canEdit} /></label>
        <label className="text-xs text-muted md:col-span-2">Notas<textarea className={`${textAreaClass()} mt-2`} value={notes} onChange={(e) => setNotes(e.target.value)} readOnly={!canEdit} /></label>
      </div>
      <div className="mt-4 space-y-3">
        <StatusMessage value={message} />
        <ErrorMessage value={error} />
        {canEdit ? <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-bone disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Guardando…" : "Guardar"}</button> : null}
      </div>
    </article>
  );
}

function PricesPanel({ items, canEdit, onRefresh }: { items: ServiceItem[]; canEdit: boolean; onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-4">
      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-champagne">Fuente de verdad comercial</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Estos importes deben ser la referencia del bot. Un precio vacío significa que la cotización requiere confirmación humana; no debe inventarse.</p>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => <ServiceRow key={item.id} item={item} canEdit={canEdit} onSaved={onRefresh} />)}
      </div>
    </div>
  );
}

function MemoryPanel({ items, canEdit, onRefresh }: { items: MemoryItem[]; canEdit: boolean; onRefresh: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.profile_name, item.phone, item.treatment, item.patient_goal]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [items, query]);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const [draft, setDraft] = useState({
    conversationSummary: "",
    patientGoal: "",
    communicationStyle: "",
    language: "",
    pendingQuestion: "",
    lastQuestionAsked: "",
    objection: "",
    appointmentDatePreference: "",
    appointmentTimePreference: "",
    knownFacts: "{}",
    missingInformation: "[]",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      conversationSummary: selected.conversation_summary ?? "",
      patientGoal: selected.patient_goal ?? "",
      communicationStyle: selected.communication_style ?? "",
      language: selected.language ?? "",
      pendingQuestion: selected.pending_question ?? "",
      lastQuestionAsked: selected.last_question_asked ?? "",
      objection: selected.objection ?? "",
      appointmentDatePreference: selected.appointment_date_preference ?? "",
      appointmentTimePreference: selected.appointment_time_preference ?? "",
      knownFacts: JSON.stringify(selected.known_facts ?? {}, null, 2),
      missingInformation: JSON.stringify(selected.missing_information ?? [], null, 2),
    });
    setMessage(null);
    setError(null);
  }, [selected]);

  async function save() {
    if (!selected || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const knownFacts = JSON.parse(draft.knownFacts) as unknown;
      const missingInformation = JSON.parse(draft.missingInformation) as unknown;
      if (!knownFacts || typeof knownFacts !== "object" || Array.isArray(knownFacts)) {
        throw new Error("known_facts debe ser un objeto JSON.");
      }
      if (!Array.isArray(missingInformation)) {
        throw new Error("missing_information debe ser un arreglo JSON.");
      }
      await putConsole({
        action: "memory-update",
        id: selected.id,
        conversationSummary: nullableText(draft.conversationSummary),
        patientGoal: nullableText(draft.patientGoal),
        communicationStyle: nullableText(draft.communicationStyle),
        language: nullableText(draft.language),
        pendingQuestion: nullableText(draft.pendingQuestion),
        lastQuestionAsked: nullableText(draft.lastQuestionAsked),
        objection: nullableText(draft.objection),
        appointmentDatePreference: nullableText(draft.appointmentDatePreference),
        appointmentTimePreference: nullableText(draft.appointmentTimePreference),
        knownFacts,
        missingInformation,
      });
      setMessage("Memoria de conversación actualizada.");
      await onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Memoria reciente</p>
        <input className={`${fieldClass()} mt-4`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nombre, teléfono o tratamiento" />
        <div className="mt-4 max-h-[720px] space-y-2 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === item.id ? "border-champagne/45 bg-champagne/[0.06]" : "border-line bg-black/10 hover:bg-white/[0.03]"}`}>
              <p className="truncate text-sm font-medium text-bone">{item.profile_name || item.phone}</p>
              <p className="mt-1 truncate text-xs text-muted">{item.phone}{item.treatment ? ` · ${item.treatment}` : ""}</p>
              {item.patient_goal ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{item.patient_goal}</p> : null}
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-champagne">{selected.profile_name || "Paciente"}</p>
            <p className="mt-2 text-sm text-muted">{selected.phone}{selected.city ? ` · ${selected.city}` : ""}{selected.stage ? ` · ${selected.stage}` : ""}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs text-muted md:col-span-2">Resumen de conversación<textarea className={`${textAreaClass()} mt-2 min-h-36`} value={draft.conversationSummary} onChange={(e) => setDraft((v) => ({ ...v, conversationSummary: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted md:col-span-2">Objetivo del paciente<textarea className={`${textAreaClass()} mt-2`} value={draft.patientGoal} onChange={(e) => setDraft((v) => ({ ...v, patientGoal: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted">Estilo de comunicación<input className={`${fieldClass()} mt-2`} value={draft.communicationStyle} onChange={(e) => setDraft((v) => ({ ...v, communicationStyle: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted">Idioma<input className={`${fieldClass()} mt-2`} value={draft.language} onChange={(e) => setDraft((v) => ({ ...v, language: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted">Preferencia de día<input className={`${fieldClass()} mt-2`} value={draft.appointmentDatePreference} onChange={(e) => setDraft((v) => ({ ...v, appointmentDatePreference: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted">Preferencia de horario<input className={`${fieldClass()} mt-2`} value={draft.appointmentTimePreference} onChange={(e) => setDraft((v) => ({ ...v, appointmentTimePreference: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted md:col-span-2">Pregunta pendiente<textarea className={`${textAreaClass()} mt-2`} value={draft.pendingQuestion} onChange={(e) => setDraft((v) => ({ ...v, pendingQuestion: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted md:col-span-2">Última pregunta realizada<textarea className={`${textAreaClass()} mt-2`} value={draft.lastQuestionAsked} onChange={(e) => setDraft((v) => ({ ...v, lastQuestionAsked: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted md:col-span-2">Objeción<textarea className={`${textAreaClass()} mt-2`} value={draft.objection} onChange={(e) => setDraft((v) => ({ ...v, objection: e.target.value }))} readOnly={!canEdit} /></label>
            <label className="text-xs text-muted md:col-span-2">Hechos conocidos · JSON<textarea className={`${textAreaClass()} mt-2 min-h-56 font-mono text-xs`} value={draft.knownFacts} onChange={(e) => setDraft((v) => ({ ...v, knownFacts: e.target.value }))} readOnly={!canEdit} spellCheck={false} /></label>
            <label className="text-xs text-muted md:col-span-2">Información faltante · JSON<textarea className={`${textAreaClass()} mt-2 min-h-36 font-mono text-xs`} value={draft.missingInformation} onChange={(e) => setDraft((v) => ({ ...v, missingInformation: e.target.value }))} readOnly={!canEdit} spellCheck={false} /></label>
          </div>
          <div className="mt-5 space-y-3">
            <StatusMessage value={message} />
            <ErrorMessage value={error} />
            {canEdit ? <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-[#0b0a09] hover:opacity-90 disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Guardando…" : "Guardar memoria"}</button> : null}
          </div>
        </section>
      ) : (
        <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-6 text-sm text-muted">No hay conversaciones disponibles.</section>
      )}
    </div>
  );
}

function BotPanel({ data, canEdit, onRefresh }: { data: ConsolePayload; canEdit: boolean; onRefresh: () => Promise<void> }) {
  const [mode, setMode] = useState(data.settings.global_mode);
  const [emergencyStop, setEmergencyStop] = useState(data.settings.emergency_stop);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(data.settings.global_mode);
    setEmergencyStop(data.settings.emergency_stop);
  }, [data.settings.global_mode, data.settings.emergency_stop]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await putConsole({ action: "settings", globalMode: mode, emergencyStop });
      setMessage("Estado del bot actualizado.");
      await onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-champagne">Motor</p>
        <p className="mt-3 text-lg font-medium text-bone">{data.routerModel}</p>
        <p className="mt-2 text-sm leading-6 text-muted">Modelo configurado para clasificación y respuesta del orquestador interno.</p>
        <label className="mt-6 block text-xs text-muted">Modo global<select className={`${fieldClass()} mt-2`} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} disabled={!canEdit}><option value="off">Off</option><option value="manual">Manual</option><option value="supervised">Supervisado</option><option value="automatic">Automático</option></select></label>
        <label className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-black/15 p-4 text-sm text-muted"><input type="checkbox" checked={emergencyStop} onChange={(e) => setEmergencyStop(e.target.checked)} disabled={!canEdit} /><span><strong className="block font-medium text-bone">Paro de emergencia</strong>Desactiva la respuesta autónoma sin borrar configuración.</span></label>
        <div className="mt-5 space-y-3"><StatusMessage value={message} /><ErrorMessage value={error} />{canEdit ? <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-[#0b0a09] hover:opacity-90 disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Guardando…" : "Guardar estado"}</button> : null}</div>
      </section>

      <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-champagne">Capa protegida</p>
        <p className="mt-3 text-sm leading-6 text-muted">Estas reglas clínicas tienen prioridad sobre el prompt editable y no se modifican desde la consola.</p>
        <pre className="mt-5 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-black/20 p-4 font-mono text-xs leading-5 text-muted">{data.safetyInstructions}</pre>
      </section>
    </div>
  );
}

export function WhatsAppCommandConsole() {
  const [tab, setTab] = useState<ConsoleTab>("prompt");
  const [data, setData] = useState<ConsolePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/admin/whatsapp-console", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo cargar la consola de WhatsApp.");
      const payload = (await response.json()) as ConsolePayload;
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la consola.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <div className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6 text-sm text-muted">Cargando consola de WhatsApp IA…</div>;
  }

  if (!data) {
    return (
      <div className="rounded-[1.75rem] border border-red-400/20 bg-red-400/[0.04] p-6 text-sm text-red-200">
        <p>{error ?? "No fue posible cargar la consola."}</p>
        <button type="button" onClick={() => { setLoading(true); void load(); }} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300/20 px-4 py-2"><RefreshCw className="h-4 w-4" /> Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button key={item.key} type="button" onClick={() => setTab(item.key)} className={`rounded-[1.25rem] border p-4 text-left transition ${active ? "border-champagne/45 bg-champagne/[0.06]" : "border-line bg-white/[0.025] hover:bg-white/[0.04]"}`}>
              <Icon className={`h-4 w-4 ${active ? "text-champagne" : "text-muted"}`} />
              <p className="mt-3 text-sm font-medium text-bone">{item.label}</p>
              <p className="mt-1 text-xs text-muted">{item.description}</p>
            </button>
          );
        })}
      </section>

      {tab === "prompt" ? (
        <div className="space-y-5">
          <WhatsAppPromptEditor />
          <section className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-champagne">Qué no vive dentro del prompt</p>
            <p className="mt-2 text-sm leading-6 text-muted">La memoria por conversación, la base de conocimiento, los precios y el modo del bot se administran en sus propias capas. Así un cambio de precio no obliga a reescribir el prompt completo.</p>
          </section>
        </div>
      ) : null}
      {tab === "memory" ? <MemoryPanel items={data.memories} canEdit={data.canEdit} onRefresh={load} /> : null}
      {tab === "knowledge" ? <KnowledgePanel items={data.knowledge} canEdit={data.canEdit} onRefresh={load} /> : null}
      {tab === "prices" ? <PricesPanel items={data.services} canEdit={data.canEdit} onRefresh={load} /> : null}
      {tab === "bot" ? <BotPanel data={data} canEdit={data.canEdit} onRefresh={load} /> : null}
    </div>
  );
}
