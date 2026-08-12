"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";

type PromptPayload = {
  prompt: string;
  defaultPrompt: string;
  source: "saved" | "default";
  updatedAt: string | null;
  updatedBy: string | null;
  canEdit: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "Sin cambios guardados";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function WhatsAppPromptEditor() {
  const [data, setData] = useState<PromptPayload | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/admin/whatsapp-prompt", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("No se pudo cargar el prompt.");
        const payload = (await response.json()) as PromptPayload;
        if (!active) return;
        setData(payload);
        setPrompt(payload.prompt);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el prompt.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const changed = useMemo(
    () => Boolean(data && prompt.trim() !== data.prompt.trim()),
    [data, prompt],
  );

  async function save() {
    if (!data?.canEdit || saving || prompt.trim().length < 500) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/whatsapp-prompt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        updatedAt?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          payload.error === "invalid_prompt"
            ? "El prompt debe tener entre 500 y 24,000 caracteres."
            : "No se pudieron guardar los cambios.",
        );
      }
      setData((current) =>
        current
          ? {
              ...current,
              prompt: prompt.trim(),
              source: "saved",
              updatedAt: payload.updatedAt ?? new Date().toISOString(),
            }
          : current,
      );
      setPrompt((current) => current.trim());
      setMessage("Cambios guardados. Se aplicarán a las nuevas respuestas de WhatsApp.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron guardar los cambios.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6 text-sm text-muted">
        Cargando prompt operativo…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[1.75rem] border border-red-400/20 bg-red-400/[0.04] p-6 text-sm text-red-200">
        {error ?? "No fue posible cargar la configuración de WhatsApp IA."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">
              Prompt activo
            </p>
            <p className="mt-2 text-sm text-muted">
              Fuente: {data.source === "saved" ? "versión guardada" : "base del sistema"}
            </p>
            <p className="mt-1 text-xs text-muted">
              Última actualización: {formatDate(data.updatedAt)}
              {data.updatedBy ? ` · ${data.updatedBy}` : ""}
            </p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
            {prompt.length.toLocaleString("es-MX")} caracteres
          </span>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            setMessage(null);
            setError(null);
          }}
          readOnly={!data.canEdit}
          spellCheck
          className="mt-5 min-h-[620px] w-full resize-y rounded-2xl border border-line bg-black/25 p-5 font-mono text-[13px] leading-6 text-bone outline-none transition focus:border-champagne/60 disabled:opacity-60"
          aria-label="Prompt operativo de WhatsApp IA"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-xs leading-5 text-muted">
            La capa clínica de seguridad y escalación no está incluida en este campo y no puede modificarse desde el panel.
          </p>
          {data.canEdit ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPrompt(data.defaultPrompt);
                  setMessage("Se cargó la versión base. Revisa y pulsa Guardar para aplicarla.");
                  setError(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-muted transition hover:border-bone/30 hover:text-bone"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer base
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!changed || saving || prompt.trim().length < 500}
                className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-[#0b0a09] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          ) : null}
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-100">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
