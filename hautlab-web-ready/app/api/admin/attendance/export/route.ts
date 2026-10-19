import { getAttendanceAccess } from "@/lib/attendance-access";
import {
  listAttendanceProfiles,
  listAttendanceSchedules,
  listAttendanceShifts,
  logAttendanceExport
} from "@/lib/attendance-db";
import { canExportRestrictedOperationalData } from "@/lib/admin-permissions";
import { attendanceCsv, buildAttendanceReport } from "@/lib/attendance-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeDate(value: string | null, fallback: Date) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : fallback;
}

export async function GET(request: Request) {
  const access = await getAttendanceAccess();
  if (!access.userId || !canExportRestrictedOperationalData(access)) {
    return Response.json({ error: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL(request.url);
  const from = safeDate(url.searchParams.get("from"), new Date(Date.now() - 31 * 86_400_000));
  const to = safeDate(url.searchParams.get("to"), new Date(Date.now() + 86_400_000));
  if (to <= from) {
    return Response.json(
      { error: "invalid_range" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const [profiles, schedules, shifts] = await Promise.all([
      listAttendanceProfiles(),
      listAttendanceSchedules(),
      listAttendanceShifts({ from: from.toISOString(), to: to.toISOString(), limit: 2000 })
    ]);
    const csv = `\uFEFF${attendanceCsv(buildAttendanceReport({ shifts, profiles, schedules }))}`;
    await logAttendanceExport({
      actorUserId: access.userId,
      rangeFrom: from.toISOString(),
      rangeTo: to.toISOString(),
      exportedProfileCount: profiles.length,
      exportedShiftCount: shifts.length
    });
    const filename = `asistencia-hautlab-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Attendance export failed", { reason });
    return Response.json(
      { error: "export_failed" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
