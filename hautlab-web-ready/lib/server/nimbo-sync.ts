import {
  getNimboScheduleSnapshot,
  recordNimboScheduleSyncState,
} from "@/lib/server/nimbo";

type NimboLinkedConversation = {
  id: string;
  nimbo_person_id: number | null;
  nimbo_schedule_id: number | null;
  nimbo_last_synced_at: string | null;
  appointment_status: string | null;
  appointment_datetime: string | null;
  nimbo_schedule_ends_at: string | null;
  human_review_reason: string | null;
  handoff_status: string | null;
  assigned_to: string | null;
  bot_paused: boolean;
};

export type NimboSyncSummary = {
  scanned: number;
  synced: number;
  changed: number;
  cancelled: number;
  completed: number;
  missing: number;
  conflicts: number;
  errors: number;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function headers(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers(config.key),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
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
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return payload as T;
}

function cleanError(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/[^a-zA-Z0-9_.:-]+/g, "_").slice(0, 200)
    : "nimbo_sync_failed";
}

function sameInstant(left: string | null, right: string) {
  if (!left) return false;
  const leftMs = Date.parse(left);
  const rightMs = Date.parse(right);
  return Number.isFinite(leftMs) && Number.isFinite(rightMs) && leftMs === rightMs;
}

function ownSyncReview(reason: string | null) {
  return Boolean(reason?.startsWith("nimbo_schedule_"));
}

async function patchConversation(
  row: NimboLinkedConversation,
  body: Record<string, unknown>,
) {
  await supabaseJson(
    `wa_conversations?id=eq.${encodeURIComponent(row.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        ...body,
        updated_at: new Date().toISOString(),
      }),
    },
  );
}

function clearRecoveredReview(row: NimboLinkedConversation) {
  if (
    !ownSyncReview(row.human_review_reason) ||
    row.assigned_to ||
    row.bot_paused
  ) {
    return {};
  }
  return {
    human_review_reason: null,
    next_action: null,
    ...(row.handoff_status === "pending" ? { handoff_status: "resolved" } : {}),
  };
}

async function markReview(
  row: NimboLinkedConversation,
  status: "missing" | "conflict",
  reason: string,
) {
  const now = new Date().toISOString();
  await patchConversation(row, {
    nimbo_last_synced_at: now,
    nimbo_sync_status: status,
    nimbo_sync_error: reason,
    human_review_reason: reason,
    next_action: "human_review",
    handoff_status: "pending",
  });
}

async function syncOne(row: NimboLinkedConversation) {
  if (!row.nimbo_schedule_id || !row.nimbo_person_id) {
    await markReview(row, "conflict", "nimbo_schedule_identity_incomplete");
    return "conflict" as const;
  }

  let lookup;
  try {
    lookup = await getNimboScheduleSnapshot(row.nimbo_schedule_id);
  } catch (error) {
    const code = cleanError(error);
    if (/snapshot_(id|account)_mismatch|snapshot_invalid/.test(code)) {
      await markReview(row, "conflict", code);
      return "conflict" as const;
    }
    await patchConversation(row, {
      nimbo_last_synced_at: new Date().toISOString(),
      nimbo_sync_status: "error",
      nimbo_sync_error: code,
    });
    return "error" as const;
  }

  if (lookup.status === "missing") {
    await markReview(row, "missing", "nimbo_schedule_missing");
    return "missing" as const;
  }

  const snapshot = lookup.snapshot;
  if (snapshot.personId !== row.nimbo_person_id) {
    await markReview(row, "conflict", "nimbo_schedule_person_mismatch");
    return "conflict" as const;
  }

  const now = new Date().toISOString();

  if (snapshot.lifecycle === "cancelled") {
    await patchConversation(row, {
      appointment_status: "cancelled",
      appointment_datetime: snapshot.startsAt,
      nimbo_schedule_ends_at: snapshot.endsAt,
      nimbo_last_synced_at: now,
      nimbo_sync_status: "cancelled",
      nimbo_sync_error: null,
      human_review_reason: "nimbo_schedule_cancelled_external",
      next_action: "human_review",
      handoff_status: "pending",
    });
    return "cancelled" as const;
  }

  if (snapshot.lifecycle === "completed") {
    await patchConversation(row, {
      appointment_status: "completed",
      appointment_datetime: snapshot.startsAt,
      nimbo_schedule_ends_at: snapshot.endsAt,
      nimbo_last_synced_at: now,
      nimbo_sync_status: "completed",
      nimbo_sync_error: null,
      ...clearRecoveredReview(row),
    });
    return "completed" as const;
  }

  const changed =
    row.appointment_status !== "confirmed" ||
    !sameInstant(row.appointment_datetime, snapshot.startsAt) ||
    !sameInstant(row.nimbo_schedule_ends_at, snapshot.endsAt);

  await patchConversation(row, {
    appointment_status: "confirmed",
    appointment_datetime: snapshot.startsAt,
    nimbo_schedule_ends_at: snapshot.endsAt,
    nimbo_last_synced_at: now,
    nimbo_sync_status: changed ? "changed" : "synced",
    nimbo_sync_error: null,
    ...clearRecoveredReview(row),
  });
  return changed ? ("changed" as const) : ("synced" as const);
}

export async function syncKnownNimboSchedules(input?: {
  limit?: number;
  staleAfterMinutes?: number;
}): Promise<NimboSyncSummary> {
  const limit = Math.max(1, Math.min(30, Math.trunc(input?.limit ?? 6)));
  const fetchLimit = Math.max(100, limit * 4);
  const staleMs =
    Math.max(1, Math.min(60, input?.staleAfterMinutes ?? 4)) * 60_000;
  const recentFloor = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const rows = await supabaseJson<NimboLinkedConversation[]>(
    `wa_conversations?select=id,nimbo_person_id,nimbo_schedule_id,nimbo_last_synced_at,appointment_status,appointment_datetime,nimbo_schedule_ends_at,human_review_reason,handoff_status,assigned_to,bot_paused&nimbo_schedule_id=not.is.null&appointment_status=in.(confirmed,pending_confirmation)&or=(appointment_datetime.is.null,appointment_datetime.gte.${encodeURIComponent(recentFloor)})&order=appointment_datetime.asc.nullsfirst&limit=${fetchLimit}`,
  );

  const due = rows.filter((row) => {
    if (!row.nimbo_last_synced_at) return true;
    const syncedAt = Date.parse(row.nimbo_last_synced_at);
    return !Number.isFinite(syncedAt) || Date.now() - syncedAt >= staleMs;
  }).slice(0, limit);

  const summary: NimboSyncSummary = {
    scanned: due.length,
    synced: 0,
    changed: 0,
    cancelled: 0,
    completed: 0,
    missing: 0,
    conflicts: 0,
    errors: 0,
  };

  const concurrency = 3;
  for (let index = 0; index < due.length; index += concurrency) {
    const results = await Promise.all(due.slice(index, index + concurrency).map(syncOne));
    for (const result of results) {
      if (result === "synced") summary.synced += 1;
      if (result === "changed") summary.changed += 1;
      if (result === "cancelled") summary.cancelled += 1;
      if (result === "completed") summary.completed += 1;
      if (result === "missing") summary.missing += 1;
      if (result === "conflict") summary.conflicts += 1;
      if (result === "error") summary.errors += 1;
    }
  }

  const reviewCount = summary.missing + summary.conflicts;
  const status =
    summary.errors > 0
      ? reviewCount > 0 || summary.synced + summary.changed + summary.cancelled + summary.completed > 0
        ? "partial"
        : "error"
      : reviewCount > 0
        ? "partial"
        : "ok";

  await recordNimboScheduleSyncState({
    status,
    error:
      status === "ok"
        ? null
        : `errors:${summary.errors};missing:${summary.missing};conflicts:${summary.conflicts}`,
  }).catch(() => undefined);

  console.info("[nimbo-sync] completed", {
    scanned: summary.scanned,
    changed: summary.changed,
    cancelled: summary.cancelled,
    completed: summary.completed,
    review: reviewCount,
    errors: summary.errors,
  });

  return summary;
}
