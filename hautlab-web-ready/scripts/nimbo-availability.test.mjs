import test from "node:test";
import assert from "node:assert/strict";
import { resolveNimboSchedulingAccount, nimboAvailabilityRows, isWithinNimboWorkingHours, resolveNimboEncounterTypeId } from "../lib/server/nimbo-availability.ts";
import {
  classifyNimboAvailabilitySnapshot,
  shouldRunDeepHealthProbe,
} from "../lib/server/nimbo-health.ts";

const schedule = { mon: ["12:00-19:00"], sat: ["12:00-15:00"] };
const within = (startsAt) => isWithinNimboWorkingHours({ startsAt, timezone: "America/Merida", schedule, durationMinutes: 60 });

test("booking selects the sole in-person encounter type and refuses an ambiguous catalog", () => {
  const row = { id: 4916, configuration: { types: { in_person: true } } };
  assert.equal(resolveNimboEncounterTypeId({ encounter_types: [row] }), 4916);
  assert.throws(() => resolveNimboEncounterTypeId({ encounter_types: [] }), /selection_required/);
  assert.throws(() => resolveNimboEncounterTypeId({ encounter_types: [row, { ...row, id: 4917 }] }), /selection_required/);
  assert.throws(() => resolveNimboEncounterTypeId({ encounter_types: [{ ...row, configuration: { types: { in_person: false } } }] }), /selection_required/);
});

test("availability uses the selected doctor's username and location, not another member", () => {
  const result = resolveNimboSchedulingAccount({ organization_members: [
    { id: 1, username: "other", active: true, location_id: 100, configuration: { schedule } },
    { id: 2, username: "selected", active: true, location_id: 200, configuration: { schedule, timezone: "America/Merida" } },
  ] }, 2);
  assert.equal(result.username, "selected");
  assert.equal(result.locationId, 200);
  assert.throws(() => resolveNimboSchedulingAccount({ organization_members: [] }, 2), /schedule_unavailable/);
});

test("missing availability contract fails while a valid empty calendar remains valid", () => {
  assert.throws(() => nimboAvailabilityRows({ error: "upstream failure" }), /invalid_payload/);
  assert.deepEqual(nimboAvailabilityRows({ hours: [] }), []);
});

test("working hours reject early mornings, closed days and appointments ending after close", () => {
  assert.equal(within("2026-10-05T08:00:00-06:00"), false);
  assert.equal(within("2026-10-05T09:00:00-06:00"), false);
  assert.equal(within("2026-10-05T12:00:00-06:00"), true);
  assert.equal(within("2026-10-05T18:00:00-06:00"), true);
  assert.equal(within("2026-10-05T18:30:00-06:00"), false);
  assert.equal(within("2026-10-10T14:00:00-06:00"), true);
  assert.equal(within("2026-10-10T14:30:00-06:00"), false);
  assert.equal(within("2026-10-04T12:00:00-06:00"), false);
  assert.equal(within("2026-10-05T18:00:00Z"), true);
});

test("configuration cannot mask a failed, missing or stale availability probe", () => {
  const now = Date.parse("2026-10-03T08:00:00Z");
  const snapshot = { status: "ok", error: null, slot_count: 0, checked_at: "2026-10-03T07:00:00Z" };
  assert.equal(classifyNimboAvailabilitySnapshot(null, now).status, "degraded");
  assert.equal(classifyNimboAvailabilitySnapshot({ ...snapshot, status: "error", error: "nimbo_api_500" }, now).status, "down");
  assert.equal(classifyNimboAvailabilitySnapshot({ ...snapshot, checked_at: "2026-10-03T05:00:00Z" }, now).status, "degraded");
  assert.equal(classifyNimboAvailabilitySnapshot(snapshot, now).status, "healthy");
});


test("deep health runs for explicit requests or Vercel Cron schedule headers", () => {
  assert.equal(
    shouldRunDeepHealthProbe({ requested: false, cronSchedule: null }),
    false,
  );
  assert.equal(
    shouldRunDeepHealthProbe({ requested: true, cronSchedule: null }),
    true,
  );
  assert.equal(
    shouldRunDeepHealthProbe({
      requested: false,
      cronSchedule: "0 * * * *",
    }),
    true,
  );
});
