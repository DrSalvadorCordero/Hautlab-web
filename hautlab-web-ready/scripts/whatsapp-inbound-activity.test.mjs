import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../lib/whatsapp-orchestrator.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261021065000_fix_wa_inbound_timestamps.sql", import.meta.url), "utf8");

function between(start, end) {
  const from = source.indexOf(start);
  assert.ok(from >= 0, "missing " + start);
  const to = source.indexOf(end, from);
  assert.ok(to > from, "missing " + end);
  return source.slice(from, to);
}

test("conversation upsert cannot fabricate a new patient message", () => {
  const upsert = between("async function upsertConversation(", "async function insertInboundMessage(");
  assert.doesNotMatch(upsert, /last_patient_message_at\\s*:/);
  assert.doesNotMatch(upsert, /last_message_at\\s*:/);
  assert.match(upsert, /resolution=merge-duplicates/);
});

test("real inbound insert is uniquely deduplicated before plan side effects", () => {
  const insert = between("async function insertInboundMessage(", "async function claimInboundProcessing(");
  const process = between("async function processTextMessage(", "export async function processWhatsAppWebhook(");
  assert.match(insert, /on_conflict=meta_message_id/);
  assert.match(insert, /resolution=ignore-duplicates,return=representation/);
  assert.match(insert, /return rows\\.length > 0/);
  const insertion = process.indexOf("const isNew = await insertInboundMessage(");
  const guard = process.indexOf("if (!isNew) return;");
  const plan = process.indexOf("if (planCode)");
  const referral = process.indexOf("const referralSnapshot =");
  assert.ok(insertion >= 0 && insertion < guard && guard < plan && plan < referral);
});

test("insert trigger only advances real inbound patient activity and never regresses chronology", () => {
  assert.match(migration, /create or replace function public\\.touch_wa_conversation\\(\\)/i);
  assert.match(migration, /greatest\\(last_message_at, new\\.created_at\\)/);
  assert.match(migration, /when new\\.direction = 'inbound' then greatest\\(last_patient_message_at, new\\.created_at\\)/);
  assert.match(migration, /else last_patient_message_at/);
  assert.doesNotMatch(migration, /\\bupdate public\\.wa_messages\\b/i);
  assert.doesNotMatch(migration, /\\bdelete\\b/i);
});
