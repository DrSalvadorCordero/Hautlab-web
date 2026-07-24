import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttendanceAccess } from "@/lib/attendance-access";
import {
  AttendanceDatabaseError,
  isAttendanceDatabaseConfigured,
  listAttendanceAudits,
  listAttendanceProfiles,
  listAttendanceSchedules,
  listAttendanceShifts,
  punchAttendance,
  registerAttendanceProfile
} from "@/lib/attendance-db";
import { buildAttendanceReport } from "@/lib/attendance-report";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const punchSchema = z.object({
  action: z.enum(["check_in", "check_out"])
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function databaseFailure(error: unknown) {
  const reason = error instanceof Error ? error.message : "unknown";
  console.error("Attendance database request failed", { reason });

  if (error instanceof AttendanceDatabaseError) {
    if (error.message.includes("attendance_shift_already_open")) {
      return noStoreJson({ error: "shift_already_open" }, { status: 409 });
    }
    if (error.message.includes("attendance_no_open_shift")) {
      return noStoreJson({ error: "no_open_shift" }, { status: 409 });
    }
    if (error.code === "database_not_configured") {
      return noStoreJson({ error: "database_not_configured", setupRequired: true }, { status: 503 });
    }
  }

  return noStoreJson({ error: "attendance_unavailable" }, { status: 502 });
}

async function parseJson(request: Request) {
  if (exceedsContentLength(request, 8 * 1024)) throw new Error("payload_too_large");
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 8 * 1024) throw new Error("payload_too_large");
  return JSON.parse(body) as unknown;
}

function dateRange(request: Request) {
  const url = new URL(request.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const fallbackFrom = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const from = fromParam && !Number.isNaN(Date.parse(fromParam)) ? new Date(fromParam).toISOString() : fallbackFrom;
  const to = toParam && !Number.isNaN(Date.parse(toParam)) ? new Date(toParam).toISOString() : undefined;
  return { from, to };
}

export async function GET(request: Request) {
  const access = await getAttendanceAccess();
  if (!access.allowed || !access.userId || !access.email) {
    return noStoreJson({ error: "unauthorized" }, { status: 401 });
  }

  if (!isAttendanceDatabaseConfigured()) {
    return noStoreJson(
      {
        error: "database_not_configured",
        setupRequired: true,
        canManage: access.canManage,
        requiredVariables: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
      },
      { status: 503 }
    );
  }

  try {
    const role = access.canManage ? "manager" : "employee";
    const registered = await registerAttendanceProfile({
      userId: access.userId,
      email: access.email,
      displayName: access.displayName,
      role
    });
    const { from, to } = dateRange(request);
    const [profiles, schedules, shifts, audits] = await Promise.all([
      access.canManage ? listAttendanceProfiles() : Promise.resolve(registered),
      listAttendanceSchedules(access.canManage ? undefined : access.userId),
      listAttendanceShifts({
        userId: access.canManage ? undefined : access.userId,
        from,
        to,
        limit: access.canManage ? 1500 : 500
      }),
      access.canManage ? listAttendanceAudits({ limit: 100 }) : Promise.resolve([])
    ]);
    const report = buildAttendanceReport({ shifts, profiles, schedules });

    return noStoreJson({
      canManage: access.canManage,
      currentUser: {
        userId: access.userId,
        email: access.email,
        displayName: access.displayName,
        role
      },
      profiles,
      schedules,
      report,
      audits,
      timeZone: "America/Merida"
    });
  } catch (error) {
    return databaseFailure(error);
  }
}

export async function POST(request: Request) {
  const access = await getAttendanceAccess();
  if (!access.canPunch || !access.userId || !access.email) {
    return noStoreJson({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  let parsed: z.infer<typeof punchSchema>;
  try {
    parsed = punchSchema.parse(await parseJson(request));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "invalid_json";
    return noStoreJson({ error: reason === "payload_too_large" ? reason : "invalid_payload" }, { status: 400 });
  }

  try {
    const rows = await punchAttendance({
      userId: access.userId,
      email: access.email,
      displayName: access.displayName,
      role: access.canManage ? "manager" : "employee",
      action: parsed.action
    });
    return noStoreJson({ ok: true, shift: rows[0] ?? null });
  } catch (error) {
    return databaseFailure(error);
  }
}
