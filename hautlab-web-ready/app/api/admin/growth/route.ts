import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";
import {
  getGrowthOsSnapshot,
  GrowthOsDatabaseError,
  isGrowthOsConfigured
} from "@/lib/growth-os-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function normalizeDays(value: string | null) {
  const candidate = Number(value ?? 30);
  return [7, 30, 90].includes(candidate) ? candidate : 30;
}

export async function GET(request: Request) {
  const access = await getAdminAccess();
  const canManage = Boolean(access.allowed && (access.isOwner || access.organizationRole === "org:admin"));
  if (!canManage) return json({ error: "unauthorized" }, { status: 401 });
  if (!isGrowthOsConfigured()) return json({ error: "database_not_configured" }, { status: 503 });

  const days = normalizeDays(new URL(request.url).searchParams.get("days"));
  try {
    return json(await getGrowthOsSnapshot(days));
  } catch (error) {
    console.error("Growth OS database request failed", {
      reason: error instanceof Error ? error.message : "unknown"
    });
    return json(
      { error: "growth_os_unavailable" },
      { status: error instanceof GrowthOsDatabaseError ? error.status : 502 }
    );
  }
}
