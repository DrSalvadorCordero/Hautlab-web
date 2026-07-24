import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttendanceAccess } from "@/lib/attendance-access";
import { replaceAttendanceSchedule } from "@/lib/attendance-db";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clockSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  .nullable();

const scheduleSchema = z.object({
  targetUserId: z.string().min(1).max(255),
  reason: z.string().trim().min(5).max(500),
  schedule: z
    .array(
      z
        .object({
          weekday: z.number().int().min(0).max(6),
          active: z.boolean(),
          scheduledStart: clockSchema,
          scheduledEnd: clockSchema,
          graceMinutes: z.number().int().min(0).max(180)
        })
        .refine(
          (value) =>
            !value.active ||
            (Boolean(value.scheduledStart) &&
              Boolean(value.scheduledEnd) &&
              value.scheduledEnd! > value.scheduledStart!),
          "Active days require a valid start and end"
        )
    )
    .length(7)
    .refine((items) => new Set(items.map((item) => item.weekday)).size === 7, "Weekdays must be unique")
});

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

export async function PUT(request: Request) {
  const access = await getAttendanceAccess();
  if (!access.canManage || !access.userId || !access.email) {
    return json({ error: "forbidden" }, { status: 403 });
  }
  if (!isSameOriginRequest(request)) return json({ error: "invalid_origin" }, { status: 403 });
  if (exceedsContentLength(request, 32 * 1024)) {
    return json({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: z.infer<typeof scheduleSchema>;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > 32 * 1024) {
      return json({ error: "payload_too_large" }, { status: 413 });
    }
    payload = scheduleSchema.parse(JSON.parse(body));
  } catch {
    return json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const schedule = await replaceAttendanceSchedule({
      ...payload,
      actorUserId: access.userId,
      actorEmail: access.email
    });
    return json({ ok: true, schedule });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Attendance schedule update failed", { reason });
    return json({ error: "schedule_update_failed" }, { status: 502 });
  }
}
