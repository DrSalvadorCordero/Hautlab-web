import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttendanceAccess } from "@/lib/attendance-access";
import { AttendanceDatabaseError, correctAttendanceShift } from "@/lib/attendance-db";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const correctionSchema = z
  .object({
    shiftId: z.string().uuid(),
    targetUserId: z.string().min(1).max(255),
    correctedCheckInAt: z.string().datetime().nullable(),
    correctedCheckOutAt: z.string().datetime().nullable(),
    reverse: z.boolean().default(false),
    reason: z.string().trim().min(5).max(500)
  })
  .refine(
    (value) => value.reverse || value.correctedCheckInAt || value.correctedCheckOutAt,
    "A correction or reversal is required"
  )
  .refine(
    (value) =>
      !value.correctedCheckInAt ||
      !value.correctedCheckOutAt ||
      Date.parse(value.correctedCheckOutAt) > Date.parse(value.correctedCheckInAt),
    "Check-out must be after check-in"
  );

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

export async function POST(request: Request) {
  const access = await getAttendanceAccess();
  if (!access.canManage || !access.userId || !access.email) {
    return json({ error: "forbidden" }, { status: 403 });
  }
  if (!isSameOriginRequest(request)) return json({ error: "invalid_origin" }, { status: 403 });
  if (exceedsContentLength(request, 16 * 1024)) {
    return json({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: z.infer<typeof correctionSchema>;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > 16 * 1024) {
      return json({ error: "payload_too_large" }, { status: 413 });
    }
    payload = correctionSchema.parse(JSON.parse(body));
  } catch {
    return json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const rows = await correctAttendanceShift({
      ...payload,
      actorUserId: access.userId,
      actorEmail: access.email
    });
    return json({ ok: true, shift: rows[0] ?? null });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Attendance correction failed", { reason });
    const status = error instanceof AttendanceDatabaseError && error.status === 404 ? 404 : 502;
    return json({ error: status === 404 ? "shift_not_found" : "correction_failed" }, { status });
  }
}
