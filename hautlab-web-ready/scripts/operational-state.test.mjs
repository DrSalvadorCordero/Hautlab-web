import test from "node:test";
import assert from "node:assert/strict";
import { deriveConversationOperationalState } from "../lib/operational-state.ts";

const now = Date.parse("2026-10-19T03:00:00Z");
const ago = (mins) => new Date(now - mins * 60_000).toISOString();
const base = () => ({
  clinical_risk: false, risk_level: null, assigned_to: null, bot_paused: false,
  handoff_status: "none", appointment_status: null, appointment_requested_at: null,
  last_patient_message_at: ago(20), last_team_message_at: null, last_message_at: ago(20),
  closed_at: null, outcome: null,
});

test("recent unanswered inbound without a handoff must enter human queue", () => {
  assert.equal(deriveConversationOperationalState(base(),now), "human_pending");
});

test("do not escalate message still within response grace period", () => {
  assert.equal(deriveConversationOperationalState({...base(),last_patient_message_at:ago(5)},now), "idle");
});

test("a newer team response resolves overdue classification", () => {
  assert.equal(deriveConversationOperationalState({...base(),last_team_message_at:ago(3)},now), "idle");
});

test("a stale inbound does not reactivate ancient leads", () => {
  assert.equal(deriveConversationOperationalState({...base(),last_patient_message_at:ago(73*60)},now), "idle");
});

test("existing clinical, manual, and closed rules retain priority", () => {
  assert.equal(deriveConversationOperationalState({...base(),clinical_risk:true},now), "clinical_review");
  assert.equal(deriveConversationOperationalState({...base(),bot_paused:true},now), "human_pending");
  assert.equal(deriveConversationOperationalState({...base(),closed_at:ago(1)},now), "closed");
});

test("callers without team timestamp retain former semantics", () => {
  const {last_team_message_at, ...legacy}=base();
  assert.equal(deriveConversationOperationalState(legacy,now), "idle");
});
