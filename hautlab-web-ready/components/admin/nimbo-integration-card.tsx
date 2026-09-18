"use client";

import { CalendarCheck2, CheckCircle2, RefreshCw, ShieldCheck, Unplug, XCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type PublicNimboConfig = {
  enabled: boolean;
  connected: boolean;
  readyForAutobooking: boolean;
  baseUrl: string | null;
  doctorAccountId: number | null;
  doctorName: string | null;
  organizationId: number | null;
  organizationSlug: string | null;
  locationId: number | null;
  timezone: string;
  consultationDurationMinutes: number | null;
  portalUrl: string | null;
  lastConnectedAt: string | null;
  lastVerifiedAt: string | null;
  lastError: string | null;
  updatedAt: string;
};

type StatusPayload = {
  config?: PublicNimboConfig;
  error?: string;
};

async function nimboAction(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/nimbo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => ({}))) as StatusPayload & {
    ok?: boolean;
  };
  if (!response.ok) throw new Error(body.error ?? "No se pudo completar la operación.");
  return body;
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NimboIntegrationCard() {
  const [config, setConfig] = useState<PublicNimboConfig | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/nimbo", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as StatusPayload;
      if (!response.ok || !body.config) {
        throw new Error(body.error ?? "No se pudo leer la integración.");
      }
      setConfig(body.config);
      setBaseUrl(body.config.baseUrl ?? "");
      setPortalUrl(body.config.portalUrl ?? "");
      setDuration(
        body.config.consultationDurationMinutes
          ? String(body.config.consultationDurationMinutes)
          : "",
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo leer la integración.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const status = useMemo(() => {
    if (!config?.connected) return { label: "Sin conectar", kind: "neutral" as const };
    if (!config.enabled) return { label: "Conectado · pausado", kind: "paused" as const };
    if (!config.readyForAutobooking) {
      return { label: "Conectado · falta duración", kind: "paused" as const };
    }
    return { label: "Nimbo activo", kind: "ready" as const };
  }, [config]);

  async function connect(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await nimboAction({
        action: "connect",
        baseUrl,
        username,
        password,
      });
      if (body.config) {
        setConfig(body.config);
        setPortalUrl(body.config.portalUrl ?? "");
        setDuration(
          body.config.consultationDurationMinutes
            ? String(body.config.consultationDurationMinutes)
            : "",
        );
      }
      setPassword("");
      setMessage("Nimbo quedó autenticado y la cuenta médica fue detectada.");
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "No se pudo conectar Nimbo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await nimboAction({ action: "verify" });
      if (body.config) setConfig(body.config);
      setMessage("Conexión verificada.");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "No se pudo verificar Nimbo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings() {
    if (busy || !config) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const parsedDuration = duration.trim() ? Number(duration) : null;
      const body = await nimboAction({
        action: "update",
        enabled: config.enabled,
        portalUrl: portalUrl.trim() || null,
        consultationDurationMinutes: parsedDuration,
      });
      if (body.config) setConfig(body.config);
      setMessage("Configuración guardada.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleEnabled() {
    if (busy || !config) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await nimboAction({
        action: "update",
        enabled: !config.enabled,
      });
      if (body.config) setConfig(body.config);
      setMessage(body.config?.enabled ? "Automatización de agenda activada." : "Automatización pausada.");
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar el estado.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (busy || !config?.connected) return;
    const confirmed = window.confirm(
      "Esto eliminará el token de Nimbo guardado en Vault y desactivará la agenda automática. ¿Continuar?",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await nimboAction({ action: "disconnect" });
      if (body.config) setConfig(body.config);
      setBaseUrl("");
      setPortalUrl("");
      setDuration("");
      setMessage("Nimbo quedó desconectado.");
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : "No se pudo desconectar.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6 text-sm text-muted">
        Cargando integración con Nimbo…
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">
            Agenda clínica
          </p>
          <h2 className="mt-2 font-serif text-2xl text-bone sm:text-3xl">
            Nimbo
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Permite que HAUTLAB consulte disponibilidad real y, cuando exista una
            selección explícita del paciente, registre la cita directamente en Nimbo.
            Si tu cuenta entra con Google, no uses tu contraseña de Google. La API pública de Nimbo documenta autenticación con credencial propia de Nimbo/API; HAUTLAB no almacena esa contraseña.
          </p>
        </div>

        <span
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
            status.kind === "ready"
              ? "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-100"
              : status.kind === "paused"
                ? "border-amber-300/25 bg-amber-300/[0.06] text-amber-100"
                : "border-line text-muted",
          ].join(" ")}
        >
          {status.kind === "ready" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : status.kind === "paused" ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {status.label}
        </span>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}

      {!config?.connected ? (
        <form onSubmit={connect} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              Base URL de API habilitada por Nimbo
            </span>
            <input
              required
              type="url"
              autoComplete="url"
              placeholder="https://…/api/v1"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              className="w-full rounded-xl border border-line bg-black/10 px-4 py-3 text-sm text-bone outline-none focus:border-champagne/50"
            />
            <span className="block text-xs leading-5 text-muted">
              Usa el endpoint de API de tu cuenta, no la dirección del panel web. Si accedes a Nimbo con Google SSO, espera la credencial/API indicada por Nimbo; no pegues aquí tu contraseña de Google.
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              Usuario de Nimbo
            </span>
            <input
              required
              type="email"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-line bg-black/10 px-4 py-3 text-sm text-bone outline-none focus:border-champagne/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              Contraseña nativa de Nimbo / API
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-line bg-black/10 px-4 py-3 text-sm text-bone outline-none focus:border-champagne/50"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/[0.08] px-5 py-2.5 text-sm text-bone transition hover:bg-champagne/[0.12] disabled:opacity-40"
            >
              <CalendarCheck2 className="h-4 w-4" />
              {busy ? "Conectando…" : "Conectar Nimbo"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-line bg-black/10 p-4">
              <p className="text-xs text-muted">Cuenta detectada</p>
              <p className="mt-2 text-sm text-bone">
                {config.doctorName ?? (config.doctorAccountId ? "ID " + config.doctorAccountId : "—")}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-black/10 p-4">
              <p className="text-xs text-muted">Zona horaria</p>
              <p className="mt-2 text-sm text-bone">{config.timezone}</p>
            </div>
            <div className="rounded-2xl border border-line bg-black/10 p-4">
              <p className="text-xs text-muted">Última verificación</p>
              <p className="mt-2 text-sm text-bone">
                {formatTimestamp(config.lastVerifiedAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-black/10 p-4">
              <p className="text-xs text-muted">Autobooking</p>
              <p className="mt-2 text-sm text-bone">
                {config.readyForAutobooking ? "Listo" : "Configuración incompleta"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                Duración de consulta (min)
              </span>
              <input
                type="number"
                min={10}
                max={240}
                step={5}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-line bg-black/10 px-4 py-3 text-sm text-bone outline-none focus:border-champagne/50"
              />
              <span className="block text-xs leading-5 text-muted">
                Si Nimbo la expone en la cuenta se detecta automáticamente. Revísala antes
                de activar reservas automáticas.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                Portal de citas de Nimbo
              </span>
              <input
                type="url"
                placeholder="https://…"
                value={portalUrl}
                onChange={(event) => setPortalUrl(event.target.value)}
                className="w-full rounded-xl border border-line bg-black/10 px-4 py-3 text-sm text-bone outline-none focus:border-champagne/50"
              />
              <span className="block text-xs leading-5 text-muted">
                Se usa como salida segura para pacientes nuevos que aún no existen en Nimbo.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveSettings()}
              className="rounded-full border border-line px-4 py-2 text-xs text-bone transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              Guardar configuración
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void verify()}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-muted transition hover:text-bone disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Verificar conexión
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggleEnabled()}
              className="rounded-full border border-line px-4 py-2 text-xs text-muted transition hover:text-bone disabled:opacity-40"
            >
              {config.enabled ? "Pausar agenda automática" : "Activar agenda automática"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void disconnect()}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-xs text-red-200 transition hover:bg-red-400/[0.04] disabled:opacity-40"
            >
              <Unplug className="h-3.5 w-3.5" />
              Desconectar
            </button>
          </div>

          <p className="text-xs leading-5 text-muted">
            El token renovable se guarda cifrado en Supabase Vault. HAUTLAB no expone
            credenciales de Nimbo al navegador ni al modelo de IA.
          </p>
        </div>
      )}
    </section>
  );
}
