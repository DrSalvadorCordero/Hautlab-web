"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, Clock3, MapPin, RefreshCw, Target, WalletCards } from "lucide-react";
import type { RevenueLedgerRow, StaffSnapshot } from "@/lib/staff-performance-db";

type Payload = {
  month: string;
  karen: StaffSnapshot;
  doctor: StaffSnapshot;
  ledger: RevenueLedgerRow[];
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Merida",
    year: "numeric",
    month: "2-digit"
  }).format(new Date());
}

export function StaffPerformanceDashboard() {
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/staff-performance?month=${encodeURIComponent(month)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No fue posible cargar el desempeño del personal.");
      setData((await response.json()) as Payload);
    } catch (value) {
      setError(value instanceof Error ? value.message : "No fue posible cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => {
    const result = new Map<string, number>();
    for (const row of data?.ledger ?? []) {
      result.set(row.revenue_owner, (result.get(row.revenue_owner) ?? 0) + Number(row.gross_revenue));
    }
    return result;
  }, [data]);

  if (loading && !data) return <div className="rounded-[2rem] border border-line bg-white/[0.03] p-8 text-muted">Cargando métricas…</div>;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Periodo</p>
          <h2 className="mt-2 font-serif text-2xl">Compensación y productividad</h2>
        </div>
        <div className="flex items-end gap-3">
          <label className="text-xs text-muted">Mes<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 block rounded-xl border border-line bg-black/20 px-3 py-2 text-bone" /></label>
          <button onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"><RefreshCw className="h-4 w-4" />Actualizar</button>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.06] p-4 text-sm text-red-100">{error}</div> : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric icon={WalletCards} label="Karen · generado" value={money.format(totals.get("karen") ?? 0)} />
            <Metric icon={WalletCards} label="Salvador · generado" value={money.format(totals.get("doctor") ?? 0)} />
            <Metric icon={Target} label="Karen · score" value={`${data.karen.score.toFixed(1)} / 100`} />
            <Metric icon={Banknote} label="Karen · pago estimado" value={money.format(data.karen.totalPay)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-champagne">Karen</p>
              <h3 className="mt-3 font-serif text-2xl">Desglose mensual</h3>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Line label="Sueldo fijo" value={money.format(data.karen.baseSalary)} />
                <Line label="Comisión" value={money.format(data.karen.commission)} />
                <Line label="Bono KPI" value={money.format(data.karen.bonus)} />
                <Line label="Total estimado" value={money.format(data.karen.totalPay)} strong />
                <Line label="Asistencia" value={`${data.karen.attendance.attendancePct.toFixed(1)}%`} />
                <Line label="Retardos" value={`${data.karen.attendance.lateCount} · ${Math.round(data.karen.attendance.lateMinutes)} min`} />
                <Line label="Fuera de geocerca" value={`${Math.round(data.karen.attendance.outsideMinutes)} min`} />
                <Line label="Salidas de geocerca" value={String(data.karen.attendance.geofenceExitEvents)} />
                <Line label="Leads atendidos" value={`${data.karen.leads.responded}/${data.karen.leads.assigned}`} />
                <Line label="Citas confirmadas" value={String(data.karen.leads.appointmentConfirmed)} />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-champagne">Atribución</p>
              <h3 className="mt-3 font-serif text-2xl">Ingresos por responsable</h3>
              <div className="mt-6 space-y-3">
                {["karen", "doctor", "organic", "referral", "unassigned"].map((owner) => (
                  <div key={owner} className="flex items-center justify-between rounded-2xl border border-line/70 bg-black/15 px-4 py-3">
                    <span className="text-sm text-muted">{ownerLabel(owner)}</span>
                    <strong className="font-medium text-bone">{money.format(totals.get(owner) ?? 0)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Metric icon={Clock3} label="Horas trabajadas" value={`${Math.round(data.karen.attendance.workedMinutes / 60)} h`} />
            <Metric icon={MapPin} label="Tiempo fuera" value={`${Math.round(data.karen.attendance.outsideMinutes)} min`} />
            <Metric icon={Target} label="Conversión a cita" value={conversion(data.karen)} />
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5"><Icon className="h-4 w-4 text-champagne" /><p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-2 text-2xl font-medium text-bone">{value}</p></div>;
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="rounded-2xl border border-line/70 bg-black/15 p-4"><dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt><dd className={`mt-2 ${strong ? "text-xl font-semibold text-champagne" : "text-lg text-bone"}`}>{value}</dd></div>;
}

function ownerLabel(owner: string) {
  return ({ karen: "Karen", doctor: "Dr. Salvador", organic: "Orgánico HAUTLAB", referral: "Referido", unassigned: "Sin atribuir" } as Record<string, string>)[owner] ?? owner;
}

function conversion(snapshot: StaffSnapshot) {
  if (!snapshot.leads.assigned) return "—";
  return `${((snapshot.leads.appointmentConfirmed / snapshot.leads.assigned) * 100).toFixed(1)}%`;
}
