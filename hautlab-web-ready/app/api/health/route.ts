import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { classifyWhatsAppOperationalSignals, readWhatsAppOperationalSignals, safeWhatsAppProbeFailure } from "@/lib/server/whatsapp-health";
import { getNimboAvailability, getNimboAvailabilitySnapshot, getNimboConfig, isNimboReadyForAutobooking } from "@/lib/server/nimbo";
import {
  classifyNimboAvailabilitySnapshot,
  shouldRunDeepHealthProbe,
} from "@/lib/server/nimbo-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = { status: "healthy" | "degraded" | "down"; detail?: string; latencyMs?: number; checkedAt: string };

function todayInMerida() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Merida", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
}
function secretMatches(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return Boolean(expected) && left.length === right.length && timingSafeEqual(left, right);
}
async function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && secretMatches(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) return true;
  // Reuse the existing server-to-server triage credential for operational
  // verification. Never allow an unauthenticated request to trigger a probe.
  const received = request.headers.get("x-hautlab-internal-key")?.trim();
  if (!received) return false;
  const configured = process.env.HAUTLAB_INTERNAL_API_KEY?.trim();
  if (configured) return secretMatches(received, configured);
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) return false;
  try {
    const response = await fetch(`${url}/rest/v1/wa_internal_config?key=eq.relay_hmac_secret&select=secret_value&limit=1`, {
      headers: { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }), Accept: "application/json" },
      cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const rows = await response.json() as Array<{ secret_value?: string }>;
    return secretMatches(received, rows[0]?.secret_value?.trim() ?? "");
  } catch { return false; }
}
async function saveNimboSnapshot(input: { from: string; to: string; days: unknown; slotCount: number; status: "ok" | "error"; error?: string }) {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) return;
  const response = await fetch(`${url}/rest/v1/nimbo_availability_snapshot?on_conflict=id`, { method: "POST", headers: { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id: "global", from_date: input.from, to_date: input.to, days: input.days, slot_count: input.slotCount, status: input.status, error: input.error ?? null, checked_at: new Date().toISOString(), updated_at: new Date().toISOString() }), cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("nimbo_snapshot_save_failed");
}

function check(status: Check["status"], detail?: string, latencyMs?: number): Check {
  return { status, ...(detail ? { detail } : {}), ...(latencyMs !== undefined ? { latencyMs } : {}), checkedAt: new Date().toISOString() };
}

// Only known, fixed operational labels may reach shared production logs.
// Nimbo errors can contain upstream text and must never be logged verbatim.
const SAFE_HEALTH_REASONS = new Set([
  "nextjs_runtime", "webhook_configured", "verify_token_missing",
  "openai_configured", "openai_key_missing", "supabase_configured",
  "supabase_configuration_missing", "automation_emergency_stop_active",
  "automation_not_in_automatic_mode", "multiple_recent_outbound_failures",
  "multiple_recent_operator_alert_failures", "automatic_conversation_overdue",
  "no_recent_operational_anomalies_detected",
  "whatsapp_operational_probe_unavailable", "autobooking_not_ready",
  "availability_not_verified", "availability_probe_failed",
  "availability_probe_stale_or_invalid",
]);

function safeHealthReason(detail?: string): string {
  if (!detail) return "none";
  if (SAFE_HEALTH_REASONS.has(detail)) return detail;
  if (/^availability_(?:ok|verified):slots=\d+$/.test(detail)) {
    return detail.startsWith("availability_ok:") ? "availability_ok" : "availability_verified";
  }
  return "unclassified";
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  const deep = shouldRunDeepHealthProbe({
    requested: request.nextUrl.searchParams.get("deep") === "1",
    cronSchedule: request.headers.get("x-vercel-cron-schedule"),
  });
  const isAuthorized = await authorized(request);
  const components: Record<string, Check> = {
    app: check("healthy", "nextjs_runtime", Date.now() - started),
    whatsapp: process.env.WHATSAPP_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN
      ? check("healthy", "webhook_configured")
      : check("down", "verify_token_missing"),
    triage: process.env.OPENAI_API_KEY
      ? check("healthy", "openai_configured")
      : check("down", "openai_key_missing"),
    datastore: process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
      ? check("healthy", "supabase_configured")
      : check("down", "supabase_configuration_missing"),
  };

  if (components.whatsapp.status !== "down") {
    try {
      const signals = await readWhatsAppOperationalSignals();
      const observed = classifyWhatsAppOperationalSignals(signals);
      components.whatsapp = check(observed.status, observed.detail);
    } catch (error) {
      console.error("[whatsapp-health] operational probe failed", safeWhatsAppProbeFailure(error));
      // A verified credential is not sufficient to claim a healthy inbox.
      components.whatsapp = check("down", "whatsapp_operational_probe_unavailable");
    }
  }

  try {
    const config = await getNimboConfig();
    if (isNimboReadyForAutobooking(config)) {
      const verified = classifyNimboAvailabilitySnapshot(await getNimboAvailabilitySnapshot());
      components.nimbo = check(verified.status, verified.detail);
    } else {
      components.nimbo = check("degraded", "autobooking_not_ready");
    }

    if (deep && isAuthorized && isNimboReadyForAutobooking(config)) {
      const from = todayInMerida();
      const t0 = Date.now();
      const days = await getNimboAvailability({ from, to: addDays(from, 7) });
      const slotCount = days.reduce((sum, day) => sum + day.slots.length, 0);
      components.nimbo = check("healthy", `availability_ok:slots=${slotCount}`, Date.now() - t0);
      await saveNimboSnapshot({ from, to: addDays(from, 7), days, slotCount, status: "ok" });
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 120) : "nimbo_probe_failed";
    components.nimbo = check("down", detail);
    if (deep && isAuthorized) {
      const from = todayInMerida();
      await saveNimboSnapshot({
        from,
        to: addDays(from, 7),
        days: [],
        slotCount: 0,
        status: "error",
        error: detail,
      }).catch(() => undefined);
    }
  }

  const states = Object.values(components).map((item) => item.status);
  const status = states.includes("down") ? "down" : states.includes("degraded") ? "degraded" : "healthy";
  const body = {
    service: "hautlab-production",
    status,
    checkedAt: new Date().toISOString(),
    deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
    components: isAuthorized ? components : Object.fromEntries(Object.entries(components).map(([key, value]) => [key, { status: value.status, checkedAt: value.checkedAt }])),
  };
  console.info("hautlab_health_probe", {
    status,
    deep: deep && isAuthorized,
    components: Object.fromEntries(Object.entries(components).map(([name, value]) => [name, value.status])),
    reasons: Object.fromEntries(Object.entries(components).map(([name, value]) => [name, safeHealthReason(value.detail)])),
  });
  return NextResponse.json(body, { status: status === "down" ? 503 : 200, headers: { "Cache-Control": "no-store, max-age=0" } });
}
