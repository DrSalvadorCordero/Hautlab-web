import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.0";

const SEND_RELAY_URL = "https://www.hautlabmx.com/api/whatsapp/send";
const OPERATOR_ALERT_TEMPLATE = "alerta_escalamiento_humano";
const OPERATOR_ALERT_LANGUAGE = "es_MX";
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type Row = Record<string, unknown>;
function out(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
function normPhone(value: unknown) {
  if (typeof value !== "string") return null;
  const d = value.replace(/\D/g, "");
  return /^[1-9][0-9]{9,14}$/.test(d) ? d : null;
}
function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function config(key: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await db.from("wa_internal_config")
      .select("secret_value").eq("key", key).single();
    if (!error) {
      if (!data?.secret_value) throw new Error(`config_missing:${key}`);
      return String(data.secret_value);
    }
    const status = Number((error as { status?: number }).status ?? 0);
    const code = String(error.code ?? "unknown");
    const authError = status === 401 || status === 403 || code === "PGRST301" || code === "42501";
    if (attempt === 0 && (status === 401 || code === "PGRST301")) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      continue;
    }
    throw new Error(`${authError ? "config_auth_failed" : "config_lookup_failed"}:${key}:${code}`);
  }
  throw new Error(`config_lookup_failed:${key}:retry_exhausted`);
}

async function hmacHex(secret: string, text: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(signed)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sendRelay(to: string, body: string) {
  const templateParameter = body.replace(/\s+/g, " ").trim().slice(0, 1800);
  const message = {
    type: "template",
    template: {
      name: OPERATOR_ALERT_TEMPLATE,
      language: { code: OPERATOR_ALERT_LANGUAGE },
      components: [{
        type: "body",
        parameters: [{ type: "text", text: templateParameter }],
      }],
    },
  };
  const rawBody = JSON.stringify({ to, message });
  const signature = await hmacHex(await config("relay_hmac_secret"), rawBody);
  const response = await fetch(SEND_RELAY_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-hautlab-relay-signature": `sha256=${signature}` },
    body: rawBody,
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json().catch(() => ({})) as Row;
  if (!response.ok) throw new Error(`relay_failed:${response.status}`);
  const id = typeof payload.messageId === "string" ? payload.messageId : null;
  if (!id) throw new Error("relay_message_id_missing");
  return id;
}
function ref(c: Row) {
  const n = Number(c.handoff_ref);
  return Number.isSafeInteger(n) && n > 0 ? `HL-${n}` : "HL-?";
}
async function notify(conversation: Row, operatorKey: string, fallback = false) {
  const { data: operator, error } = await db.from("wa_operators").select("*").eq("operator_key", operatorKey).eq("active", true).maybeSingle();
  if (error) throw new Error(error.message);
  const to = normPhone(operator?.phone_e164);
  if (!operator || operator.alert_enabled === false || !to) return { sent: false, reason: "operator_unavailable" };
  const body = [
    fallback ? "HAUTLAB · caso sin tomar" : "HAUTLAB · seguimiento pendiente",
    `Caso: ${ref(conversation)}`,
    `Prioridad: ${String(conversation.priority ?? "normal")}`,
    `Motivo: ${String(conversation.human_review_reason ?? "Atención humana pendiente").slice(0, 220)}`,
    "",
    fallback ? "El caso sigue sin resolverse después de varias alertas." : "El SLA de atención venció y el caso sigue abierto.",
    `TOMAR ${ref(conversation)}`,
  ].join("\n");
  const { data: notification, error: insertError } = await db.from("wa_notifications").insert({
    conversation_id: conversation.id,
    operator_key: operatorKey,
    kind: "patient_follow_up",
    status: "queued",
    template_name: OPERATOR_ALERT_TEMPLATE,
    payload: {
      body,
      template_language: OPERATOR_ALERT_LANGUAGE,
      template_parameters: [body.replace(/\s+/g, " ").trim().slice(0, 1800)],
      sla: true,
      fallback,
    },
    attempts: 0,
  }).select().single();
  if (insertError) throw new Error(insertError.message);
  try {
    const messageId = await sendRelay(to, body);
    const now = new Date().toISOString();
    await db.from("wa_notifications").update({ status: "sent", meta_message_id: messageId, sent_at: now, attempts: 1, updated_at: now }).eq("id", notification.id);
    const { error: eventError } = await db.from("wa_handoff_events").insert({ conversation_id: conversation.id, event_type: "alert_sent", actor_type: "integration", actor_key: "wa-handoff-sla", metadata: { notificationId: notification.id, sla: true, fallback }, to_assignee: operatorKey });
    if (eventError) console.error("[wa-handoff-sla] alert audit insert failed", { code: eventError.code ?? "unknown" });
    return { sent: true };
  } catch (e) {
    await db.from("wa_notifications").update({ status: "failed", attempts: 1, error_code: "sla_send_failed", error_message: String(e).slice(0, 500), updated_at: new Date().toISOString() }).eq("id", notification.id);
    return { sent: false, reason: "send_failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return out({ error: "method_not_allowed" }, 405);
  try {
    const expected = await config("handoff_sla_secret");
    const supplied = req.headers.get("x-hautlab-sla-secret") ?? "";
    if (!constantTimeEqual(supplied, expected)) return out({ error: "unauthorized" }, 401);

    const { data: cases, error } = await db.from("wa_conversations").select("*")
      .in("handoff_status", ["required", "assigned"])
      .eq("bot_paused", true)
      .not("assigned_to", "is", null)
      .lt("handoff_realert_count", 3)
      .lte("handoff_due_at", new Date().toISOString())
      .order("handoff_due_at", { ascending: true })
      .limit(25);
    if (error) throw new Error(error.message);

    let sent = 0;
    for (const c of (cases ?? []) as Row[]) {
      const assignee = String(c.assigned_to ?? "");
      const attempts = Number(c.handoff_realert_count ?? 0);
      // Atomically claim the due row before any provider send. Concurrent cron runs
      // cannot claim the same exact due timestamp. The two-minute lease expires
      // automatically after an unexpected crash.
      const claimedUntil = new Date(Date.now() + 2 * 60_000).toISOString();
      const { data: claim, error: claimError } = await db.from("wa_conversations")
        .update({ handoff_due_at: claimedUntil })
        .eq("id", c.id)
        .eq("handoff_due_at", String(c.handoff_due_at))
        .eq("handoff_realert_count", attempts)
        .eq("bot_paused", true)
        .in("handoff_status", ["required", "assigned"])
        .select("id");
      if (claimError) throw new Error(`sla_claim_failed:${claimError.code ?? "unknown"}`);
      if (!claim?.length) continue;
      const primary = await notify(c, assignee, false);
      if (primary.sent) sent++;
      if (attempts >= 2 && assignee === "karen") {
        const fallback = await notify(c, "doctor", true);
        if (fallback.sent) sent++;
      }
      // A failed delivery must not exhaust the three successful re-alert opportunities.
      // Retry failures after a short delay, without immediate hot-looping.
      // Bound retries without exhausting the successful-alert budget.
      // The previous attempt timestamp is from the row before this run.
      const previousFailed = c.last_alert_status === "failed";
      const nextMinutes = primary.sent ? (attempts >= 2 ? 30 : 10) : (previousFailed ? 15 : 5);
      const nextDue = new Date(Date.now() + nextMinutes * 60_000).toISOString();
      await db.from("wa_conversations").update({
        handoff_realert_count: primary.sent ? attempts + 1 : attempts,
        handoff_due_at: nextDue,
        priority: attempts >= 1 && c.priority === "normal" ? "high" : c.priority,
        last_alert_at: new Date().toISOString(),
        last_alert_status: primary.sent ? "sent" : "failed",
        updated_at: new Date().toISOString(),
      }).eq("id", c.id).eq("handoff_due_at", claimedUntil);
    }
    return out({ checked: cases?.length ?? 0, sent });
  } catch (e) {
    console.error("[wa-handoff-sla] failed", { message: e instanceof Error ? e.message : "unknown" });
    return out({ error: "internal_error" }, 500);
  }
});
