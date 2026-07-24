"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Download, LogIn, LogOut, Pencil, RefreshCw, Save } from "lucide-react";
import type { AttendanceAuditRow, AttendanceProfileRow, AttendanceScheduleRow } from "@/lib/attendance-db";
import type { AttendanceRecord, AttendanceReport } from "@/lib/attendance-report";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type AttendancePayload = {
  canManage: boolean;
  currentUser: { userId: string; email: string; displayName: string; role: "manager" | "employee" };
  profiles: AttendanceProfileRow[];
  schedules: AttendanceScheduleRow[];
  report: AttendanceReport;
  audits: AttendanceAuditRow[];
  timeZone: string;
};

type ScheduleDraft = {
  weekday: number;
  active: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  graceMinutes: number;
};

function hoursLabel(minutes: number | null) {
  if (minutes === null) return "—";
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}

function statusLabel(record: AttendanceRecord) {
  if (record.isReversed) return "Revertido";
  if (record.isIncomplete) return "Jornada abierta";
  if (record.isLate) return `Retardo · ${record.lateMinutes} min`;
  return "Completo";
}

function meridaLocalInput(iso: string | null) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Merida",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function meridaInputToIso(value: string) {
  return value ? new Date(`${value}:00-06:00`).toISOString() : null;
}

function defaultSchedule(rows: AttendanceScheduleRow[], userId: string): ScheduleDraft[] {
  return weekdays.map((_, weekday) => {
    const existing = rows.find((row) => row.user_id === userId && row.weekday === weekday);
    return {
      weekday,
      active: existing?.active ?? false,
      scheduledStart: existing?.scheduled_start?.slice(0, 5) ?? null,
      scheduledEnd: existing?.scheduled_end?.slice(0, 5) ?? null,
      graceMinutes: existing?.grace_minutes ?? 0
    };
  });
}

export function AttendanceDashboard() {
  const [data, setData] = useState<AttendancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [from, setFrom] = useState(() => { const date = new Date(); date.setDate(1); return date.toISOString().slice(0, 10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionIn, setCorrectionIn] = useState("");
  const [correctionOut, setCorrectionOut] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [reverseRecord, setReverseRecord] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft[]>([]);
  const [scheduleReason, setScheduleReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/attendance?from=${encodeURIComponent(`${from}T00:00:00-06:00`)}&to=${encodeURIComponent(`${to}T23:59:59-06:00`)}`, { cache: "no-store" });
      const payload = (await response.json()) as AttendancePayload & { setupRequired?: boolean; error?: string };
      if (!response.ok) {
        if (payload.setupRequired) { setSetupRequired(true); setData(null); return; }
        throw new Error(payload.error ?? "No fue posible cargar la asistencia");
      }
      setSetupRequired(false);
      setData(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible cargar la asistencia");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { void load(); }, [load]);

  const employeeProfiles = useMemo(() => data?.profiles.filter((profile) => profile.role === "employee" && profile.active) ?? [], [data]);

  useEffect(() => {
    if (!data?.canManage) return;
    const userId = selectedEmployee || employeeProfiles[0]?.user_id || "";
    if (!userId) return;
    if (!selectedEmployee) setSelectedEmployee(userId);
    setScheduleDraft(defaultSchedule(data.schedules, userId));
  }, [data, employeeProfiles, selectedEmployee]);

  const currentOpenShift = data?.report.records.find((record) => record.userId === data.currentUser.userId && record.isIncomplete && !record.isReversed);

  async function punch(action: "check_in" | "check_out") {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const labels: Record<string, string> = {
          shift_already_open: "Ya existe una jornada abierta. No se duplicó la entrada.",
          no_open_shift: "No existe una entrada abierta para registrar la salida."
        };
        throw new Error(labels[payload.error ?? ""] ?? "No fue posible registrar la marca");
      }
      setMessage(action === "check_in" ? "Entrada registrada con hora del servidor." : "Salida registrada con hora del servidor.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible registrar la marca");
    } finally {
      setBusy(false);
    }
  }

  function openCorrection(record: AttendanceRecord) {
    setSelectedRecord(record);
    setCorrectionIn(meridaLocalInput(record.checkInAt));
    setCorrectionOut(meridaLocalInput(record.checkOutAt));
    setCorrectionReason("");
    setReverseRecord(false);
  }

  async function submitCorrection(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedRecord) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/attendance/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftId: selectedRecord.id,
          targetUserId: selectedRecord.userId,
          correctedCheckInAt: meridaInputToIso(correctionIn),
          correctedCheckOutAt: meridaInputToIso(correctionOut),
          reverse: reverseRecord,
          reason: correctionReason
        })
      });
      if (!response.ok) throw new Error("No fue posible guardar la corrección");
      setSelectedRecord(null);
      setMessage("Corrección guardada con motivo y bitácora.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar la corrección");
    } finally { setBusy(false); }
  }

  async function saveSchedule(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedEmployee) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/attendance/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: selectedEmployee, reason: scheduleReason, schedule: scheduleDraft })
      });
      if (!response.ok) throw new Error("No fue posible guardar el horario");
      setScheduleReason("");
      setMessage("Horario guardado. Los retardos se calcularán con este horario y su tolerancia.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar el horario");
    } finally { setBusy(false); }
  }

  if (loading && !data) return <div className="rounded-[2rem] border border-line bg-white/[0.03] p-8 text-muted">Cargando control de asistencia…</div>;

  if (setupRequired) {
    return (
      <section className="rounded-[2rem] border border-amber-400/25 bg-amber-400/[0.06] p-7 sm:p-10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200">Base privada pendiente</p>
            <h2 className="mt-3 font-serif text-2xl text-bone">La interfaz está lista, pero no guardará marcas sin base de datos.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">Conecta Supabase en Vercel, ejecuta la migración de asistencia y agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return <section className="rounded-[2rem] border border-line bg-white/[0.03] p-8"><p className="text-bone">No fue posible cargar el módulo.</p><button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm"><RefreshCw className="h-4 w-4" /> Reintentar</button></section>;

  return (
    <div className="space-y-8">
      {message ? <div className="rounded-2xl border border-line bg-white/[0.04] px-5 py-4 text-sm text-bone">{message}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[["Jornadas", data.report.summary.shifts], ["Horas", hoursLabel(data.report.summary.workedMinutes)], ["Retardos", data.report.summary.lateCount], ["Incompletas", data.report.summary.incompleteCount], ["Corregidas", data.report.summary.correctedCount]].map(([label, value]) => (
          <div key={String(label)} className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p><p className="mt-3 text-2xl font-medium text-bone">{value}</p></div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-line bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-7 shadow-calm sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs uppercase tracking-[0.24em] text-champagne">Hora del servidor · Mérida</p><h2 className="mt-3 font-serif text-3xl">{currentOpenShift ? "Jornada en curso" : "Sin jornada abierta"}</h2><p className="mt-3 text-sm text-muted">{currentOpenShift ? `Entrada: ${currentOpenShift.checkInLabel}` : "La marca se toma en el servidor; no usa GPS, fotografía ni biometría."}</p></div>
          <button type="button" disabled={busy} onClick={() => void punch(currentOpenShift ? "check_out" : "check_in")} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-champagne px-7 font-medium text-background transition hover:bg-bone disabled:opacity-50">{currentOpenShift ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}{currentOpenShift ? "Registrar salida" : "Registrar entrada"}</button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs uppercase tracking-[0.22em] text-champagne">Historial</p><h2 className="mt-3 font-serif text-2xl">Entradas, salidas y horas</h2></div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-muted">Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block rounded-xl border border-line bg-black/20 px-3 py-2 text-bone" /></label>
            <label className="text-xs text-muted">Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block rounded-xl border border-line bg-black/20 px-3 py-2 text-bone" /></label>
            <button type="button" onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"><RefreshCw className="h-4 w-4" /> Aplicar</button>
            {data.canManage ? <a href={`/api/admin/attendance/export?from=${from}T00:00:00-06:00&to=${to}T23:59:59-06:00`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"><Download className="h-4 w-4" /> CSV</a> : null}
          </div>
        </div>
        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-muted"><tr><th className="px-3 py-3">Fecha</th>{data.canManage ? <th className="px-3 py-3">Personal</th> : null}<th className="px-3 py-3">Entrada</th><th className="px-3 py-3">Salida</th><th className="px-3 py-3">Tiempo</th><th className="px-3 py-3">Estatus</th>{data.canManage ? <th className="px-3 py-3">Acción</th> : null}</tr></thead>
            <tbody className="divide-y divide-line/70">
              {data.report.records.map((record) => (
                <tr key={record.id} className={record.isReversed ? "opacity-50" : ""}>
                  <td className="px-3 py-4 text-bone">{record.localDate}</td>
                  {data.canManage ? <td className="px-3 py-4"><p className="text-bone">{record.employeeName}</p><p className="text-xs text-muted">{record.employeeEmail}</p></td> : null}
                  <td className="px-3 py-4 text-muted">{record.checkInLabel}</td><td className="px-3 py-4 text-muted">{record.checkOutLabel ?? "Pendiente"}</td><td className="px-3 py-4 text-bone">{hoursLabel(record.durationMinutes)}</td>
                  <td className="px-3 py-4"><span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">{record.isIncomplete ? <Clock3 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{statusLabel(record)}</span></td>
                  {data.canManage ? <td className="px-3 py-4"><button type="button" onClick={() => openCorrection(record)} className="inline-flex items-center gap-2 text-xs text-champagne"><Pencil className="h-3.5 w-3.5" /> Corregir</button></td> : null}
                </tr>
              ))}
              {!data.report.records.length ? <tr><td colSpan={data.canManage ? 7 : 5} className="px-3 py-10 text-center text-muted">No hay marcas en este periodo.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {data.canManage ? (
        <section className="rounded-[2rem] border border-line bg-white/[0.025] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Horario y retardos</p><h2 className="mt-3 font-serif text-2xl">Configurar jornada semanal</h2>
          {!employeeProfiles.length ? <p className="mt-5 text-sm leading-6 text-muted">Karen aparecerá aquí después de iniciar sesión una vez en Asistencia.</p> : (
            <form onSubmit={saveSchedule} className="mt-7 space-y-6">
              <label className="block max-w-md text-sm text-muted">Personal<select value={selectedEmployee} onChange={(event) => { const value = event.target.value; setSelectedEmployee(value); setScheduleDraft(defaultSchedule(data.schedules, value)); }} className="mt-2 w-full rounded-xl border border-line bg-[#0b0a09] px-4 py-3 text-bone">{employeeProfiles.map((profile) => <option key={profile.user_id} value={profile.user_id}>{profile.display_name} · {profile.email}</option>)}</select></label>
              <div className="grid gap-3">
                {scheduleDraft.map((day, index) => (
                  <div key={day.weekday} className="grid gap-3 rounded-2xl border border-line p-4 sm:grid-cols-[150px_1fr_1fr_120px] sm:items-center">
                    <label className="flex items-center gap-3 text-sm text-bone"><input type="checkbox" checked={day.active} onChange={(event) => setScheduleDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item))} />{weekdays[day.weekday]}</label>
                    <input aria-label={`Entrada ${weekdays[day.weekday]}`} type="time" disabled={!day.active} value={day.scheduledStart ?? ""} onChange={(event) => setScheduleDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, scheduledStart: event.target.value || null } : item))} className="rounded-xl border border-line bg-black/20 px-3 py-2 text-bone disabled:opacity-35" />
                    <input aria-label={`Salida ${weekdays[day.weekday]}`} type="time" disabled={!day.active} value={day.scheduledEnd ?? ""} onChange={(event) => setScheduleDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, scheduledEnd: event.target.value || null } : item))} className="rounded-xl border border-line bg-black/20 px-3 py-2 text-bone disabled:opacity-35" />
                    <label className="text-xs text-muted">Tolerancia<input type="number" min={0} max={180} disabled={!day.active} value={day.graceMinutes} onChange={(event) => setScheduleDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, graceMinutes: Number(event.target.value) } : item))} className="mt-1 w-full rounded-xl border border-line bg-black/20 px-3 py-2 text-bone disabled:opacity-35" /></label>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm text-muted">Motivo del cambio<input required minLength={5} value={scheduleReason} onChange={(event) => setScheduleReason(event.target.value)} placeholder="Ej. Horario acordado para la quincena" className="mt-2 w-full rounded-xl border border-line bg-black/20 px-4 py-3 text-bone" /></label><button disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-champagne px-6 font-medium text-background disabled:opacity-50"><Save className="h-4 w-4" /> Guardar horario</button></div>
            </form>
          )}
        </section>
      ) : null}

      {selectedRecord ? (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Corregir registro">
          <form onSubmit={submitCorrection} className="w-full max-w-xl rounded-[2rem] border border-line bg-[#11100e] p-7 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">Corrección auditada</p><h2 className="mt-3 font-serif text-2xl">{selectedRecord.employeeName}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm text-muted">Entrada efectiva<input type="datetime-local" value={correctionIn} onChange={(event) => setCorrectionIn(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-black/20 px-3 py-3 text-bone" /></label><label className="text-sm text-muted">Salida efectiva<input type="datetime-local" value={correctionOut} onChange={(event) => setCorrectionOut(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-black/20 px-3 py-3 text-bone" /></label></div>
            <label className="mt-5 flex items-center gap-3 rounded-xl border border-line p-4 text-sm text-bone"><input type="checkbox" checked={reverseRecord} onChange={(event) => setReverseRecord(event.target.checked)} />Revertir lógicamente este registro</label>
            <label className="mt-5 block text-sm text-muted">Motivo obligatorio<textarea required minLength={5} maxLength={500} value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-line bg-black/20 px-4 py-3 text-bone" /></label>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setSelectedRecord(null)} className="rounded-full border border-line px-5 py-3 text-sm">Cancelar</button><button disabled={busy} className="rounded-full bg-champagne px-5 py-3 text-sm font-medium text-background disabled:opacity-50">Guardar corrección</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
