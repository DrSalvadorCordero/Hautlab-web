import test from "node:test";
import assert from "node:assert/strict";
import { classifyWhatsAppOperationalSignals, countOverdueAutomaticConversations } from "../lib/server/whatsapp-health.ts";

const normal = {
  globalMode: "automatic",
  emergencyStop: false,
  overdueAutomaticConversations: 0,
  recentFailedOutbound: 0,
  recentFailedNotifications: 0,
};

test("healthy never claims proven delivery from a configuration check", () => {
  assert.deepEqual(classifyWhatsAppOperationalSignals(normal), {
    status: "healthy",
    detail: "no_recent_operational_anomalies_detected",
  });
});

test("a single overdue eligible automated lead degrades health", () => {
  const result = classifyWhatsAppOperationalSignals({
    ...normal, overdueAutomaticConversations: 1,
  });
  assert.equal(result.status, "degraded");
  assert.equal(result.detail, "automatic_conversation_overdue");
});

test("multiple failed outbound messages are detected", () => {
  const result = classifyWhatsAppOperationalSignals({
    ...normal, recentFailedOutbound: 2,
  });
  assert.equal(result.detail, "multiple_recent_outbound_failures");
});

test("failed human escalation alerts are detected", () => {
  const result = classifyWhatsAppOperationalSignals({
    ...normal, recentFailedNotifications: 2,
  });
  assert.equal(result.detail, "multiple_recent_operator_alert_failures");
});

test("an emergency stop remains visible as degraded, never silently reactivated", () => {
  const result = classifyWhatsAppOperationalSignals({
    ...normal, emergencyStop: true,
  });
  assert.equal(result.detail, "automation_emergency_stop_active");
});

test("intentional manual mode remains visible without changing settings", () => {
  const result = classifyWhatsAppOperationalSignals({
    ...normal, globalMode: "manual",
  });
  assert.equal(result.detail, "automation_not_in_automatic_mode");
});

test("overdue detector excludes human-paused, clinical, handoff and answered conversations", () => {
  const now = Date.parse("2026-10-10T20:00:00Z");
  const base = {
    last_patient_message_at: "2026-10-10T19:30:00Z",
    last_team_message_at: "2026-10-10T19:20:00Z",
    ai_mode: "inherit",
    bot_paused: false,
    handoff_status: "none",
    clinical_risk: false,
    closed_at: null,
  };
  const rows = [
    base,
    { ...base, bot_paused: true },
    { ...base, clinical_risk: true },
    { ...base, handoff_status: "assigned" },
    { ...base, ai_mode: "off" },
    { ...base, closed_at: "2026-10-10T19:45:00Z" },
    { ...base, last_team_message_at: "2026-10-10T19:35:00Z" },
    { ...base, last_patient_message_at: "2026-10-10T19:50:00Z" },
  ];
  assert.equal(countOverdueAutomaticConversations(rows, now), 1);
});

test("fresh unanswered incoming messages get the full 15 minute grace period", () => {
  const now = Date.parse("2026-10-10T20:00:00Z");
  const row = {
    last_patient_message_at: "2026-10-10T19:46:00Z",
    last_team_message_at: null,
    ai_mode: "automatic",
    bot_paused: false,
    handoff_status: "none",
    clinical_risk: false,
    closed_at: null,
  };
  assert.equal(countOverdueAutomaticConversations([row], now), 0);
});
