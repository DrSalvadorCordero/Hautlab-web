import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";
import { canManageRestrictedAdmin } from "@/lib/admin-permissions";
import { getGrowthOsSnapshot } from "@/lib/growth-os-db";
import { getNimboConfig, isNimboReadyForAutobooking } from "@/lib/server/nimbo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// All values returned by this endpoint are aggregate operational signals.
// Never return patient identity, messages, credentials or clinical records.
function databaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) throw new Error("database_unavailable");
  return { url, key };
}

async function databaseRequest(path: string, method: "GET" | "HEAD" = "GET") {
  const { url, key } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
      Accept: "application/json",
      ...(method === "HEAD" ? { Prefer: "count=exact" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`database_http_${response.status}`);
  return response;
}

async function count(path: string) {
  const response = await databaseRequest(path, "HEAD");
  const range = response.headers.get("content-range");
  if (!range || !/\\/\\d+$/.test(range)) throw new Error("count_header_missing");
  const total = Number(range.slice(range.lastIndexOf("/") + 1));
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("invalid_count");
  return total;
}

async function getOperations() {
  const [conversations, followupSignals, clinicalRisk, unresolvedIncidents] = await Promise.all([
    count("wa_conversations?select=id"),
    count("wa_conversations?select=id&closed_at=is.null&outcome=is.null&or=(clinical_risk.eq.true,risk_level.eq.urgent,bot_paused.eq.true,handoff_status.in.(pending,assigned),appointment_status.in.(collecting,pending_confirmation))"),
    count("wa_conversations?select=id&closed_at=is.null&outcome=is.null&or=(clinical_risk.eq.true,risk_level.eq.urgent)"),
    count("hautlab_reliability_incidents?select=id&resolved_at=is.null"),
  ]);
  return { conversations, followupSignals, clinicalRisk, unresolvedIncidents };
}

async function getWhatsAppStatus() {
  const response = await databaseRequest("wa_settings?select=global_mode,emergency_stop,updated_at&id=eq.global&limit=1");
  const rows = (await response.json()) as Array<{
    global_mode: string;
    emergency_stop: boolean;
    updated_at: string | null;
  }>;
  const settings = rows[0];
  if (!settings) throw new Error("whatsapp_settings_missing");
  return {
    mode: settings.global_mode,
    emergencyStop: settings.emergency_stop,
    updatedAt: settings.updated_at,
  };
}

async function getNimboStatus() {
  const config = await getNimboConfig();
  return {
    enabled: config.enabled,
    connected: Boolean(config.base_url && config.doctor_account_id),
    readyForAutobooking: isNimboReadyForAutobooking(config),
    lastVerifiedAt: config.last_verified_at,
    hasError: Boolean(config.last_error),
  };
}

async function getGrowthStatus() {
  const snapshot = await getGrowthOsSnapshot(30);
  return {
    leads: snapshot.leads,
    appointmentRequested: snapshot.appointmentRequested,
    appointmentConfirmed: snapshot.appointmentConfirmed,
    recordedRevenueMxn: snapshot.recordedRevenueMxn,
    adSpendConnected: snapshot.adSpendConnected,
    generatedAt: snapshot.generatedAt,
  };
}

function noStoreJson(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function GET() {
  const access = await getAdminAccess();
  if (!canManageRestrictedAdmin(access)) {
    return noStoreJson({ error: "forbidden" }, 403);
  }

  const [operations, growth, nimbo, whatsapp] = await Promise.allSettled([
    getOperations(),
    getGrowthStatus(),
    getNimboStatus(),
    getWhatsAppStatus(),
  ]);

  return noStoreJson({
    generatedAt: new Date().toISOString(),
    sources: {
      operations: operations.status === "fulfilled" ? "ok" : "unavailable",
      growth: growth.status === "fulfilled" ? "ok" : "unavailable",
      nimbo: nimbo.status === "fulfilled" ? "ok" : "unavailable",
      whatsapp: whatsapp.status === "fulfilled" ? "ok" : "unavailable",
    },
    operations: operations.status === "fulfilled" ? operations.value : null,
    growth: growth.status === "fulfilled" ? growth.value : null,
    nimbo: nimbo.status === "fulfilled" ? nimbo.value : null,
    whatsapp: whatsapp.status === "fulfilled" ? whatsapp.value : null,
  });
}
