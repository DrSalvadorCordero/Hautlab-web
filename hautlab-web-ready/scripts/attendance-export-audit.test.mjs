import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  new URL("../app/api/admin/attendance/export/route.ts", import.meta.url),
  "utf8",
);
const database = readFileSync(
  new URL("../lib/attendance-db.ts", import.meta.url),
  "utf8",
);
const migration = readFileSync(
  new URL(
    "../supabase/migrations/20261019140500_attendance_export_audit.sql",
    import.meta.url,
  ),
  "utf8",
);

test("attendance export audit is service-role only and metadata-only", () => {
  assert.match(migration, /create table if not exists public\.attendance_export_audit/);
  assert.match(
    migration,
    /revoke all on public\.attendance_export_audit from public, anon, authenticated;/,
  );
  assert.match(
    migration,
    /grant select, insert on public\.attendance_export_audit to service_role;/,
  );
  assert.doesNotMatch(migration, /grant all on public\.attendance_export_audit/i);
  assert.doesNotMatch(database, /attendance_export_audit[\s\S]*\bcsv\b/i);
});

test("a CSV response is not returned unless its audit event is stored", () => {
  const csvBuilt = route.indexOf("const csv =");
  const auditStored = route.indexOf("await logAttendanceExport");
  const csvReturned = route.indexOf("return new Response(csv");
  assert.ok(csvBuilt >= 0);
  assert.ok(auditStored > csvBuilt);
  assert.ok(csvReturned > auditStored);
});

test("export audit stores actor, range and aggregate counts only", () => {
  assert.match(database, /actor_user_id: input\.actorUserId/);
  assert.match(database, /range_from: input\.rangeFrom/);
  assert.match(database, /range_to: input\.rangeTo/);
  assert.match(database, /exported_profile_count: input\.exportedProfileCount/);
  assert.match(database, /exported_shift_count: input\.exportedShiftCount/);
  assert.match(route, /exportedProfileCount: profiles\.length/);
  assert.match(route, /exportedShiftCount: shifts\.length/);
});
