import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";
import {
  getStaffSnapshot,
  isStaffPerformanceConfigured,
  listRevenueLedger,
  StaffPerformanceDatabaseError
} from "@/lib/staff-performance-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function normalizedMonth(value: string | null) {
  const fallback = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Merida",
    year: "numeric",
    month: "2-digit"
  }).format(new Date());
  const candidate = value && /^\d{4}-\d{2}$/.test(value) ? value : fallback;
  return `${candidate}-01`;
}

export async function GET(request: Request) {
  const access = await getAdminAccess();
  const canManage = Boolean(access.allowed && (access.isOwner || access.organizationRole === "org:admin"));
  if (!canManage) return json({ error: "unauthorized" }, { status: 401 });
  if (!isStaffPerformanceConfigured()) return json({ error: "database_not_configured" }, { status: 503 });

  const month = normalizedMonth(new URL(request.url).searchParams.get("month"));
  try {
    const [karen, doctor, ledger] = await Promise.all([
      getStaffSnapshot(month, "karen"),
      getStaffSnapshot(month, "doctor"),
      listRevenueLedger(month)
    ]);
    return json({ month, karen, doctor, ledger });
  } catch (error) {
    console.error("Staff performance database request failed", {
      reason: error instanceof Error ? error.message : "unknown"
    });
    return json(
      { error: "staff_performance_unavailable" },
      { status: error instanceof StaffPerformanceDatabaseError ? error.status : 502 }
    );
  }
}
