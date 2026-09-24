import { NextRequest, NextResponse } from "next/server";
import { getNimboConfig } from "@/lib/server/nimbo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROBE_KEY = "nimbo_probe_8W3k6Q2m";

async function readAccessToken() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !key) throw new Error("supabase_not_configured");

  const response = await fetch(`${url}/rest/v1/rpc/hautlab_nimbo_secret`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_name: "access_token" }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`secret_read_${response.status}`);
  return (await response.json()) as string;
}

function summarize(payload: unknown) {
  if (Array.isArray(payload)) return { kind: "array", length: payload.length };
  if (payload && typeof payload === "object") {
    return {
      kind: "object",
      keys: Object.keys(payload as Record<string, unknown>).slice(0, 12),
    };
  }
  return { kind: typeof payload };
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("k") !== PROBE_KEY) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const config = await getNimboConfig();
    if (!config.base_url || !config.doctor_account_id) {
      throw new Error("nimbo_config_incomplete");
    }
    const token = await readAccessToken();
    const from = "2026-09-24";
    const to = "2026-09-30";
    const account = String(config.doctor_account_id);
    const slug = config.organization_slug ?? "";

    const candidates = [
      "organizations/current",
      "organization_members",
      "locations",
      `accounts/${account}`,
      `calendar/available_hours_organization?from=${from}&to=${to}&monthly=false&slug=${encodeURIComponent(slug)}`,
      `calendar/available_hours?from=${from}&to=${to}&monthly=false&account=${account}`,
      `calendar/available_hours?from=${from}&to=${to}&monthly=false&account_id=${account}`,
      `available_hours?from=${from}&to=${to}&monthly=false&account=${account}`,
      `schedules?account_id=${account}&from=${from}&to=${to}`,
      `consultation_schedules?account_id=${account}&from=${from}&to=${to}`,
      `accounts/${account}/schedules?from=${from}&to=${to}`,
      `accounts/${account}/consultation_schedules?from=${from}&to=${to}`,
    ];

    const results = [];
    for (const path of candidates) {
      try {
        const response = await fetch(
          `${config.base_url.replace(/\/$/, "")}/${path}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          },
        );
        const text = await response.text();
        let payload: unknown = null;
        try {
          payload = text ? JSON.parse(text) : null;
        } catch {
          payload = null;
        }
        results.push({
          path: path.split("?")[0],
          status: response.status,
          ok: response.ok,
          shape: response.ok ? summarize(payload) : undefined,
        });
      } catch {
        results.push({ path: path.split("?")[0], status: 0, ok: false });
      }
    }

    return NextResponse.json(
      { ok: true, results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message.slice(0, 120) : "probe_failed",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
