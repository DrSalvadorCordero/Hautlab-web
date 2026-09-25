"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  CalendarCheck2,
  CalendarClock,
  Link2,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Target,
  TrendingUp,
  WalletCards
} from "lucide-react";
import type { GrowthOsSnapshot } from "@/lib/growth-os-types";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

function rate(part: number, total: number) {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function GrowthDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<GrowthOsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/growth?days=${days}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No fue posible cargar Growth OS.");
      setData((await response.json()) as GrowthOsSnapshot);
    } catch (value) {
      setError(value instanceof Error ? value.message : "No fue posible cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return <div className="rounded-[2rem] border border-line bg-white/[0.03] p-8 text-muted">Cargando Growth OS…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Ventana de análisis</p>
          <h2 className="mt-2 font-serif text-2xl">Marketing → conversación → cita → revenue</h2>
        </div>
        <div className="flex items-end gap-3">
          <label className="text-xs text-muted">
            Periodo
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="mt-1 block rounded-xl border border-line bg-black/20 px-3 py-2 text-bone"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
            </select>
          </label>
          <button
            onClick={() => void load()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.06] p-4 text-sm text-red-100">{error}</div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric icon={MessageCircle} label="Leads" value={String(data.leads)} detail="Conversaciones nuevas" />
            <Metric icon={Activity} label="Respondidos" value={String(data.responded)} detail={rate(data.responded, data.leads)} />
            <Metric icon={CalendarClock} label="Solicitan cita" value={String(data.appointmentRequested)} detail={rate(data.appointmentRequested, data.leads)} />
            <Metric icon={CalendarCheck2} label="Cita confirmada" value={String(data.appointmentConfirmed)} detail={rate(data.appointmentConfirmed, data.leads)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-champagne">Atribución</p>
              <h3 className="mt-3 font-serif text-2xl">Salud del enlace campaña → WhatsApp</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Metric icon={Link2} label="Touchpoints capturados" value={String(data.touchpoints)} detail="Web / campañas" />
                <Metric icon={Target} label="Touchpoints enlazados" value={String(data.matchedTouchpoints)} detail={rate(data.matchedTouchpoints, data.touchpoints)} />
                <Metric icon={Megaphone} label="Leads atribuidos" value={String(data.attributedLeads)} detail={rate(data.attributedLeads, data.leads)} />
                <Metric icon={TrendingUp} label="Conversiones registradas" value={String(data.conversionEvents)} detail={`${data.pendingExports} pendientes de exportar`} />
              </div>
              {data.touchpoints > data.matchedTouchpoints ? (
                <p className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm leading-6 text-muted">
                  Hay touchpoints que todavía no se enlazaron a una conversación. Growth OS los mantiene visibles para detectar pérdida de atribución.
                </p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-champagne">Revenue</p>
              <h3 className="mt-3 font-serif text-2xl">Ingresos registrados</h3>
              <div className="mt-6 space-y-3">
                <Line label="Revenue registrado" value={money.format(data.recordedRevenueMxn)} />
                <Line label="Vinculado a conversación" value={money.format(data.conversationAttributedRevenueMxn)} />
                <Line label="Atribuido a marketing" value={money.format(data.marketingAttributedRevenueMxn)} />
                <Line label="Gasto publicitario" value={data.adSpendConnected && data.adSpendMxn !== null ? money.format(data.adSpendMxn) : "No conectado"} />
                <Line label="ROAS" value={data.roas === null ? "—" : `${data.roas.toFixed(2)}×`} />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Metric icon={BadgeDollarSign} label="Google click conversions" value={String(data.googleClickConversions)} detail="Con gclid" />
            <Metric icon={WalletCards} label="Meta click conversions" value={String(data.metaClickConversions)} detail="Con fbclid" />
            <Metric icon={Target} label="Conversaciones pausadas" value={String(data.pausedLeads)} detail="Dentro del periodo" />
          </section>

          <section className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">Campañas</p>
            <h3 className="mt-3 font-serif text-2xl">Leads con campaña identificada</h3>
            {data.campaigns.length ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.14em] text-muted">
                  <span>Campaña</span><span>Leads</span><span>Citas</span>
                </div>
                {data.campaigns.map((row) => (
                  <div key={row.campaign} className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line/60 px-4 py-3 text-sm last:border-0">
                    <span className="truncate text-bone">{row.campaign}</span>
                    <span className="text-muted">{row.leads}</span>
                    <span className="text-muted">{row.confirmed}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">Todavía no hay conversaciones con campaña enlazada en este periodo.</p>
            )}
          </section>

          {!data.adSpendConnected ? (
            <section className="rounded-[2rem] border border-line bg-white/[0.025] p-6 text-sm leading-6 text-muted">
              <strong className="font-medium text-bone">Gasto y ROAS aún no se muestran.</strong>{" "}
              El panel no estima inversión publicitaria: esos campos se habilitan cuando exista una fuente de Ads conectada y verificable.
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
      <Icon className="h-4 w-4 text-champagne" />
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium text-bone">{value}</p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line/70 bg-black/15 px-4 py-3">
      <span className="text-sm text-muted">{label}</span>
      <strong className="font-medium text-bone">{value}</strong>
    </div>
  );
}
