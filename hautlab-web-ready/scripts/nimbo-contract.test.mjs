import test from "node:test";
import assert from "node:assert/strict";
import {
  buildNimboAppointmentPayload,
  extractNimboScheduleSnapshot,
  findUniqueNimboScheduleIdByTimes,
  resolveNimboPatientByBirthDate,
  verifyNimboSchedulePayload,
} from "../lib/server/nimbo-contract.ts";

test("shared phone with a different DOB never resolves to the wrong patient", () => {
  const payload = {
    people: [
      {
        id: 11,
        full_name: "Persona Uno",
        telephone2: "9991112233",
        born_at: "1990-01-01",
      },
      {
        id: 22,
        full_name: "Persona Dos",
        telephone2: "9991112233",
        born_at: "1995-05-05",
      },
    ],
  };

  const result = resolveNimboPatientByBirthDate(payload, "1995-05-05");
  assert.equal(result.status, "matched");
  if (result.status === "matched") assert.equal(result.patient.id, 22);

  assert.equal(
    resolveNimboPatientByBirthDate(payload, "2001-02-03").status,
    "none",
  );
});

test("same phone and DOB with multiple records is ambiguous", () => {
  const payload = {
    people: [
      { id: 11, born_at: "1990-01-01", telephone2: "9991112233" },
      { id: 12, born_at: "1990-01-01", telephone2: "9991112233" },
    ],
  };
  assert.equal(
    resolveNimboPatientByBirthDate(payload, "1990-01-01").status,
    "ambiguous",
  );
});

test("saved appointment must match patient, account and exact instants", () => {
  const payload = {
    consultation_schedule: {
      id: 99,
      person_id: 2001,
      account_id: 1001,
      starts_at: "2027-02-10T09:00:00-06:00",
      ends_at: "2027-02-10T09:30:00-06:00",
    },
  };

  assert.equal(
    verifyNimboSchedulePayload(payload, {
      scheduleId: 99,
      personId: 2001,
      accountId: 1001,
      startsAt: "2027-02-10T15:00:00Z",
      endsAt: "2027-02-10T15:30:00Z",
    }).ok,
    true,
  );

  assert.deepEqual(
    verifyNimboSchedulePayload(payload, {
      scheduleId: 99,
      personId: 2002,
      accountId: 1001,
      startsAt: "2027-02-10T15:00:00Z",
      endsAt: "2027-02-10T15:30:00Z",
    }),
    { ok: false, reason: "person_mismatch" },
  );
});

test("duplicate reconciliation only accepts one exact schedule", () => {
  const payload = {
    consultation_schedules: [
      {
        id: 70,
        starts_at: "2027-02-10T09:00:00-06:00",
        ends_at: "2027-02-10T09:30:00-06:00",
      },
      {
        id: 71,
        starts_at: "2027-02-10T10:00:00-06:00",
        ends_at: "2027-02-10T10:30:00-06:00",
      },
    ],
  };
  assert.equal(
    findUniqueNimboScheduleIdByTimes(payload, {
      startsAt: "2027-02-10T15:00:00Z",
      endsAt: "2027-02-10T15:30:00Z",
    }),
    70,
  );
});

test("duplicate reconciliation refuses multiple exact matches", () => {
  const payload = {
    consultation_schedules: [
      {
        id: 70,
        starts_at: "2027-02-10T09:00:00-06:00",
        ends_at: "2027-02-10T09:30:00-06:00",
      },
      {
        id: 72,
        starts_at: "2027-02-10T15:00:00Z",
        ends_at: "2027-02-10T15:30:00Z",
      },
    ],
  };
  assert.equal(
    findUniqueNimboScheduleIdByTimes(payload, {
      startsAt: "2027-02-10T15:00:00Z",
      endsAt: "2027-02-10T15:30:00Z",
    }),
    null,
  );
});

test("appointment payload makes reminder/payment behavior explicit", () => {
  const body = buildNimboAppointmentPayload({
    cause: "Valoración",
    startsAt: "2027-02-10T09:00:00-06:00",
    endsAt: "2027-02-10T09:30:00-06:00",
    personId: 2001,
    accountId: 1001,
    reminderOwner: "nimbo",
  });

  assert.equal(body.consultation_schedule.schedule_type, "appointment");
  assert.equal(body.consultation_schedule.reminder, true);
  assert.equal(body.consultation_schedule.sms_reminder, false);
  assert.deepEqual(body.consultation_schedule.metadata, {
    share_payment_link: false,
    send_payment_link: false,
  });
});


test("external schedule snapshot detects explicit cancellation without inferring from time", () => {
  const snapshot = extractNimboScheduleSnapshot({
    consultation_schedule: {
      id: 90,
      person_id: 2001,
      account_id: 1001,
      starts_at: "2027-02-10T09:00:00-06:00",
      ends_at: "2027-02-10T09:30:00-06:00",
      status: "cancelled",
    },
  });

  assert.equal(snapshot?.lifecycle, "cancelled");
  assert.equal(snapshot?.id, 90);
});

test("external schedule snapshot preserves changed instants as scheduled", () => {
  const snapshot = extractNimboScheduleSnapshot({
    consultation_schedule: {
      id: 91,
      person: { id: 2001 },
      account: { id: 1001 },
      starts_at: "2027-02-10T10:00:00-06:00",
      ends_at: "2027-02-10T10:30:00-06:00",
      state: "confirmed",
    },
  });

  assert.equal(snapshot?.lifecycle, "scheduled");
  assert.equal(snapshot?.startsAt, "2027-02-10T10:00:00-06:00");
});
