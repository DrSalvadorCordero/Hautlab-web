"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  HeartPulse,
  MessageSquare,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

type Overview = {
  generatedAt: string;
  sources: Record<"operations" | "growth" | "nimbo" | "whatsapp", "ok" | "unavailable">;
  operations: {
    conversations: number;
    followupSignals: number;
    clinicalRisk: number;
    unresolvedIncidents: number;
  } | null;
  growth: {
    leads: number;
    appointmentRequested: number;
    appointmentConfirmed: number;
    recordedRevenueMxn: number;
    adSpendConnected: boolean;
    generatedAt: string;
  } | null;
  nimbo: {
    enabled: boolean;
    connected: boolean;
    readyForAutobooking: boolean;
    lastVerifiedAt: string | null;
    hasError: boolean;
  } | null;
  whatsapp: {
    mode: string;
    emergencyStop: boolean;
    updatedAt: string | null;
  } | null;
};

const number = new Intl.NumberFormat("es-MX");
const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function timestamp(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Sin verificación registrada";
  return new Date(value).toLocaleString("es-MX", {
    timeZone: "America/Merida",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OperationsOverview() {
  const [snapshot, setSnapshot] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/admin/overview", {
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("overview_unavailable");
      const payload = (await response.json()) as Overview;
      if (!signal?.aborted) setSnapshot(payload);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  const metrics = [
    {
      label: "Seguimientos por revisar",
      value: snapshot?.operations ? number.format(snapshot.operations.followupSignals) : "—",
      context: "Señales operativas; no equivale a casos clínicos",
      href: "/admin/whatsapp",
      icon: MessageSquare,
    },
    {
      label: "Alertas de riesgo clínico",
      value: snapshot?.operations ? number.format(snapshot.operations.clinicalRisk) : "—",
      context: "Conversaciones abiertas marcadas para revisión",
      href: "/admin/whatsapp",
      icon: HeartPulse,
    },
    {
      label: "Citas confirmadas · 30 días",
      value: snapshot?.growth ? number.format(snapshot.growth.appointmentConfirmed) : "—",
      context: "Según eventos de atribución registrados",
      href: "/admin/growth",
      icon: CalendarDays,
    },
    {
      label: "Ingresos registrados · 30 días",
      value: snapshot?.growth ? money.format(snapshot.growth.recordedRevenueMxn) : "—",
      context: "No representa conciliación bancaria",
      href: "/admin/growth",
      icon: CircleDollarSign,
    },
    {
      label: "Leads · 30 días",
      value: snapshot?.growth ? number.format(snapshot.growth.leads) : "—",
      context: "Embudo Growth OS",
      href: "/admin/growth",
      icon: TrendingUp,
    },
    {
      label: "Incidentes abiertos",
      value: snapshot?.operations ? number.format(snapshot.operations.unresolvedIncidents) : "—",
      context: "Alertas técnicas pendientes de resolución",
      href: "/admin/whatsapp",
      icon: AlertTriangle,
    },
  ];

  const hasPartialFailure = snapshot
    ? Object.values(snapshot.sources).some((source) => source !== "ok")
    : false;
  const nimboStale = snapshot?.nimbo?.lastVerifiedAt
    ? Date.now() - Date.parse(snapshot.nimbo.lastVerifiedAt) > 14 * 24 * 60 * 60 * 1000
    : true;

  return (
    <section className="space-y-5" aria-label="Resumen operativo de HAUTLAB OS">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-bone">Pulso operativo</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Lectura agregada. Sin expedientes ni mensajes en esta vista.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-bone transition hover:border-champagne/60 disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Consultando" : "Actualizar"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.04] p-4 text-sm text-bone">
          No se pudo consultar el resumen. La operación de los otros módulos no se modifica.
        </p>
      )}
      {hasPartialFailure && (
        <p role="status" className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.04] p-4 text-sm text-bone">
          Una o más fuentes no respondieron. Los valores ausentes se muestran como —, nunca como cero.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={false}
              className="group rounded-[1.5rem] border border-line bg-white/[0.025] p-5 transition hover:border-champagne/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3 text-muted">
                <Icon className="h-5 w-5 text-champagne" aria-hidden="true" />
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-3xl font-medium tabular-nums text-bone">
                {loading && !snapshot ? "…" : item.value}
              </p>
              <p className="mt-2 text-sm font-medium text-bone">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{item.context}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Link href="/admin/experiencia" prefetch={false} className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 transition hover:border-champagne/40">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Nimbo · Agenda clínica</p>
          <p className="mt-3 font-medium text-bone">
            {!snapshot?.nimbo ? "Estado no disponible" : !snapshot.nimbo.connected ? "Sin conexión registrada" : snapshot.nimbo.hasError ? "Requiere revisión" : nimboStale ? "Conectado · verificación antigua" : "Conexión registrada"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {snapshot?.nimbo
              ? `Última verificación: ${timestamp(snapshot.nimbo.lastVerifiedAt)} · Reserva automática: ${snapshot.nimbo.readyForAutobooking ? "preparada" : "no preparada"}`
              : "No se ha comprobado la disponibilidad de Nimbo."}
          </p>
        </Link>
        <Link href="/admin/whatsapp" prefetch={false} className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5 transition hover:border-champagne/40">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">WhatsApp · Configuración</p>
          <p className="mt-3 font-medium text-bone">
            {!snapshot?.whatsapp ? "Estado no disponible" : snapshot.whatsapp.emergencyStop ? "Parada de emergencia activa" : `Modo ${snapshot.whatsapp.mode}`}
          </p>
          <p className="mt-2 text-sm text-muted">
            {snapshot?.whatsapp
              ? `Configuración actualizada: ${timestamp(snapshot.whatsapp.updatedAt)}. No confirma entrega de mensajes en tiempo real.`
              : "No se ha comprobado el estado de configuración."}
          </p>
        </Link>
      </div>
      <p className="text-xs text-muted" aria-live="polite">
        {snapshot
          ? `Actualizado: ${timestamp(snapshot.generatedAt)} · Operación ${snapshot.sources.operations === "ok" ? "disponible" : "sin datos"} · Growth ${snapshot.sources.growth === "ok" ? "disponible" : "sin datos"}`
          : "Consultando fuentes autorizadas…"}
      </p>
    </section>
  );
}
