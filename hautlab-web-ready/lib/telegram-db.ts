export type TelegramOperatorKey = "doctor" | "karen";

export type TelegramOperatorLink = {
  operator_key: TelegramOperatorKey;
  telegram_user_id: number;
  telegram_chat_id: number;
  telegram_username: string | null;
  telegram_display_name: string | null;
  active: boolean;
  paired_at: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TelegramJob = {
  id: string;
  operator_key: TelegramOperatorKey;
  chat_id: number;
  kind: "message" | "daily_digest";
  message: string | null;
  next_run_at: string;
  repeat_minutes: number | null;
  status: "scheduled" | "processing" | "sent" | "cancelled" | "failed";
  attempts: number;
  last_error: string | null;
  last_sent_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TelegramConversation = {
  id: string;
  handoff_ref: number;
  phone: string;
  profile_name: string | null;
  treatment: string | null;
  stage: string | null;
  assigned_to: string | null;
  priority: string | null;
  clinical_risk: boolean;
  risk_level: string | null;
  last_intent: string | null;
  next_action: string | null;
  handoff_status: string | null;
  bot_paused: boolean;
  last_message_at: string | null;
  last_patient_message_at: string | null;
  appointment_status: string | null;
  appointment_datetime: string | null;
  created_at: string;
};

type AuditStatus = "received" | "processed" | "rejected" | "failed" | "duplicate";

function config() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

export function telegramDatabaseConfigured() {
  return Boolean(config());
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
  const db = config();
  if (!db) throw new Error("supabase_not_configured");

  const response = await fetch(`${db.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers(db.key),
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

  if (!response.ok) {
    console.error("[telegram-db] Supabase request failed", {
      path: path.split("?")[0],
      status: response.status,
    });
    throw new Error(`supabase_${response.status}`);
  }

  return payload as T;
}

export async function getTelegramLinkByUser(
  telegramUserId: number,
): Promise<TelegramOperatorLink | null> {
  const rows = await supabaseJson<TelegramOperatorLink[]>(
    `telegram_operator_links?telegram_user_id=eq.${telegramUserId}&active=eq.true&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getTelegramLinkByOperator(
  operatorKey: TelegramOperatorKey,
): Promise<TelegramOperatorLink | null> {
  const rows = await supabaseJson<TelegramOperatorLink[]>(
    `telegram_operator_links?operator_key=eq.${operatorKey}&active=eq.true&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function pairTelegramOperator(input: {
  operatorKey: TelegramOperatorKey;
  telegramUserId: number;
  telegramChatId: number;
  username?: string | null;
  displayName?: string | null;
}) {
  const now = new Date().toISOString();
  const rows = await supabaseJson<TelegramOperatorLink[]>(
    `telegram_operator_links?on_conflict=operator_key`,
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        operator_key: input.operatorKey,
        telegram_user_id: input.telegramUserId,
        telegram_chat_id: input.telegramChatId,
        telegram_username: input.username?.slice(0, 80) || null,
        telegram_display_name: input.displayName?.slice(0, 160) || null,
        active: true,
        paired_at: now,
        last_seen_at: now,
        updated_at: now,
      }),
    },
  );
  return rows[0] ?? null;
}

export async function touchTelegramLink(
  operatorKey: TelegramOperatorKey,
  chatId: number,
) {
  const now = new Date().toISOString();
  await supabaseJson(
    `telegram_operator_links?operator_key=eq.${operatorKey}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        telegram_chat_id: chatId,
        last_seen_at: now,
        updated_at: now,
      }),
    },
  );
}

export async function createTelegramAudit(input: {
  updateId?: number | null;
  messageId?: number | null;
  telegramUserId?: number | null;
  telegramChatId?: number | null;
  operatorKey?: TelegramOperatorKey | null;
  action: string;
  status?: AuditStatus;
  payload?: Record<string, unknown>;
}) {
  if (typeof input.updateId === "number") {
    const existing = await supabaseJson<Array<{ id: string }>>(
      `telegram_audit_events?update_id=eq.${input.updateId}&select=id&limit=1`,
    );
    if (existing[0]?.id) return null;
  }

  try {
    const rows = await supabaseJson<Array<{ id: string }>>("telegram_audit_events", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        update_id: input.updateId ?? null,
        telegram_message_id: input.messageId ?? null,
        telegram_user_id: input.telegramUserId ?? null,
        telegram_chat_id: input.telegramChatId ?? null,
        operator_key: input.operatorKey ?? null,
        action: input.action.slice(0, 120),
        status: input.status ?? "received",
        payload: input.payload ?? {},
      }),
    });
    return rows[0]?.id ?? null;
  } catch (error) {
    if (error instanceof Error && error.message === "supabase_409") return null;
    throw error;
  }
}

export async function finishTelegramAudit(
  id: string,
  input: {
    status: Exclude<AuditStatus, "received">;
    result?: Record<string, unknown> | null;
    errorCode?: string | null;
  },
) {
  await supabaseJson(`telegram_audit_events?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: input.status,
      result: input.result ?? null,
      error_code: input.errorCode?.slice(0, 160) ?? null,
      processed_at: new Date().toISOString(),
    }),
  });
}

const conversationSelect =
  "id,handoff_ref,phone,profile_name,treatment,stage,assigned_to,priority,clinical_risk,risk_level,last_intent,next_action,handoff_status,bot_paused,last_message_at,last_patient_message_at,appointment_status,appointment_datetime,created_at";

export async function listRecentTelegramConversations(limit = 400) {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  return supabaseJson<TelegramConversation[]>(
    `wa_conversations?select=${conversationSelect}&order=last_message_at.desc.nullslast&limit=${safeLimit}`,
  );
}

export async function getTelegramConversationByRef(ref: number) {
  const rows = await supabaseJson<TelegramConversation[]>(
    `wa_conversations?handoff_ref=eq.${Math.trunc(ref)}&select=${conversationSelect}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function searchTelegramConversations(term: string, limit = 8) {
  const normalized = term.trim().toLocaleLowerCase("es-MX");
  const digits = normalized.replace(/\D/g, "");
  const rows = await listRecentTelegramConversations(500);
  const matches = rows.filter((row) => {
    const name = row.profile_name?.toLocaleLowerCase("es-MX") ?? "";
    const phone = row.phone.replace(/\D/g, "");
    return (
      (normalized.length >= 2 && name.includes(normalized)) ||
      (digits.length >= 4 && phone.endsWith(digits))
    );
  });
  return matches.slice(0, Math.max(1, Math.min(20, Math.trunc(limit))));
}

async function patchConversation(
  id: string,
  body: Record<string, unknown>,
) {
  await supabaseJson(`wa_conversations?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      ...body,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function takeTelegramConversation(
  ref: number,
  operatorKey: TelegramOperatorKey,
) {
  const conversation = await getTelegramConversationByRef(ref);
  if (!conversation) return null;
  const now = new Date().toISOString();
  await patchConversation(conversation.id, {
    assigned_to: operatorKey,
    assigned_at: now,
    assigned_by: `telegram:${operatorKey}`,
    bot_paused: true,
    bot_paused_at: now,
    bot_paused_by: `telegram:${operatorKey}`,
    paused_reason: "human_takeover",
    handoff_status: "assigned",
  });
  return { ...conversation, assigned_to: operatorKey, bot_paused: true };
}

export async function resumeTelegramConversation(ref: number) {
  const conversation = await getTelegramConversationByRef(ref);
  if (!conversation) return null;
  await patchConversation(conversation.id, {
    assigned_to: null,
    bot_paused: false,
    bot_paused_at: null,
    bot_paused_by: "telegram",
    paused_reason: null,
    handoff_status: "resolved",
  });
  return { ...conversation, assigned_to: null, bot_paused: false };
}

export async function closeTelegramConversation(
  ref: number,
  operatorKey: TelegramOperatorKey,
) {
  const conversation = await getTelegramConversationByRef(ref);
  if (!conversation) return null;
  const now = new Date().toISOString();
  await patchConversation(conversation.id, {
    closed_at: now,
    closed_by: `telegram:${operatorKey}`,
    handoff_status: "resolved",
    bot_paused: true,
    bot_paused_at: now,
    bot_paused_by: `telegram:${operatorKey}`,
    paused_reason: "conversation_closed",
  });
  return { ...conversation, handoff_status: "resolved", bot_paused: true };
}

export async function recordTelegramWhatsAppReply(input: {
  conversation: TelegramConversation;
  operatorKey: TelegramOperatorKey;
  body: string;
  metaMessageId: string | null;
}) {
  const now = new Date().toISOString();

  await supabaseJson("wa_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversation.id,
      meta_message_id: input.metaMessageId,
      direction: "outbound",
      sender_type: "human",
      operator_key: input.operatorKey,
      body: input.body,
      message_type: "text",
      status: "sent",
      approved_by: `telegram:${input.operatorKey}`,
      sent_at: now,
    }),
  });

  await patchConversation(input.conversation.id, {
    bot_paused: true,
    bot_paused_at: now,
    bot_paused_by: `telegram:${input.operatorKey}`,
    paused_reason: "manual_reply",
    last_team_message_at: now,
    last_message_at: now,
    assigned_to: input.operatorKey,
    assigned_at: now,
    assigned_by: `telegram:${input.operatorKey}`,
    handoff_status: "assigned",
  });
}

export async function createTelegramJob(input: {
  operatorKey: TelegramOperatorKey;
  chatId: number;
  kind?: "message" | "daily_digest";
  message?: string | null;
  nextRunAt: string;
  repeatMinutes?: number | null;
  createdBy?: string;
}) {
  const rows = await supabaseJson<TelegramJob[]>("telegram_jobs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      operator_key: input.operatorKey,
      chat_id: input.chatId,
      kind: input.kind ?? "message",
      message: input.message?.trim().slice(0, 4096) || null,
      next_run_at: input.nextRunAt,
      repeat_minutes: input.repeatMinutes ?? null,
      status: "scheduled",
      created_by: input.createdBy?.slice(0, 120) || "telegram",
    }),
  });
  return rows[0] ?? null;
}

export async function listTelegramJobs(
  operatorKey?: TelegramOperatorKey,
  limit = 20,
) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const filter = operatorKey ? `&operator_key=eq.${operatorKey}` : "";
  return supabaseJson<TelegramJob[]>(
    `telegram_jobs?select=*&status=in.(scheduled,processing)${filter}&order=next_run_at.asc&limit=${safeLimit}`,
  );
}

export async function cancelTelegramJob(
  id: string,
  operatorKey?: TelegramOperatorKey,
) {
  const operatorFilter = operatorKey ? `&operator_key=eq.${operatorKey}` : "";
  const rows = await supabaseJson<TelegramJob[]>(
    `telegram_jobs?id=eq.${encodeURIComponent(id)}${operatorFilter}&status=in.(scheduled,processing)`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }),
    },
  );
  return rows[0] ?? null;
}

export async function cancelOperatorDigestJobs(operatorKey: TelegramOperatorKey) {
  await supabaseJson(
    `telegram_jobs?operator_key=eq.${operatorKey}&kind=eq.daily_digest&status=eq.scheduled`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }),
    },
  );
}

export async function listDueTelegramJobs(limit = 25) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  return supabaseJson<TelegramJob[]>(
    `telegram_jobs?select=*&status=eq.scheduled&next_run_at=lte.${encodeURIComponent(
      new Date().toISOString(),
    )}&order=next_run_at.asc&limit=${safeLimit}`,
  );
}

export async function claimTelegramJob(id: string) {
  const rows = await supabaseJson<TelegramJob[]>(
    `telegram_jobs?id=eq.${encodeURIComponent(id)}&status=eq.scheduled`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "processing",
        updated_at: new Date().toISOString(),
      }),
    },
  );
  return rows[0] ?? null;
}

export async function completeTelegramJob(
  job: TelegramJob,
  nextRunAt?: string | null,
) {
  const now = new Date().toISOString();
  await supabaseJson(`telegram_jobs?id=eq.${encodeURIComponent(job.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: nextRunAt ? "scheduled" : "sent",
      next_run_at: nextRunAt ?? job.next_run_at,
      attempts: job.attempts + 1,
      last_error: null,
      last_sent_at: now,
      updated_at: now,
    }),
  });
}

export async function failTelegramJob(
  job: TelegramJob,
  errorCode: string,
) {
  const attempts = job.attempts + 1;
  const retry = attempts < 3;
  const nextRunAt = retry
    ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
    : job.next_run_at;

  await supabaseJson(`telegram_jobs?id=eq.${encodeURIComponent(job.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: retry ? "scheduled" : "failed",
      next_run_at: nextRunAt,
      attempts,
      last_error: errorCode.slice(0, 240),
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function listTelegramOperatorLinks() {
  return supabaseJson<TelegramOperatorLink[]>(
    "telegram_operator_links?select=*&order=operator_key.asc",
  );
}
