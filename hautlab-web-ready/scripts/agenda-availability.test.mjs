import test from "node:test";
import assert from "node:assert/strict";
import { publicAvailabilityFromSnapshot } from "../lib/agenda-availability.ts";

const now = Date.parse("2026-10-12T08:00:00Z");
const checked_at = new Date(now - 5 * 60_000).toISOString();

test("exposes only future slots and locally formatted labels, not provider extra fields", () => {
  const result = publicAvailabilityFromSnapshot({
    now, minLeadMinutes: 60,
    snapshot: { status: "ok", checked_at, days: [{
      date: "2026-10-12", patient_name: "should_never_leave_server",
      slots: [
        { startsAt: "2026-10-12T10:00:00Z", patient_name: "PRIVATE", label: "do not trust" },
        { startsAt: "2026-10-12T10:00:00Z" },
        { startsAt: "2026-10-12T08:30:00Z" },
        { startsAt: "not-a-date" },
      ],
    }] },
  });
  assert.equal(result.status, "ok");
  assert.equal(result.days.length, 1);
  assert.equal(result.days[0].slots.length, 1);
  assert.equal(result.days[0].slots[0].startsAt, "2026-10-12T10:00:00.000Z");
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  assert.equal(JSON.stringify(result).includes("patient_name"), false);
});

test("stale cache fails closed, without offering expired slots", () => {
  const result = publicAvailabilityFromSnapshot({
    now, minLeadMinutes: 60,
    snapshot: { status: "ok", checked_at: new Date(now - 80 * 60_000).toISOString(), days: [
      { slots: [{ startsAt: "2026-10-12T12:00:00Z" }] },
    ] },
  });
  assert.equal(result.status, "stale");
  assert.deepEqual(result.days, []);
});

test("invalid or failed Nimbo snapshot fails closed", () => {
  assert.equal(publicAvailabilityFromSnapshot({ now, minLeadMinutes: 60, snapshot: null }).status, "unavailable");
  assert.equal(publicAvailabilityFromSnapshot({ now, minLeadMinutes: 60, snapshot: {
    status: "error", checked_at, days: [],
  } }).status, "unavailable");
});

test("far-future days are excluded and nearest slots sorted", () => {
  const result = publicAvailabilityFromSnapshot({
    now, minLeadMinutes: 60,
    snapshot: { status: "ok", checked_at, days: [{ slots: [
      { startsAt: "2026-10-16T12:00:00Z" },
      { startsAt: "2026-10-13T19:00:00Z" },
      { startsAt: "2026-10-27T19:00:00Z" },
    ] }] },
  });
  assert.deepEqual(result.days.map((x) => x.date), ["2026-10-13", "2026-10-16"]);
});
