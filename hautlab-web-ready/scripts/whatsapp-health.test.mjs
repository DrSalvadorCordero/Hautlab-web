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

test("probe failures preserve only safe fixed labels and HTTP status", async () => {
  const { WhatsAppProbeReadError, safeWhatsAppProbeFailure } = await import("../lib/server/whatsapp-health.ts");
  assert.deepEqual(safeWhatsAppProbeFailure(new WhatsAppProbeReadError("notifications", "http", 403)), {
    code: "whatsapp_probe_store_unavailable", resource: "notifications", reason: "http", httpStatus: 403,
  });
  assert.deepEqual(safeWhatsAppProbeFailure(new Error("secret patient body https://private.example")), {
    code: "whatsapp_operational_probe_unavailable",
  });
  assert.deepEqual(safeWhatsAppProbeFailure(new Error("supabase_configuration_missing")), {
    code: "supabase_configuration_missing",
  });
});

test("read-only probe classifies HTTP, timeout, network and malformed responses without leaking payloads", async () => {
  const { readWhatsAppOperationalSignals, safeWhatsAppProbeFailure } = await import("../lib/server/whatsapp-health.ts");
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SECRET_KEY = "test-only-not-a-credential";
  try {
    const cases = [
      [async () => new Response("private response body", { status: 401 }), "http"],
      [async () => { throw new DOMException("private error", "TimeoutError"); }, "timeout"],
      [async () => { throw new TypeError("private error"); }, "network"],
      [async () => new Response('{"private":"data"}'), "invalid_response"],
    ];
    globalThis.fetch = async (url, init) => {
      assert.equal(init.method, undefined);
      const data = url.includes("wa_settings?") ? [{ global_mode: "automatic", emergency_stop: false }] : [];
      return Response.json(data);
    };
    assert.deepEqual(await readWhatsAppOperationalSignals(), normal);
    for (const [mock, reason] of cases) {
      globalThis.fetch = mock;
      await assert.rejects(readWhatsAppOperationalSignals(), (error) => {
        const safe = safeWhatsAppProbeFailure(error);
        assert.equal(safe.reason, reason);
        assert.equal(safe.resource, "settings");
        assert.equal(JSON.stringify(safe).includes("private"), false);
        return true;
      });
    }
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
  }
});

test("Supabase opaque keys use apikey only, while legacy JWT keys retain Bearer", async () => {
  const { readWhatsAppOperationalSignals } = await import("../lib/server/whatsapp-health.ts");
  const previous = {
    fetch: globalThis.fetch,
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY,
    legacy: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const requests = [];
  process.env.SUPABASE_URL = "https://example.invalid";
  globalThis.fetch = async (url, init) => {
    requests.push(init.headers);
    const rows = String(url).includes("wa_settings?")
      ? [{ global_mode: "automatic", emergency_stop: false }] : [];
    return Response.json(rows);
  };
  try {
    process.env.SUPABASE_SECRET_KEY = "sb_secret_example_test_only";
    await readWhatsAppOperationalSignals();
    assert.equal(requests.length, 4);
    for (const headers of requests) {
      assert.equal(headers.apikey, "sb_secret_example_test_only");
      assert.equal(headers.Authorization, undefined);
    }
    requests.length = 0;
    process.env.SUPABASE_SECRET_KEY = "legacy.mock.jwt";
    await readWhatsAppOperationalSignals();
    assert.equal(requests.length, 4);
    for (const headers of requests) {
      assert.equal(headers.apikey, "legacy.mock.jwt");
      assert.equal(headers.Authorization, "Bearer legacy.mock.jwt");
    }
  } finally {
    globalThis.fetch = previous.fetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previous.secret;
    if (previous.legacy === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.legacy;
  }
});


test("transient HTTP 401 is retried once without exposing records or changing the credential", async () => {
  const { readWhatsAppOperationalSignals } = await import("../lib/server/whatsapp-health.ts");
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_health_mock_not_real";
  const resources = [];
  let rejected = false;
  try {
    globalThis.fetch = async (url, init) => {
      const resource = String(url).includes("/wa_settings?") ? "settings" : "other";
      resources.push({ resource, credential: init.headers.apikey });
      if (resource === "settings" && !rejected) {
        rejected = true;
        return new Response("", { status: 401 });
      }
      return Response.json(resource === "settings" ? [{ global_mode: "automatic", emergency_stop: false }] : []);
    };
    assert.deepEqual(await readWhatsAppOperationalSignals(), normal);
    assert.equal(resources.filter((item) => item.resource === "settings").length, 2);
    assert.equal(resources.length, 5);
    assert.ok(resources.every((item) => item.credential === "sb_secret_health_mock_not_real"));
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
  }
});

test("persistent HTTP 401 remains a visible auth failure after exactly one retry", async () => {
  const { readWhatsAppOperationalSignals, safeWhatsAppProbeFailure } = await import("../lib/server/whatsapp-health.ts");
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_health_mock_not_real";
  let settingsCalls = 0;
  try {
    globalThis.fetch = async (url) => {
      if (String(url).includes("/wa_settings?")) {
        settingsCalls += 1;
        return new Response("never log this", { status: 401 });
      }
      return Response.json([]);
    };
    await assert.rejects(readWhatsAppOperationalSignals(), (error) => {
      assert.deepEqual(safeWhatsAppProbeFailure(error), {
        code: "whatsapp_probe_store_unavailable", resource: "settings", reason: "http", httpStatus: 401,
      });
      return true;
    });
    assert.equal(settingsCalls, 2);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
  }
});
