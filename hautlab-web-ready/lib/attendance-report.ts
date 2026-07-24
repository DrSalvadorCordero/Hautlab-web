import type {
  AttendanceProfileRow,
  AttendanceScheduleRow,
  AttendanceShiftRow
} from "@/lib/attendance-db";
import {
  durationMinutes,
  localDateKey,
  localDateTime,
  localTime,
  minutesFromClock,
  minutesFromLocalTime,
  weekdayInMerida
} from "@/lib/attendance-time";

export type AttendanceRecord = {
  id: string;
  userId: string;
  employeeName: string;
  employeeEmail: string;
  localDate: string;
  checkInAt: string;
  checkOutAt: string | null;
  originalCheckInAt: string;
  originalCheckOutAt: string | null;
  checkInLabel: string;
  checkOutLabel: string | null;
  durationMinutes: number | null;
  lateMinutes: number | null;
  isLate: boolean;
  isIncomplete: boolean;
  isCorrected: boolean;
  isReversed: boolean;
  reversalReason: string | null;
  status: "open" | "complete" | "late" | "reversed";
};

export type AttendancePeriodTotal = {
  key: string;
  label: string;
  shifts: number;
  workedMinutes: number;
  lateCount: number;
  incompleteCount: number;
};

export type AttendanceReport = {
  records: AttendanceRecord[];
  summary: {
    shifts: number;
    workedMinutes: number;
    lateCount: number;
    incompleteCount: number;
    correctedCount: number;
  };
  weekly: AttendancePeriodTotal[];
  monthly: AttendancePeriodTotal[];
};

function effectiveCheckIn(shift: AttendanceShiftRow) {
  return shift.corrected_check_in_at ?? shift.check_in_at;
}

function effectiveCheckOut(shift: AttendanceShiftRow) {
  return shift.corrected_check_out_at ?? shift.check_out_at;
}

function weekKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function periodTotals(records: AttendanceRecord[], type: "week" | "month") {
  const groups = new Map<string, AttendancePeriodTotal>();

  records.forEach((record) => {
    if (record.isReversed) return;
    const key = type === "week" ? weekKey(record.localDate) : record.localDate.slice(0, 7);
    const existing = groups.get(key) ?? {
      key,
      label: type === "week" ? `Semana ${key.split("W")[1]}` : key,
      shifts: 0,
      workedMinutes: 0,
      lateCount: 0,
      incompleteCount: 0
    };
    existing.shifts += 1;
    existing.workedMinutes += record.durationMinutes ?? 0;
    existing.lateCount += record.isLate ? 1 : 0;
    existing.incompleteCount += record.isIncomplete ? 1 : 0;
    groups.set(key, existing);
  });

  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}

export function buildAttendanceReport(input: {
  shifts: AttendanceShiftRow[];
  profiles: AttendanceProfileRow[];
  schedules: AttendanceScheduleRow[];
}): AttendanceReport {
  const profileMap = new Map(input.profiles.map((profile) => [profile.user_id, profile]));
  const scheduleMap = new Map(
    input.schedules.map((schedule) => [`${schedule.user_id}:${schedule.weekday}`, schedule])
  );

  const records = input.shifts.map<AttendanceRecord>((shift) => {
    const profile = profileMap.get(shift.user_id);
    const checkInAt = effectiveCheckIn(shift);
    const checkOutAt = effectiveCheckOut(shift);
    const schedule = scheduleMap.get(`${shift.user_id}:${weekdayInMerida(checkInAt)}`);
    const scheduledMinutes = schedule?.active ? minutesFromClock(schedule.scheduled_start) : null;
    const lateMinutes =
      scheduledMinutes === null
        ? null
        : Math.max(
            0,
            minutesFromLocalTime(checkInAt) - scheduledMinutes - Math.max(schedule?.grace_minutes ?? 0, 0)
          );
    const isReversed = Boolean(shift.reversed_at);
    const isIncomplete = !isReversed && !checkOutAt;
    const isLate = !isReversed && Boolean(lateMinutes && lateMinutes > 0);
    const isCorrected = Boolean(shift.corrected_check_in_at || shift.corrected_check_out_at);

    return {
      id: shift.id,
      userId: shift.user_id,
      employeeName: profile?.display_name ?? "Personal HAUTLAB",
      employeeEmail: profile?.email ?? "",
      localDate: localDateKey(checkInAt),
      checkInAt,
      checkOutAt,
      originalCheckInAt: shift.check_in_at,
      originalCheckOutAt: shift.check_out_at,
      checkInLabel: localDateTime(checkInAt),
      checkOutLabel: checkOutAt ? localDateTime(checkOutAt) : null,
      durationMinutes: isReversed ? null : durationMinutes(checkInAt, checkOutAt),
      lateMinutes,
      isLate,
      isIncomplete,
      isCorrected,
      isReversed,
      reversalReason: shift.reversal_reason,
      status: isReversed ? "reversed" : isIncomplete ? "open" : isLate ? "late" : "complete"
    };
  });

  const activeRecords = records.filter((record) => !record.isReversed);
  return {
    records,
    summary: {
      shifts: activeRecords.length,
      workedMinutes: activeRecords.reduce((total, record) => total + (record.durationMinutes ?? 0), 0),
      lateCount: activeRecords.filter((record) => record.isLate).length,
      incompleteCount: activeRecords.filter((record) => record.isIncomplete).length,
      correctedCount: activeRecords.filter((record) => record.isCorrected).length
    },
    weekly: periodTotals(records, "week"),
    monthly: periodTotals(records, "month")
  };
}

export function attendanceCsv(report: AttendanceReport) {
  const escape = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const header = [
    "Fecha",
    "Empleado",
    "Correo",
    "Entrada",
    "Salida",
    "Horas trabajadas",
    "Retardo (min)",
    "Estatus",
    "Corregido",
    "Motivo de reversión"
  ];
  const rows = report.records.map((record) => [
    record.localDate,
    record.employeeName,
    record.employeeEmail,
    localTime(record.checkInAt),
    record.checkOutAt ? localTime(record.checkOutAt) : "",
    record.durationMinutes === null ? "" : (record.durationMinutes / 60).toFixed(2),
    record.lateMinutes,
    record.isReversed
      ? "Revertido"
      : record.isIncomplete
        ? "Pendiente de salida"
        : record.isLate
          ? "Retardo"
          : "Completo",
    record.isCorrected ? "Sí" : "No",
    record.reversalReason
  ]);
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
