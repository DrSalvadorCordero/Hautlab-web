type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
}

export function resolveNimboSchedulingAccount(payload: unknown, accountId: number) {
  const root = record(payload);
  const members = Array.isArray(payload) ? payload : root?.organization_members;
  if (!Array.isArray(members)) throw new Error("nimbo_members_invalid_payload");
  const member = members.map(record).find((row) => Number(row?.id) === accountId);
  const username = typeof member?.username === "string" ? member.username.trim() : "";
  const configuration = record(member?.configuration);
  const schedule = record(configuration?.schedule);
  if (!member || member.active === false || !username || !schedule) {
    throw new Error("nimbo_doctor_schedule_unavailable");
  }
  return {
    username,
    locationId: Number.isInteger(member.location_id) ? member.location_id as number : null,
    schedule,
    timezone: typeof configuration?.timezone === "string" ? configuration.timezone : null,
  };
}

export function nimboAvailabilityRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = record(payload);
  const data = record(root?.data);
  for (const rows of [root?.hours, data?.hours, root?.availability]) {
    if (Array.isArray(rows)) return rows;
  }
  throw new Error("nimbo_availability_invalid_payload");
}

export function resolveNimboEncounterTypeId(payload: unknown) {
  const root = record(payload);
  const rows = root?.encounter_types;
  if (!Array.isArray(rows)) throw new Error("nimbo_encounter_types_invalid_payload");
  const eligible = rows.map(record).filter((row) => {
    const types = record(record(row?.configuration)?.types);
    return row && Number.isInteger(row.id) && Number(row.id) > 0 && row.active !== false && types?.in_person !== false;
  });
  if (eligible.length !== 1) throw new Error("nimbo_encounter_type_selection_required");
  return eligible[0]!.id as number;
}

export function isWithinNimboWorkingHours(input: {
  startsAt: string;
  timezone: string;
  schedule: RecordValue;
  durationMinutes: number;
}) {
  const start = new Date(input.startsAt);
  if (!Number.isFinite(start.getTime()) || input.durationMinutes <= 0) return false;
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const day = (date: Date) => new Intl.DateTimeFormat("en-US", { timeZone: input.timezone, weekday: "short" }).format(date).toLowerCase();
  const clock = (date: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: input.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
  if (day(start) !== day(end)) return false;
  const ranges = input.schedule[day(start)];
  if (!Array.isArray(ranges)) return false;
  return ranges.some((range) => {
    if (typeof range !== "string" || !/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(range)) return false;
    const [opens, closes] = range.split("-");
    return clock(start) >= opens && clock(end) <= closes && clock(start) < closes;
  });
}
