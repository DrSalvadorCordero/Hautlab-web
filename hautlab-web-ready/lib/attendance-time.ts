export const ATTENDANCE_TIME_ZONE = "America/Merida";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ATTENDANCE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: ATTENDANCE_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: ATTENDANCE_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short"
});

export function localDateKey(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function localTime(value: string | Date) {
  return timeFormatter.format(new Date(value));
}

export function localDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value));
}

export function weekdayInMerida(value: string | Date) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: ATTENDANCE_TIME_ZONE,
    weekday: "short"
  }).format(new Date(value));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

export function minutesFromLocalTime(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ATTENDANCE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date(value));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function minutesFromClock(clock: string | null) {
  if (!clock) return null;
  const [hour, minute] = clock.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return hour * 60 + minute;
}

export function durationMinutes(start: string, end: string | null) {
  if (!end) return null;
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000));
}
