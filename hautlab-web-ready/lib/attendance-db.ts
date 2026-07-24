export type AttendanceProfileRow = {
  user_id: string;
  email: string;
  display_name: string;
  role: "manager" | "employee";
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceScheduleRow = {
  id: number;
  user_id: string;
  weekday: number;
  scheduled_start: string | null;
  scheduled_end: string | null;
  grace_minutes: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceShiftRow = {
  id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  corrected_check_in_at: string | null;
  corrected_check_out_at: string | null;
  reversed_at: string | null;
  reversal_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceAuditRow = {
  id: string;
  shift_id: string | null;
  target_user_id: string;
  actor_user_id: string;
  actor_email: string;
  action: string;
  reason: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

type DatabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

export class AttendanceDatabaseError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "attendance_database_error") {
    super(message);
    this.name = "AttendanceDatabaseError";
    this.status = status;
    this.code = code;
  }
}

function getConfig(): DatabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

export function isAttendanceDatabaseConfigured() {
  return Boolean(getConfig());
}

async function databaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new AttendanceDatabaseError("Attendance database is not configured", 503, "database_not_configured");
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    const rawMessage = String(record?.message ?? record?.hint ?? payload ?? `HTTP ${response.status}`);
    const code = String(record?.code ?? "attendance_database_request_failed");
    throw new AttendanceDatabaseError(rawMessage, response.status, code);
  }

  return payload as T;
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  return databaseRequest<T>(`rpc/${name}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body)
  });
}

export async function registerAttendanceProfile(input: {
  userId: string;
  email: string;
  displayName: string;
  role: "manager" | "employee";
}) {
  return rpc<AttendanceProfileRow[]>("attendance_register_profile", {
    p_user_id: input.userId,
    p_email: input.email,
    p_display_name: input.displayName,
    p_role: input.role
  });
}

export async function punchAttendance(input: {
  userId: string;
  email: string;
  displayName: string;
  role: "manager" | "employee";
  action: "check_in" | "check_out";
}) {
  return rpc<AttendanceShiftRow[]>("attendance_punch", {
    p_user_id: input.userId,
    p_email: input.email,
    p_display_name: input.displayName,
    p_role: input.role,
    p_action: input.action
  });
}

export async function correctAttendanceShift(input: {
  shiftId: string;
  targetUserId: string;
  actorUserId: string;
  actorEmail: string;
  correctedCheckInAt: string | null;
  correctedCheckOutAt: string | null;
  reverse: boolean;
  reason: string;
}) {
  return rpc<AttendanceShiftRow[]>("attendance_correct_shift", {
    p_shift_id: input.shiftId,
    p_target_user_id: input.targetUserId,
    p_actor_user_id: input.actorUserId,
    p_actor_email: input.actorEmail,
    p_corrected_check_in_at: input.correctedCheckInAt,
    p_corrected_check_out_at: input.correctedCheckOutAt,
    p_reverse: input.reverse,
    p_reason: input.reason
  });
}

export async function replaceAttendanceSchedule(input: {
  targetUserId: string;
  actorUserId: string;
  actorEmail: string;
  reason: string;
  schedule: Array<{
    weekday: number;
    active: boolean;
    scheduledStart: string | null;
    scheduledEnd: string | null;
    graceMinutes: number;
  }>;
}) {
  return rpc<AttendanceScheduleRow[]>("attendance_replace_schedule", {
    p_target_user_id: input.targetUserId,
    p_actor_user_id: input.actorUserId,
    p_actor_email: input.actorEmail,
    p_reason: input.reason,
    p_schedule: input.schedule.map((item) => ({
      weekday: item.weekday,
      active: item.active,
      scheduled_start: item.scheduledStart,
      scheduled_end: item.scheduledEnd,
      grace_minutes: item.graceMinutes
    }))
  });
}

function queryString(entries: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, value);
  });
  return search.toString();
}

export async function listAttendanceProfiles() {
  const query = queryString({
    select: "user_id,email,display_name,role,active,created_at,updated_at",
    order: "display_name.asc"
  });
  return databaseRequest<AttendanceProfileRow[]>(`attendance_profiles?${query}`);
}

export async function listAttendanceSchedules(userId?: string) {
  const query = queryString({
    select: "id,user_id,weekday,scheduled_start,scheduled_end,grace_minutes,active,created_at,updated_at",
    user_id: userId ? `eq.${userId}` : undefined,
    order: "user_id.asc,weekday.asc"
  });
  return databaseRequest<AttendanceScheduleRow[]>(`attendance_schedules?${query}`);
}

export async function listAttendanceShifts(input: {
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  query.set(
    "select",
    "id,user_id,check_in_at,check_out_at,corrected_check_in_at,corrected_check_out_at,reversed_at,reversal_reason,created_at,updated_at"
  );
  if (input.userId) query.set("user_id", `eq.${input.userId}`);
  if (input.from) query.append("check_in_at", `gte.${input.from}`);
  if (input.to) query.append("check_in_at", `lt.${input.to}`);
  query.set("order", "check_in_at.desc");
  query.set("limit", String(Math.min(Math.max(input.limit ?? 500, 1), 2000)));
  return databaseRequest<AttendanceShiftRow[]>(`attendance_shifts?${query.toString()}`);
}

export async function listAttendanceAudits(input: { userId?: string; limit?: number }) {
  const query = queryString({
    select:
      "id,shift_id,target_user_id,actor_user_id,actor_email,action,reason,before_data,after_data,created_at",
    target_user_id: input.userId ? `eq.${input.userId}` : undefined,
    order: "created_at.desc",
    limit: String(Math.min(Math.max(input.limit ?? 100, 1), 500))
  });
  return databaseRequest<AttendanceAuditRow[]>(`attendance_audit?${query}`);
}
