import { createHmac } from "node:crypto";
import {
  createNimboPatient,
  createNimboSchedule,
  findNimboPatientByPhone,
  getNimboAvailability,
  getNimboConfig,
  isNimboReadyForAutobooking,
  updateNimboPatientDemographics,
} from "@/lib/server/nimbo";

type AiMode = "off" | "manual" | "supervised" | "automatic";
type OperatorKey = "doctor" | "karen";

type ConversationRow = {
  id: string;
  phone: string;
  profile_name: string | null;
  city: string | null;
  treatment: string | null;
  next_action: string | null;
  ai_mode: "inherit" | AiMode;
  bot_paused: boolean;
  first_attribution: Record<string, unknown> | null;
  nimbo_person_id: number | null;
  nimbo_schedule_id: number | null;
  nimbo_last_offered_slots: unknown;
  nimbo_offer_expires_at: string | null;
  nimbo_pending_slot: string | null;
  nimbo_pending_cause: string | null;
  booking_full_name: string | null;
  booking_birth_date: string | null;
  booking_email: string | null;
  booking_whatsapp: string | null;
  booking_reason: string | null;
  booking_intake_completed_at: string | null;
};

type SettingsRow = {
  global_mode: AiMode;
  emergency_stop: boolean;
};

type TriageDecision = {
  intent:
    | "information"
    | "pricing"
    | "booking"
    | "follow_up"
    | "clinical"
    | "adverse_event"
    | "complaint"
    | "human_request"
    | "unknown";
  action: "reply" | "clarify" | "escalate";
  operator: OperatorKey | "none";
  confidence: number;
  reply: string;
  reasonCode: string;
  model?: string;
  commercialStage:
    | "exploring"
    | "qualified"
    | "considering"
    | "ready_to_book"
    | "booking"
    | "scheduled"
    | "post_booking"
    | "human_review";
  leadTemperature: "cold" | "warm" | "hot";
  serviceInterest: string | null;
  patientGoal: string | null;
  objection:
    | "none"
    | "price"
    | "trust"
    | "fear"
    | "timing"
    | "comparison"
    | "uncertainty"
    | "other";
  nextBestAction:
    | "answer"
    | "ask_goal"
    | "frame_value"
    | "resolve_objection"
    | "offer_booking"
    | "ask_date"
    | "offer_slots"
    | "collect_intake"
    | "close"
    | "escalate";
  pendingQuestion: string | null;
  conversationSummary: string | null;
  bookingDate: string | null;
  bookingTime: string | null;
  bookingDaypart: "none" | "morning" | "afternoon" | "evening" | "any";
  bookingConfirmedChoice: boolean;
  pricingServices: Array<
    | "dermatology_consultation"
    | "upper_face_botulinum_toxin"
    | "hyaluronic_acid_one_syringe"
  >;
  askedDiscount: boolean;
  paymentMode: "unknown" | "preferential" | "card" | "installments";
  concessionStage: "none" | "package_presented" | "final_presented";
  salesQuote?: {
    publicValue: number;
    offeredPrice: number;
    targetPrice: number;
    lastConcession: number;
    commercialFloor: number;
    closeScore: number;
    offerStage: "package" | "final" | "hold";
  };
};

type IncomingMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WebhookValue = {
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: IncomingMessage[];
};

type WebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: WebhookValue;
    }>;
  }>;
};

const LEGACY_SEND_RELAY_URL = "https://nuevo-zzys.vercel.app/api/send-relay";
const RELAY_SECRET_KEY = "relay_hmac_secret";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
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
    throw new Error(`supabase_error:${response.status}`);
  }
  return payload as T;
}

async function getRelaySecret(): Promise<string> {
  const rows = await supabaseRequest<Array<{ secret_value?: string }>>(
    `wa_internal_config?key=eq.${encodeURIComponent(RELAY_SECRET_KEY)}&select=secret_value&limit=1`,
  );
  return rows[0]?.secret_value?.trim() || "";
}

async function getSettings(): Promise<SettingsRow> {
  const rows = await supabaseRequest<SettingsRow[]>(
    "wa_settings?id=eq.global&select=global_mode,emergency_stop&limit=1",
  );
  return rows[0] ?? { global_mode: "supervised", emergency_stop: false };
}

async function upsertConversation(input: {
  phone: string;
  profileName?: string;
}): Promise<ConversationRow> {
  const now = new Date().toISOString();
  const rows = await supabaseRequest<ConversationRow[]>(
    "wa_conversations?on_conflict=phone&select=id,phone,profile_name,city,treatment,next_action,ai_mode,bot_paused,first_attribution,nimbo_person_id,nimbo_schedule_id,nimbo_last_offered_slots,nimbo_offer_expires_at,nimbo_pending_slot,nimbo_pending_cause,booking_full_name,booking_birth_date,booking_email,booking_whatsapp,booking_reason,booking_intake_completed_at",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        phone: input.phone,
        ...(input.profileName ? { profile_name: input.profileName } : {}),
        last_message_at: now,
        last_patient_message_at: now,
        updated_at: now,
      }),
    },
  );
  const conversation = rows[0];
  if (!conversation) throw new Error("conversation_upsert_failed");
  return conversation;
}

async function insertInboundMessage(input: {
  conversationId: string;
  metaMessageId: string;
  body: string | null;
  messageType: string;
}): Promise<boolean> {
  const rows = await supabaseRequest<Array<{ id: string }>>(
    "wa_messages?on_conflict=meta_message_id&select=id",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        conversation_id: input.conversationId,
        meta_message_id: input.metaMessageId,
        direction: "inbound",
        sender_type: "patient",
        body: input.body,
        message_type: input.messageType,
        status: "received",
      }),
    },
  );
  return rows.length > 0;
}

async function isLatestInboundMessage(
  conversationId: string,
  metaMessageId: string,
) {
  const rows = await supabaseRequest<Array<{ meta_message_id: string | null }>>(
    `wa_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&direction=eq.inbound&select=meta_message_id&order=created_at.desc&limit=1`,
  );
  return rows[0]?.meta_message_id === metaMessageId;
}

function whatsappBurstWindowMs() {
  const configured = Number(process.env.WHATSAPP_BURST_WINDOW_MS ?? "2200");
  if (!Number.isFinite(configured)) return 2200;
  return Math.max(0, Math.min(5000, Math.round(configured)));
}

async function waitForMessageBurstToSettle(
  conversationId: string,
  metaMessageId: string,
) {
  const delay = whatsappBurstWindowMs();
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return isLatestInboundMessage(conversationId, metaMessageId);
}

async function updateConversation(
  conversationId: string,
  body: Record<string, unknown>,
) {
  await supabaseRequest(
    `wa_conversations?id=eq.${encodeURIComponent(conversationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    },
  );
}

async function storeDraft(input: {
  conversationId: string;
  body: string;
  proposedBy: string;
}) {
  await supabaseRequest("wa_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      direction: "outbound",
      sender_type: "ai",
      body: input.body,
      message_type: "text",
      status: "draft",
      proposed_by: input.proposedBy,
    }),
  });
}

async function storeSentMessage(input: {
  conversationId: string;
  body: string;
  metaMessageId: string | null;
  senderType?: "ai" | "system";
  proposedBy?: string;
}) {
  await supabaseRequest("wa_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      meta_message_id: input.metaMessageId,
      direction: "outbound",
      sender_type: input.senderType ?? "ai",
      body: input.body,
      message_type: "text",
      status: "sent",
      proposed_by: input.proposedBy ?? null,
      sent_at: new Date().toISOString(),
    }),
  });
}

function effectiveMode(conversation: ConversationRow, settings: SettingsRow): AiMode {
  if (settings.emergency_stop) return "off";
  return conversation.ai_mode === "inherit"
    ? settings.global_mode
    : conversation.ai_mode;
}

function extractText(message: IncomingMessage): string | null {
  if (message.type === "text") return message.text?.body?.trim() || null;
  if (message.type === "button") return message.button?.text?.trim() || null;
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.title?.trim() ||
      message.interactive?.list_reply?.title?.trim() ||
      null
    );
  }
  return null;
}

type AttributionTouchpoint = {
  code: string;
  landing_url: string;
  current_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  language: string;
  matched_conversation_id: string | null;
  created_at: string;
};

const ATTRIBUTION_REFERENCE_PATTERN = /(?:\n|\s)*Ref:\s*(HL-[A-Z0-9]{12})\s*$/i;

function getAttributionReference(text: string | null) {
  if (!text) return null;
  return text.match(ATTRIBUTION_REFERENCE_PATTERN)?.[1]?.toUpperCase() ?? null;
}

function stripAttributionReference(text: string | null) {
  if (!text) return null;
  const cleaned = text.replace(ATTRIBUTION_REFERENCE_PATTERN, "").trim();
  return cleaned || null;
}


function safeAttributionValue(value: unknown, maxLength = 512) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

async function recordConfirmedAppointmentConversion(input: {
  conversationId: string;
  occurredAt: string;
  appointmentSource: string;
  nimboScheduleId: number;
}) {
  const rows = await supabaseRequest<
    Array<{ first_attribution: Record<string, unknown> | null }>
  >(
    `wa_conversations?id=eq.${encodeURIComponent(input.conversationId)}&select=first_attribution&limit=1`,
  );
  const attribution = rows[0]?.first_attribution ?? null;

  await supabaseRequest(
    "growth_conversion_events?on_conflict=event_name,nimbo_schedule_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        event_name: "appointment_confirmed",
        conversation_id: input.conversationId,
        occurred_at: input.occurredAt,
        source: safeAttributionValue(attribution?.source, 160),
        medium: safeAttributionValue(attribution?.medium, 160),
        campaign: safeAttributionValue(attribution?.campaign, 256),
        content: safeAttributionValue(attribution?.content, 256),
        term: safeAttributionValue(attribution?.term, 256),
        gclid: safeAttributionValue(attribution?.gclid, 512),
        fbclid: safeAttributionValue(attribution?.fbclid, 512),
        msclkid: safeAttributionValue(attribution?.msclkid, 512),
        appointment_source: input.appointmentSource,
        nimbo_schedule_id: input.nimboScheduleId,
        export_status: attribution?.gclid ? "pending" : "not_applicable",
      }),
    },
  );
}

async function attachAttribution(
  conversation: ConversationRow,
  code: string,
) {
  const rows = await supabaseRequest<AttributionTouchpoint[]>(
    `growth_attribution_touchpoints?code=eq.${encodeURIComponent(code)}&select=code,landing_url,current_url,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,gclid,fbclid,msclkid,language,matched_conversation_id,created_at&limit=1`,
  );
  const touchpoint = rows[0];
  if (!touchpoint) return;
  if (
    touchpoint.matched_conversation_id &&
    touchpoint.matched_conversation_id !== conversation.id
  ) {
    return;
  }

  const now = new Date().toISOString();
  if (!touchpoint.matched_conversation_id) {
    await supabaseRequest(
      `growth_attribution_touchpoints?code=eq.${encodeURIComponent(code)}&matched_conversation_id=is.null`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          matched_conversation_id: conversation.id,
          matched_at: now,
        }),
      },
    );
  }

  const snapshot = {
    code: touchpoint.code,
    source: touchpoint.utm_source,
    medium: touchpoint.utm_medium,
    campaign: touchpoint.utm_campaign,
    content: touchpoint.utm_content,
    term: touchpoint.utm_term,
    landing_url: touchpoint.landing_url,
    current_url: touchpoint.current_url,
    referrer: touchpoint.referrer,
    gclid: touchpoint.gclid,
    fbclid: touchpoint.fbclid,
    msclkid: touchpoint.msclkid,
    language: touchpoint.language,
    click_at: touchpoint.created_at,
  };

  await updateConversation(conversation.id, {
    ...(conversation.first_attribution
      ? {}
      : { first_attribution: snapshot, first_attributed_at: now }),
    last_attribution: snapshot,
    last_attributed_at: now,
  });
}


type NimboFlowResult =
  | { handled: false }
  | {
      handled: true;
      reply: string;
      escalate?: OperatorKey;
      reasonCode?: string;
      booked?: boolean;
    };

function addDays(date: string, days: number) {
  const value = new Date(date + "T12:00:00Z");
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function localClock(startsAt: string, timeZone: string) {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  return hour && minute ? hour + ":" + minute : null;
}

function formatDateLabel(date: string, timeZone: string) {
  const value = new Date(date + "T12:00:00Z");
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(value);
}

function formatAppointmentLabel(startsAt: string, timeZone: string) {
  const value = new Date(startsAt);
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function isBeyondMinimumLead(startsAt: string, minLeadMinutes: number) {
  const startsAtMs = Date.parse(startsAt);
  if (!Number.isFinite(startsAtMs)) return false;
  const leadMs = Math.max(0, minLeadMinutes) * 60_000;
  return startsAtMs >= Date.now() + leadMs;
}

function isSlotForDaypart(
  startsAt: string,
  timeZone: string,
  daypart: TriageDecision["bookingDaypart"],
) {
  if (daypart === "none" || daypart === "any") return true;
  const clock = localClock(startsAt, timeZone);
  if (!clock) return false;
  const hour = Number(clock.slice(0, 2));
  if (daypart === "morning") return hour >= 7 && hour < 12;
  if (daypart === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18 && hour <= 22;
}

function offeredSlotStarts(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return null;
      const startsAt = (item as { startsAt?: unknown }).startsAt;
      return typeof startsAt === "string" ? startsAt : null;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeExplicitFullName(text: string) {
  return text
    .replace(/^\s*(?:me llamo|mi nombre es|soy)\s+/i, "")
    .replace(/[^\p{L}\p{M}'’.\-\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeFullName(text: string) {
  const normalized = normalizeExplicitFullName(text);
  const parts = normalized.split(" ").filter(Boolean);
  return normalized.length >= 5 && normalized.length <= 140 && parts.length >= 2;
}

async function getUsableNimboConfig() {
  try {
    const config = await getNimboConfig();
    return isNimboReadyForAutobooking(config) ? config : null;
  } catch {
    return null;
  }
}

function normalizeBookingBirthDate(text: string) {
  const value = text.trim();
  let year: number;
  let month: number;
  let day: number;

  const iso = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const latam = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (latam) {
    day = Number(latam[1]);
    month = Number(latam[2]);
    year = Number(latam[3]);
  } else {
    return null;
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day ||
    year < 1900 ||
    candidate.getTime() > Date.now()
  ) {
    return null;
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function normalizeBookingEmail(text: string) {
  const value = text.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
    ? value
    : null;
}

function normalizeBookingWhatsapp(text: string) {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 10) return "52" + digits;
  if (/^52\d{10}$/.test(digits)) return digits;
  if (/^521\d{10}$/.test(digits)) return "52" + digits.slice(3);
  if (/^1\d{10}$/.test(digits)) return digits;
  return null;
}

function extractBookingIdentityBundle(text: string) {
  const raw = text.trim();
  const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const dateMatch = raw.match(
    /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/,
  );

  let fullName: string | null = null;
  const segments = raw.split(/[\n\r;]+/).map((item) => item.trim()).filter(Boolean);
  for (const segment of segments) {
    const match = segment.match(
      /^(?:nombre(?:\s+completo)?|name)\s*[:\-]\s*(.+)$/i,
    );
    if (match && looksLikeFullName(match[1])) {
      fullName = normalizeExplicitFullName(match[1]);
      break;
    }
  }

  if (!fullName) {
    let residual = raw;
    if (emailMatch?.[0]) residual = residual.replace(emailMatch[0], " ");
    if (dateMatch?.[0]) residual = residual.replace(dateMatch[0], " ");
    residual = residual
      .replace(
        /\b(?:nombre(?:\s+completo)?|name|fecha(?:\s+de\s+nacimiento)?|nacimiento|correo(?:\s+electr[oó]nico)?|email)\s*[:\-]?/gi,
        " ",
      )
      .replace(/[|,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (looksLikeFullName(residual)) fullName = normalizeExplicitFullName(residual);
  }

  return {
    fullName,
    birthDate: dateMatch?.[0] ? normalizeBookingBirthDate(dateMatch[0]) : null,
    email: emailMatch?.[0] ? normalizeBookingEmail(emailMatch[0]) : null,
  };
}

function isAffirmative(text: string) {
  return /^(?:s[ií]|si|yes|correcto|ese|ese mismo|este|este mismo|confirmo)$/i.test(
    text.trim(),
  );
}

function isNegative(text: string) {
  return /^(?:no|otro|otro n[uú]mero|no es|no,? otro)$/i.test(text.trim());
}

type BookingIntakeAction =
  | "collect_booking_full_name"
  | "collect_booking_birth_date"
  | "collect_booking_email"
  | "confirm_booking_whatsapp"
  | "collect_booking_whatsapp_number"
  | "collect_booking_reason";

function nextBookingIntakeAction(
  conversation: ConversationRow,
): BookingIntakeAction | null {
  if (!conversation.booking_full_name) return "collect_booking_full_name";
  if (!conversation.booking_birth_date) return "collect_booking_birth_date";
  if (!conversation.booking_email) return "collect_booking_email";
  if (!conversation.booking_whatsapp) return "confirm_booking_whatsapp";
  if (!conversation.booking_reason && !conversation.treatment) {
    return "collect_booking_reason";
  }
  return null;
}

function bookingIntakePrompt(action: BookingIntakeAction) {
  if (action === "collect_booking_full_name") {
    return "Para registrar la cita necesito nombre completo, fecha de nacimiento (dd/mm/aaaa) y correo. Puedes enviarme los tres en un solo mensaje; usaré este mismo número como WhatsApp de contacto.";
  }
  if (action === "collect_booking_birth_date") {
    return "¿Cuál es tu fecha de nacimiento? Escríbela como dd/mm/aaaa.";
  }
  if (action === "collect_booking_email") {
    return "¿Qué correo electrónico usamos para tu registro?";
  }
  if (action === "confirm_booking_whatsapp") {
    return "¿Este mismo número es tu WhatsApp de contacto?";
  }
  if (action === "collect_booking_whatsapp_number") {
    return "Escríbeme el número de WhatsApp que quieres dejar como contacto.";
  }
  return "¿Cuál es el motivo de consulta?";
}

async function finalizeBookingIntake(input: {
  conversation: ConversationRow;
  mode: AiMode;
  pendingSlot: string;
  fullName: string;
  birthDate: string;
  email: string;
  whatsapp: string;
  reason: string;
}): Promise<NimboFlowResult> {
  const config = await getUsableNimboConfig();
  if (!config) return { handled: false };

  if (!isBeyondMinimumLead(input.pendingSlot, config.booking_min_lead_minutes)) {
    await updateConversation(input.conversation.id, {
      next_action: "ask_date",
      nimbo_pending_slot: null,
      nimbo_pending_cause: null,
      nimbo_last_offered_slots: null,
      nimbo_offer_expires_at: null,
    });
    return {
      handled: true,
      reply:
        "Ese horario ya quedó dentro de la ventana mínima de anticipación. ¿Qué otro día u horario te funciona?",
    };
  }

  if (input.mode !== "automatic") {
    await updateConversation(input.conversation.id, {
      booking_full_name: input.fullName,
      booking_birth_date: input.birthDate,
      booking_email: input.email,
      booking_whatsapp: input.whatsapp,
      booking_reason: input.reason,
      booking_intake_completed_at: new Date().toISOString(),
    });
    return {
      handled: true,
      reply:
        "Ya tengo tus datos completos. El equipo revisará el registro antes de finalizar la cita.",
      escalate: "karen",
      reasonCode: "nimbo_supervised_intake",
    };
  }

  try {
    let patient =
      input.conversation.nimbo_person_id
        ? { id: input.conversation.nimbo_person_id, fullName: input.fullName }
        : await findNimboPatientByPhone(input.whatsapp);

    if (!patient && input.whatsapp !== input.conversation.phone) {
      patient = await findNimboPatientByPhone(input.conversation.phone);
    }

    if (!patient) {
      patient = await createNimboPatient({
        phone: input.whatsapp,
        fullName: input.fullName,
        birthDate: input.birthDate,
        email: input.email,
      });
    } else {
      patient = await updateNimboPatientDemographics(patient.id, {
        phone: input.whatsapp,
        fullName: input.fullName,
        birthDate: input.birthDate,
        email: input.email,
      });
    }

    const schedule = await createNimboSchedule({
      personId: patient.id,
      startsAt: input.pendingSlot,
      cause: input.reason,
    });

    const confirmedAt = new Date().toISOString();

    await updateConversation(input.conversation.id, {
      booking_full_name: input.fullName,
      booking_birth_date: input.birthDate,
      booking_email: input.email,
      booking_whatsapp: input.whatsapp,
      booking_reason: input.reason,
      booking_intake_completed_at: confirmedAt,
      nimbo_person_id: patient.id,
      nimbo_schedule_id: schedule.id,
      nimbo_pending_slot: null,
      nimbo_pending_cause: null,
      nimbo_last_offered_slots: null,
      nimbo_offer_expires_at: null,
      appointment_status: "confirmed",
      appointment_confirmed_at: confirmedAt,
      appointment_datetime: schedule.startsAt,
      appointment_source: "nimbo_whatsapp",
      stage: "scheduled",
      next_action: "confirm_registered_appointment",
    });

    try {
      await recordConfirmedAppointmentConversion({
        conversationId: input.conversation.id,
        occurredAt: confirmedAt,
        appointmentSource: "nimbo_whatsapp",
        nimboScheduleId: schedule.id,
      });
    } catch (error) {
      console.error(
        "growth_conversion_event_failed",
        error instanceof Error ? error.message : "unknown_error",
      );
    }

    return {
      handled: true,
      booked: true,
      reply:
        "Listo. Tu cita quedó agendada para " +
        formatAppointmentLabel(schedule.startsAt, config.timezone) +
        ".",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "nimbo_booking_failed";
    if (message.includes("slot_no_longer_available")) {
      await updateConversation(input.conversation.id, {
        next_action: "ask_date",
        nimbo_pending_slot: null,
        nimbo_pending_cause: null,
        nimbo_last_offered_slots: null,
        nimbo_offer_expires_at: null,
      });
      return {
        handled: true,
        reply:
          "Ese horario acaba de dejar de estar disponible. ¿Qué otro horario te funciona?",
      };
    }

    return {
      handled: true,
      reply:
        "Ya tengo tus datos, pero no pude finalizar el registro de forma segura. Voy a pasar el caso al equipo.",
      escalate: "karen",
      reasonCode: "nimbo_patient_registration_failed",
    };
  }
}

async function beginBookingIntake(input: {
  conversation: ConversationRow;
  selectedSlot: string;
  mode: AiMode;
}): Promise<NimboFlowResult> {
  const reason =
    input.conversation.booking_reason ??
    input.conversation.treatment ??
    input.conversation.nimbo_pending_cause ??
    null;

  const pendingConversation: ConversationRow = {
    ...input.conversation,
    nimbo_pending_slot: input.selectedSlot,
    booking_reason: reason,
    booking_whatsapp:
      input.conversation.booking_whatsapp ?? input.conversation.phone,
  };

  const action = nextBookingIntakeAction(pendingConversation);

  await updateConversation(input.conversation.id, {
    nimbo_pending_slot: input.selectedSlot,
    nimbo_pending_cause: reason ?? "Cita HAUTLAB",
    nimbo_offer_expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
    booking_reason: reason,
    booking_whatsapp: pendingConversation.booking_whatsapp,
    next_action: action ?? "finalize_booking_intake",
  });

  if (action) {
    return { handled: true, reply: bookingIntakePrompt(action) };
  }

  return finalizeBookingIntake({
    conversation: pendingConversation,
    mode: input.mode,
    pendingSlot: input.selectedSlot,
    fullName: pendingConversation.booking_full_name!,
    birthDate: pendingConversation.booking_birth_date!,
    email: pendingConversation.booking_email!,
    whatsapp: pendingConversation.booking_whatsapp!,
    reason: reason!,
  });
}

async function handlePendingBookingIntake(input: {
  conversation: ConversationRow;
  text: string;
  mode: AiMode;
}): Promise<NimboFlowResult> {
  const action = input.conversation.next_action as BookingIntakeAction | null;
  const validActions = new Set<BookingIntakeAction>([
    "collect_booking_full_name",
    "collect_booking_birth_date",
    "collect_booking_email",
    "confirm_booking_whatsapp",
    "collect_booking_whatsapp_number",
    "collect_booking_reason",
  ]);
  if (!action || !validActions.has(action)) return { handled: false };

  const config = await getUsableNimboConfig();
  if (!config) return { handled: false };

  const pendingSlot = input.conversation.nimbo_pending_slot;
  const expiresAt = input.conversation.nimbo_offer_expires_at
    ? Date.parse(input.conversation.nimbo_offer_expires_at)
    : NaN;

  if (
    !pendingSlot ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now() ||
    !isBeyondMinimumLead(pendingSlot, config.booking_min_lead_minutes)
  ) {
    await updateConversation(input.conversation.id, {
      next_action: "ask_date",
      nimbo_pending_slot: null,
      nimbo_pending_cause: null,
      nimbo_last_offered_slots: null,
      nimbo_offer_expires_at: null,
    });
    return {
      handled: true,
      reply:
        "Ese horario necesita revisarse nuevamente. ¿Qué otro día u horario te funciona?",
    };
  }

  const patch: Record<string, unknown> = {
    nimbo_offer_expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
  const updated: ConversationRow = { ...input.conversation };
  const identity = extractBookingIdentityBundle(input.text);

  if (!updated.booking_full_name && identity.fullName) {
    patch.booking_full_name = identity.fullName;
    updated.booking_full_name = identity.fullName;
  }
  if (!updated.booking_birth_date && identity.birthDate) {
    patch.booking_birth_date = identity.birthDate;
    updated.booking_birth_date = identity.birthDate;
  }
  if (!updated.booking_email && identity.email) {
    patch.booking_email = identity.email;
    updated.booking_email = identity.email;
  }

  if (action === "collect_booking_full_name" && !updated.booking_full_name) {
    if (!looksLikeFullName(input.text)) {
      await updateConversation(input.conversation.id, patch);
      return {
        handled: true,
        reply: "Necesito tu nombre completo, incluyendo al menos nombre y apellido.",
      };
    }
    const value = normalizeExplicitFullName(input.text);
    patch.booking_full_name = value;
    updated.booking_full_name = value;
  } else if (action === "collect_booking_birth_date" && !updated.booking_birth_date) {
    const value = normalizeBookingBirthDate(input.text);
    if (!value) {
      await updateConversation(input.conversation.id, patch);
      return {
        handled: true,
        reply: "No pude leer la fecha. Escríbela como dd/mm/aaaa.",
      };
    }
    patch.booking_birth_date = value;
    updated.booking_birth_date = value;
  } else if (action === "collect_booking_email" && !updated.booking_email) {
    const value = normalizeBookingEmail(input.text);
    if (!value) {
      await updateConversation(input.conversation.id, patch);
      return {
        handled: true,
        reply: "Ese correo no parece válido. Escríbelo de nuevo, por favor.",
      };
    }
    patch.booking_email = value;
    updated.booking_email = value;
  } else if (action === "confirm_booking_whatsapp") {
    if (isAffirmative(input.text)) {
      patch.booking_whatsapp = input.conversation.phone;
      updated.booking_whatsapp = input.conversation.phone;
    } else if (isNegative(input.text)) {
      await updateConversation(input.conversation.id, {
        next_action: "collect_booking_whatsapp_number",
      });
      return {
        handled: true,
        reply: bookingIntakePrompt("collect_booking_whatsapp_number"),
      };
    } else {
      return {
        handled: true,
        reply: "Solo necesito confirmar: ¿este mismo número es tu WhatsApp de contacto?",
      };
    }
  } else if (action === "collect_booking_whatsapp_number") {
    const value = normalizeBookingWhatsapp(input.text);
    if (!value) {
      return {
        handled: true,
        reply: "No pude validar ese número. Escríbelo con 10 dígitos o con lada internacional.",
      };
    }
    patch.booking_whatsapp = value;
    updated.booking_whatsapp = value;
  } else if (action === "collect_booking_reason") {
    const value = input.text.trim().slice(0, 300);
    if (value.length < 3) {
      return {
        handled: true,
        reply: "Cuéntame brevemente el motivo de consulta.",
      };
    }
    patch.booking_reason = value;
    updated.booking_reason = value;
  }

  if (!updated.booking_reason && updated.treatment) {
    patch.booking_reason = updated.treatment;
    updated.booking_reason = updated.treatment;
  }

  const next = nextBookingIntakeAction(updated);
  if (next) {
    patch.next_action = next;
    await updateConversation(input.conversation.id, patch);
    return { handled: true, reply: bookingIntakePrompt(next) };
  }

  const fullName = updated.booking_full_name!;
  const birthDate = updated.booking_birth_date!;
  const email = updated.booking_email!;
  const whatsapp = updated.booking_whatsapp!;
  const reason = updated.booking_reason!;

  await updateConversation(input.conversation.id, {
    ...patch,
    next_action: "finalize_booking_intake",
    booking_intake_completed_at: new Date().toISOString(),
  });

  return finalizeBookingIntake({
    conversation: updated,
    mode: input.mode,
    pendingSlot,
    fullName,
    birthDate,
    email,
    whatsapp,
    reason,
  });
}

async function handleNimboBooking(input: {
  conversation: ConversationRow;
  decision: TriageDecision;
  text: string;
  mode: AiMode;
}): Promise<NimboFlowResult> {
  if (input.decision.intent !== "booking" || !input.decision.bookingDate) {
    return { handled: false };
  }

  if (
    /\b(online|en línea|en linea|teleconsulta|videollamada|virtual)\b/i.test(
      input.text + " " + (input.conversation.treatment ?? ""),
    )
  ) {
    return { handled: false };
  }

  const config = await getUsableNimboConfig();
  if (!config) return { handled: false };

  const bookingDate = input.decision.bookingDate;
  let days;
  try {
    days = await getNimboAvailability({
      from: bookingDate,
      to: addDays(bookingDate, 7),
    });
  } catch {
    return { handled: false };
  }

  const requestedDay = days.find((day) => day.date === bookingDate);
  const allRequestedSlots = requestedDay?.slots ?? [];
  let eligible = allRequestedSlots.filter(
    (slot) =>
      isSlotForDaypart(
        slot.startsAt,
        config.timezone,
        input.decision.bookingDaypart,
      ) &&
      isBeyondMinimumLead(
        slot.startsAt,
        config.booking_min_lead_minutes,
      ),
  );

  if (input.decision.bookingTime) {
    const exact = eligible.filter(
      (slot) =>
        localClock(slot.startsAt, config.timezone) === input.decision.bookingTime,
    );
    if (exact.length > 0) {
      eligible = [
        ...exact,
        ...eligible.filter((slot) => !exact.includes(slot)),
      ];
    }
  }

  const offeredBefore = offeredSlotStarts(
    input.conversation.nimbo_last_offered_slots,
  );
  const offerStillValid =
    input.conversation.nimbo_offer_expires_at &&
    Date.parse(input.conversation.nimbo_offer_expires_at) > Date.now();

  if (input.decision.bookingConfirmedChoice && offerStillValid) {
    const selected = eligible.find((slot) => {
      if (!offeredBefore.includes(slot.startsAt)) return false;
      if (!input.decision.bookingTime) return offeredBefore.length === 1;
      return localClock(slot.startsAt, config.timezone) === input.decision.bookingTime;
    });

    if (selected) {
      return beginBookingIntake({
        conversation: input.conversation,
        selectedSlot: selected.startsAt,
        mode: input.mode,
      });
    }
  }

  if (eligible.length > 0) {
    const options = eligible.slice(0, 3);
    await updateConversation(input.conversation.id, {
      nimbo_last_offered_slots: options,
      nimbo_offer_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      next_action: "select_nimbo_slot",
      appointment_date_preference: bookingDate,
    });

    if (
      input.decision.bookingTime &&
      localClock(options[0].startsAt, config.timezone) ===
        input.decision.bookingTime
    ) {
      return {
        handled: true,
        reply:
          "Sí aparece disponible " +
          formatAppointmentLabel(options[0].startsAt, config.timezone) +
          ". ¿Te la reservo?",
      };
    }

    return {
      handled: true,
      reply:
        "Para " +
        formatDateLabel(bookingDate, config.timezone) +
        " tengo " +
        options.map((slot) => slot.label).join(", ") +
        ". ¿Cuál prefieres?",
    };
  }

  const nextDay = days.find(
    (day) =>
      day.date > bookingDate &&
      day.slots.some((slot) =>
        isBeyondMinimumLead(slot.startsAt, config.booking_min_lead_minutes),
      ),
  );
  if (nextDay) {
    const options = nextDay.slots
      .filter((slot) =>
        isBeyondMinimumLead(slot.startsAt, config.booking_min_lead_minutes),
      )
      .slice(0, 3);
    await updateConversation(input.conversation.id, {
      nimbo_last_offered_slots: options,
      nimbo_offer_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      next_action: "select_nimbo_slot",
    });
    return {
      handled: true,
      reply:
        "Ese día no aparece disponible. El siguiente con horarios en Nimbo es " +
        formatDateLabel(nextDay.date, config.timezone) +
        ": " +
        options.map((slot) => slot.label).join(", ") +
        ".",
    };
  }

  if (requestedDay?.available && config.portal_url) {
    return {
      handled: true,
      reply:
        "Nimbo muestra disponibilidad ese día, pero no devolvió horas exactas. Puedes revisar los horarios aquí: " +
        config.portal_url,
    };
  }

  return {
    handled: true,
    reply:
      "Ese día no aparece con horarios disponibles en Nimbo. ¿Qué otro día te funciona?",
  };
}

async function deliverNimboFlow(input: {
  result: NimboFlowResult;
  mode: AiMode;
  conversation: ConversationRow;
  phone: string;
  origin: string;
}) {
  if (!input.result.handled) return false;

  if (input.mode === "supervised") {
    await storeDraft({
      conversationId: input.conversation.id,
      body: input.result.reply,
      proposedBy: "nimbo-scheduler",
    });
  } else if (input.mode === "automatic") {
    const metaMessageId = await sendWhatsAppText(input.phone, input.result.reply);
    await storeSentMessage({
      conversationId: input.conversation.id,
      body: input.result.reply,
      metaMessageId,
      proposedBy: "nimbo-scheduler",
    });
    await updateConversation(input.conversation.id, {
      last_team_message_at: new Date().toISOString(),
    });
  }

  if (input.result.escalate) {
    await updateConversation(input.conversation.id, {
      stage: "human_review",
      priority: "high",
      human_review_reason:
        input.result.reasonCode ?? "nimbo_human_review_required",
      next_action: "human_review",
    });
    await triggerEscalation({
      origin: input.origin,
      conversationId: input.conversation.id,
      operator: input.result.escalate,
    });
  }

  return true;
}

function normalizeCityForTriage(city: string | null) {
  const value = (city ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (value.includes("merida")) return "merida" as const;
  if (value === "cdmx" || value.includes("ciudad de mexico")) {
    return "cdmx" as const;
  }
  return "unknown" as const;
}

async function callTriage(input: {
  origin: string;
  message: string;
  city: string | null;
  conversationId: string;
}): Promise<TriageDecision> {
  const internalKey =
    process.env.HAUTLAB_INTERNAL_API_KEY?.trim() || (await getRelaySecret());
  if (!internalKey) throw new Error("internal_api_key_not_configured");

  const city = normalizeCityForTriage(input.city);
  const response = await fetch(`${input.origin}/api/ai/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-internal-key": internalKey,
    },
    body: JSON.stringify({
      message: input.message,
      city,
      conversationId: input.conversationId,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(18000),
  });

  if (!response.ok) throw new Error(`triage_failed:${response.status}`);
  return (await response.json()) as TriageDecision;
}

async function sendWhatsAppText(to: string, body: string) {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_TOKEN?.trim() ||
    "";
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    process.env.PHONE_NUMBER_ID?.trim() ||
    "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";

  if (accessToken && phoneNumberId) {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body, preview_url: false },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      },
    );

    const text = await response.text();
    let payload: { messages?: Array<{ id?: string }> } = {};
    if (text) {
      try {
        payload = JSON.parse(text) as { messages?: Array<{ id?: string }> };
      } catch {
        payload = {};
      }
    }
    if (!response.ok) throw new Error(`whatsapp_send_failed:${response.status}`);
    return payload.messages?.[0]?.id ?? null;
  }

  const relaySecret = await getRelaySecret();
  if (!relaySecret) throw new Error("whatsapp_send_not_configured");

  const rawBody = JSON.stringify({
    to,
    message: {
      type: "text",
      text: { body, preview_url: false },
    },
  });
  const signature = createHmac("sha256", relaySecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const relayResponse = await fetch(LEGACY_SEND_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-relay-signature": `sha256=${signature}`,
    },
    body: rawBody,
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  const relayText = await relayResponse.text();
  let relayPayload: { messageId?: string } = {};
  if (relayText) {
    try {
      relayPayload = JSON.parse(relayText) as { messageId?: string };
    } catch {
      relayPayload = {};
    }
  }
  if (!relayResponse.ok) {
    throw new Error(`whatsapp_relay_failed:${relayResponse.status}`);
  }
  return relayPayload.messageId ?? null;
}

async function triggerEscalation(input: {
  origin: string;
  conversationId: string;
  operator: OperatorKey;
}) {
  const internalKey =
    process.env.HAUTLAB_INTERNAL_API_KEY?.trim() || (await getRelaySecret());
  if (!internalKey) throw new Error("internal_api_key_not_configured");

  const response = await fetch(`${input.origin}/api/whatsapp/escalate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-internal-key": internalKey,
    },
    body: JSON.stringify({
      conversationId: input.conversationId,
      operator: input.operator,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`escalation_failed:${response.status}`);
}

async function processTextMessage(input: {
  origin: string;
  message: IncomingMessage;
  profileName?: string;
}) {
  const conversation = await upsertConversation({
    phone: input.message.from,
    profileName: input.profileName,
  });

  const rawText = extractText(input.message);
  const attributionCode = getAttributionReference(rawText);
  const text = stripAttributionReference(rawText);
  const isNew = await insertInboundMessage({
    conversationId: conversation.id,
    metaMessageId: input.message.id,
    body: text,
    messageType: input.message.type,
  });
  if (!isNew) return;

  if (attributionCode) {
    await attachAttribution(conversation, attributionCode);
  }

  // Patients often send one thought as several WhatsApp bubbles. Wait briefly
  // and let only the newest inbound bubble trigger a response, so the bot
  // answers the complete thought instead of replying two or three times.
  if (text) {
    const isLatest = await waitForMessageBurstToSettle(
      conversation.id,
      input.message.id,
    );
    if (!isLatest) return;
  }

  const settings = await getSettings();
  const mode = effectiveMode(conversation, settings);
  if (mode === "off" || mode === "manual" || conversation.bot_paused) return;

  // Media and unsupported message types are never interpreted autonomously.
  if (!text) {
    const acknowledgement =
      "Recibí el archivo. Para revisarlo correctamente, voy a pasar la conversación con el Dr. Salvador.";
    await updateConversation(conversation.id, {
      last_intent: "clinical",
      next_action: "escalate",
      clinical_risk: true,
      priority: "high",
      human_review_reason: "media_requires_human_review",
      last_ai_analysis: {
        intent: "clinical",
        action: "escalate",
        operator: "doctor",
        reasonCode: "media_requires_human_review",
      },
    });
    const metaMessageId = await sendWhatsAppText(input.message.from, acknowledgement);
    await storeSentMessage({
      conversationId: conversation.id,
      body: acknowledgement,
      metaMessageId,
      senderType: "system",
    });
    await triggerEscalation({
      origin: input.origin,
      conversationId: conversation.id,
      operator: "doctor",
    });
    return;
  }

  const pendingNimbo = await handlePendingBookingIntake({
    conversation,
    text,
    mode,
  });
  if (
    await deliverNimboFlow({
      result: pendingNimbo,
      mode,
      conversation,
      phone: input.message.from,
      origin: input.origin,
    })
  ) {
    return;
  }

  const decision = await callTriage({
    origin: input.origin,
    message: text,
    city: conversation.city,
    conversationId: conversation.id,
  });

  const nimboBooking = await handleNimboBooking({
    conversation,
    decision,
    text,
    mode,
  });

  if (nimboBooking.handled) {
    await updateConversation(conversation.id, {
      last_intent: "booking",
      stage: nimboBooking.booked ? "scheduled" : "booking",
      clinical_risk: false,
      priority: nimboBooking.escalate ? "high" : "normal",
      human_review_reason: nimboBooking.escalate
        ? nimboBooking.reasonCode ?? "nimbo_human_review_required"
        : null,
      ...(decision.serviceInterest ? { treatment: decision.serviceInterest } : {}),
      ...(decision.patientGoal ? { patient_goal: decision.patientGoal } : {}),
      objection: decision.objection === "none" ? null : decision.objection,
      pending_question: decision.pendingQuestion,
      last_question_asked: decision.pendingQuestion,
      ...(decision.conversationSummary
        ? { conversation_summary: decision.conversationSummary }
        : {}),
      ...(decision.bookingDate
        ? { appointment_date_preference: decision.bookingDate }
        : {}),
      ...(decision.bookingTime
        ? { appointment_time_preference: decision.bookingTime }
        : {}),
      last_ai_analysis: {
        intent: decision.intent,
        action: decision.action,
        operator: decision.operator,
        confidence: decision.confidence,
        reasonCode: decision.reasonCode,
        commercialStage: decision.commercialStage,
        leadTemperature: decision.leadTemperature,
        serviceInterest: decision.serviceInterest,
        patientGoal: decision.patientGoal,
        objection: decision.objection,
        nextBestAction: decision.nextBestAction,
        pendingQuestion: decision.pendingQuestion,
        conversationSummary: decision.conversationSummary,
        bookingDate: decision.bookingDate,
        bookingTime: decision.bookingTime,
        bookingDaypart: decision.bookingDaypart,
        bookingConfirmedChoice: decision.bookingConfirmedChoice,
        pricingServices: decision.pricingServices,
        askedDiscount: decision.askedDiscount,
        paymentMode: decision.paymentMode,
        concessionStage: decision.concessionStage,
        salesQuote: decision.salesQuote ?? null,
        model: decision.model ?? null,
        nimboHandled: true,
      },
    });

    await deliverNimboFlow({
      result: nimboBooking,
      mode,
      conversation,
      phone: input.message.from,
      origin: input.origin,
    });
    return;
  }

  const clinicalRisk =
    decision.intent === "clinical" || decision.intent === "adverse_event";
  const priority = decision.intent === "adverse_event" ? "urgent" : clinicalRisk ? "high" : "normal";

  await updateConversation(conversation.id, {
    last_intent: decision.intent,
    stage: decision.action === "escalate" ? "human_review" : decision.commercialStage,
    next_action: decision.nextBestAction,
    clinical_risk: clinicalRisk,
    priority,
    human_review_reason: decision.action === "escalate" ? decision.reasonCode : null,
    ...(decision.serviceInterest ? { treatment: decision.serviceInterest } : {}),
    ...(decision.patientGoal ? { patient_goal: decision.patientGoal } : {}),
    objection: decision.objection === "none" ? null : decision.objection,
    pending_question: decision.pendingQuestion,
    last_question_asked: decision.pendingQuestion,
    ...(decision.conversationSummary
      ? { conversation_summary: decision.conversationSummary }
      : {}),
    ...(decision.bookingDate
      ? { appointment_date_preference: decision.bookingDate }
      : {}),
    ...(decision.bookingTime
      ? { appointment_time_preference: decision.bookingTime }
      : {}),
    last_ai_analysis: {
      intent: decision.intent,
      action: decision.action,
      operator: decision.operator,
      confidence: decision.confidence,
      reasonCode: decision.reasonCode,
      commercialStage: decision.commercialStage,
      leadTemperature: decision.leadTemperature,
      serviceInterest: decision.serviceInterest,
      patientGoal: decision.patientGoal,
      objection: decision.objection,
      nextBestAction: decision.nextBestAction,
      pendingQuestion: decision.pendingQuestion,
      conversationSummary: decision.conversationSummary,
      bookingDate: decision.bookingDate,
      bookingTime: decision.bookingTime,
      bookingDaypart: decision.bookingDaypart,
      bookingConfirmedChoice: decision.bookingConfirmedChoice,
      pricingServices: decision.pricingServices,
      askedDiscount: decision.askedDiscount,
      paymentMode: decision.paymentMode,
      concessionStage: decision.concessionStage,
      salesQuote: decision.salesQuote ?? null,
      model: decision.model ?? null,
    },
  });

  if (decision.action === "escalate") {
    const operator: OperatorKey = decision.operator === "karen" ? "karen" : "doctor";
    if (decision.reply) {
      const metaMessageId = await sendWhatsAppText(input.message.from, decision.reply);
      await storeSentMessage({
        conversationId: conversation.id,
        body: decision.reply,
        metaMessageId,
        senderType: "system",
        proposedBy: decision.model,
      });
    }
    await triggerEscalation({
      origin: input.origin,
      conversationId: conversation.id,
      operator,
    });
    return;
  }

  if (!decision.reply) return;

  if (mode === "supervised") {
    await storeDraft({
      conversationId: conversation.id,
      body: decision.reply,
      proposedBy: decision.model ?? "hautlab-router",
    });
    return;
  }

  if (mode === "automatic") {
    const metaMessageId = await sendWhatsAppText(input.message.from, decision.reply);
    await storeSentMessage({
      conversationId: conversation.id,
      body: decision.reply,
      metaMessageId,
      proposedBy: decision.model,
    });
    await updateConversation(conversation.id, {
      last_team_message_at: new Date().toISOString(),
    });
  }
}

export async function processWhatsAppWebhook(payload: unknown, origin: string) {
  if (!payload || typeof payload !== "object") return;
  const body = payload as WebhookPayload;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;
      const profileName = value.contacts?.[0]?.profile?.name;

      for (const message of value.messages ?? []) {
        try {
          await processTextMessage({ origin, message, profileName });
        } catch (error) {
          // Never log patient text, phone numbers, names, or media identifiers.
          console.error("[whatsapp-orchestrator] message processing failed", {
            message: error instanceof Error ? error.message : "unknown_error",
            type: message.type,
          });
        }
      }
    }
  }
}
