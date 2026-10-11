// Server-side, read-only operational check. Never retrieve patient names,
// message bodies, phone numbers or clinical information for a health probe.
export type WhatsAppOperationalSignals = {
  globalMode: string;
  emergencyStop: boolean;
  overdueAutomaticConversations: number;
  recentFailedOutbound: number;
  recentFailedNotifications: number;
};

export function classifyWhatsAppOperationalSignals(signals: WhatsAppOperationalSignals): {
  status: "healthy" | "degraded";
  detail: string;
} {
  if (signals.emergencyStop) {
    return { status: "degraded", detail: "automation_emergency_stop_active" };
  }
  if (signals.globalMode !== "automatic") {
    return { status: "degraded", detail: "automation_not_in_automatic_mode" };
  }
  if (signals.recentFailedOutbound >= 2) {
    return { status: "degraded", detail: "multiple_recent_outbound_failures" };
  }
  if (signals.recentFailedNotifications >= 2) {
    return { status: "degraded", detail: "multiple_recent_operator_alert_failures" };
  }
  if (signals.overdueAutomaticConversations > 0) {
    return { status: "degraded", detail: "automatic_conversation_overdue" };
  }
  // This does NOT prove Meta delivery or end-to-end booking.
  return { status: "healthy", detail: "no_recent_operational_anomalies_detected" };
}

type ConversationStatus = {
  last_patient_message_at: string | null;
  last_team_message_at: string | null;
  bot_paused: boolean | null;
  ai_mode: string | null;
  handoff_status: string | null;
  clinical_risk: boolean | null;
  closed_at: string | null;
};
type SettingsStatus = { global_mode: string; emergency_stop: boolean };

export function countOverdueAutomaticConversations(conversations: ConversationStatus[], now: number): number {
  return conversations.filter((row) => {
    if (row.closed_at || row.clinical_risk || row.bot_paused) return false;
    if (row.ai_mode !== "inherit" && row.ai_mode !== "automatic") return false;
    if (row.handoff_status && row.handoff_status !== "none") return false;
    const patientAt = Date.parse(row.last_patient_message_at ?? "");
    const teamAt = Date.parse(row.last_team_message_at ?? "");
    return Number.isFinite(patientAt) &&
      patientAt < now - 15 * 60_000 &&
      (!Number.isFinite(teamAt) || teamAt < patientAt);
  }).length;
}

// Only fixed labels and numeric HTTP status are safe for operational logs.
// Never attach response bodies, URLs, headers or raw exception messages.
export class WhatsAppProbeReadError extends Error {
  readonly resource: "settings" | "conversations" | "outbound" | "notifications";
  readonly reason: "http" | "timeout" | "network" | "invalid_response";
  readonly httpStatus?: number;
  constructor(resource: WhatsAppProbeReadError["resource"], reason: WhatsAppProbeReadError["reason"], httpStatus?: number) {
    super("whatsapp_probe_store_unavailable");
    this.resource = resource;
    this.reason = reason;
    this.httpStatus = httpStatus;
  }
}

export function safeWhatsAppProbeFailure(error: unknown) {
  if (error instanceof WhatsAppProbeReadError) {
    return { code: error.message, resource: error.resource, reason: error.reason,
      ...(error.httpStatus !== undefined ? { httpStatus: error.httpStatus } : {}) };
  }
  const code = error instanceof Error &&
    ["supabase_configuration_missing", "whatsapp_settings_unavailable"].includes(error.message)
    ? error.message : "whatsapp_operational_probe_unavailable";
  return { code };
}

export async function readWhatsAppOperationalSignals(
  now = Date.now(),
): Promise<WhatsAppOperationalSignals> {
  const baseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!baseUrl || !key) throw new Error("supabase_configuration_missing");
  const validBaseUrl: string = baseUrl;
  const validKey: string = key;

  async function read<T>(resource: WhatsAppProbeReadError["resource"], path: string): Promise<T> {
    try {
      const response = await fetch(validBaseUrl + "/rest/v1/" + path, {
        headers: { apikey: validKey, Authorization: "Bearer " + validKey, Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });
      if (!response.ok) throw new WhatsAppProbeReadError(resource, "http", response.status);
      try {
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("invalid_shape");
        return data as T;
      } catch {
        throw new WhatsAppProbeReadError(resource, "invalid_response");
      }
    } catch (error) {
      if (error instanceof WhatsAppProbeReadError) throw error;
      const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
      throw new WhatsAppProbeReadError(resource, timeout ? "timeout" : "network");
    }
  }

  const from24h = encodeURIComponent(new Date(now - 24 * 60 * 60_000).toISOString());
  const from1h = encodeURIComponent(new Date(now - 60 * 60_000).toISOString());
  const [settings, conversations, failedOutbound, failedNotifications] = await Promise.all([
    read<SettingsStatus[]>("settings", "wa_settings?id=eq.global&select=global_mode,emergency_stop&limit=1"),
    read<ConversationStatus[]>("conversations",
      "wa_conversations?select=last_patient_message_at,last_team_message_at,bot_paused,ai_mode,handoff_status,clinical_risk,closed_at" +
      "&bot_paused=eq.false&last_patient_message_at=gte." + from24h +
      "&order=last_patient_message_at.desc&limit=300",
    ),
    read<Array<{ id: string }>>("outbound",
      "wa_messages?select=id&direction=eq.outbound&status=eq.failed&created_at=gte." + from1h + "&limit=3",
    ),
    read<Array<{ id: string }>>("notifications",
      "wa_notifications?select=id&status=eq.failed&created_at=gte." + from1h + "&limit=3",
    ),
  ]);

  if (!settings[0]) throw new Error("whatsapp_settings_unavailable");
  const overdueAutomaticConversations = countOverdueAutomaticConversations(conversations, now);

  return {
    globalMode: settings[0].global_mode,
    emergencyStop: settings[0].emergency_stop,
    overdueAutomaticConversations,
    recentFailedOutbound: failedOutbound.length,
    recentFailedNotifications: failedNotifications.length,
  };
}
