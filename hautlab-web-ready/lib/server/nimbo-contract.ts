type JsonRecord = Record<string, unknown>;

export type NimboContractPatient = {
  id: number;
  fullName: string | null;
  birthDate: string | null;
  phone: string | null;
};

export type NimboContractSchedule = {
  id: number;
  personId: number;
  accountId: number;
  startsAt: string;
  endsAt: string;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asFiniteNumber(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanString(value: unknown, max = 500) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;
}

function rowsFromPayload(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [] as unknown[];
  for (const key of keys) {
    if (Array.isArray(root[key])) return root[key] as unknown[];
  }
  return [] as unknown[];
}

export function extractNimboPatientCandidates(payload: unknown): NimboContractPatient[] {
  return rowsFromPayload(payload, ["people", "persons", "accounts", "data"])
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const id = asFiniteNumber(row.id);
      if (!id) return null;
      const firstName = cleanString(row.first_name, 100);
      const lastName = cleanString(row.last_name, 140);
      return {
        id,
        fullName:
          cleanString(row.full_name, 240) ??
          ([firstName, lastName].filter(Boolean).join(" ") || null),
        birthDate: cleanString(row.born_at, 20),
        phone: cleanString(row.telephone2, 40),
      } satisfies NimboContractPatient;
    })
    .filter((item): item is NimboContractPatient => Boolean(item));
}

export function resolveNimboPatientByBirthDate(
  payload: unknown,
  expectedBirthDate: string,
):
  | { status: "matched"; patient: NimboContractPatient }
  | { status: "none" }
  | { status: "ambiguous" } {
  const matches = extractNimboPatientCandidates(payload).filter(
    (patient) => patient.birthDate === expectedBirthDate,
  );
  if (matches.length === 1) return { status: "matched", patient: matches[0] };
  if (matches.length > 1) return { status: "ambiguous" };
  return { status: "none" };
}

function nestedSchedule(payload: unknown) {
  const root = asRecord(payload);
  if (!root) return null;
  return (
    asRecord(root.consultation_schedule) ??
    asRecord(root.schedule) ??
    asRecord(root.data) ??
    root
  );
}

function schedulePersonId(schedule: JsonRecord) {
  return (
    asFiniteNumber(schedule.person_id) ??
    asFiniteNumber(asRecord(schedule.person)?.id)
  );
}

function scheduleAccountId(schedule: JsonRecord) {
  return (
    asFiniteNumber(schedule.account_id) ??
    asFiniteNumber(asRecord(schedule.account)?.id)
  );
}

function sameInstant(left: string | null, right: string) {
  if (!left) return false;
  const leftMs = Date.parse(left);
  const rightMs = Date.parse(right);
  return Number.isFinite(leftMs) && Number.isFinite(rightMs) && leftMs === rightMs;
}

export function verifyNimboSchedulePayload(
  payload: unknown,
  expected: {
    scheduleId: number;
    personId: number;
    accountId: number;
    startsAt: string;
    endsAt: string;
  },
):
  | { ok: true; schedule: NimboContractSchedule }
  | {
      ok: false;
      reason:
        | "invalid_payload"
        | "id_mismatch"
        | "person_mismatch"
        | "account_mismatch"
        | "starts_at_mismatch"
        | "ends_at_mismatch";
    } {
  const schedule = nestedSchedule(payload);
  if (!schedule) return { ok: false, reason: "invalid_payload" };

  const id = asFiniteNumber(schedule.id);
  const personId = schedulePersonId(schedule);
  const accountId = scheduleAccountId(schedule);
  const startsAt = cleanString(schedule.starts_at, 100);
  const endsAt = cleanString(schedule.ends_at, 100);

  if (id !== expected.scheduleId) return { ok: false, reason: "id_mismatch" };
  if (personId !== expected.personId) return { ok: false, reason: "person_mismatch" };
  if (accountId !== expected.accountId) return { ok: false, reason: "account_mismatch" };
  if (!sameInstant(startsAt, expected.startsAt)) {
    return { ok: false, reason: "starts_at_mismatch" };
  }
  if (!sameInstant(endsAt, expected.endsAt)) {
    return { ok: false, reason: "ends_at_mismatch" };
  }

  return {
    ok: true,
    schedule: {
      id,
      personId,
      accountId,
      startsAt: startsAt!,
      endsAt: endsAt!,
    },
  };
}

export function findUniqueNimboScheduleIdByTimes(
  payload: unknown,
  expected: { startsAt: string; endsAt: string },
) {
  const matches = rowsFromPayload(payload, [
    "consultation_schedules",
    "schedules",
    "appointments",
    "data",
  ])
    .map((item) => {
      const schedule = asRecord(item);
      if (!schedule) return null;
      const id = asFiniteNumber(schedule.id);
      const startsAt = cleanString(schedule.starts_at, 100);
      const endsAt = cleanString(schedule.ends_at, 100);
      if (
        !id ||
        !sameInstant(startsAt, expected.startsAt) ||
        !sameInstant(endsAt, expected.endsAt)
      ) {
        return null;
      }
      return id;
    })
    .filter((id): id is number => id !== null);

  return matches.length === 1 ? matches[0] : null;
}

export function buildNimboAppointmentPayload(input: {
  cause: string;
  startsAt: string;
  endsAt: string;
  personId: number;
  accountId: number;
  reminderOwner: "nimbo" | "hautlab";
}) {
  const nimboOwnsAppointmentReminder = input.reminderOwner === "nimbo";
  return {
    consultation_schedule: {
      cause: input.cause.trim().slice(0, 220) || "Cita HAUTLAB",
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      schedule_type: "appointment",
      reminder: nimboOwnsAppointmentReminder,
      sms_reminder: false,
      metadata: {
        share_payment_link: false,
        send_payment_link: false,
      },
      person_id: String(input.personId),
      account_id: String(input.accountId),
    },
  };
}
