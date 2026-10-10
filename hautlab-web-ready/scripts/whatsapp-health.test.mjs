import test from "node:test";
import assert from "node:assert/strict";
import { classifyWhatsAppOperationalSignals } from "../lib/server/whatsapp-health.ts";

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
