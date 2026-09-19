import {
  createNimboPatient,
  createNimboSchedule,
  findNimboPatientByPhone,
  getNimboAvailability,
  getNimboConfig,
  isNimboReadyForAutobooking,
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
  bookingDate: string | null;
  bookingTime: string | null;
  bookingDaypart: "none" | "morning" | "afternoon" | "evening" | "any";
  bookingConfirmedChoice: boolean;
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
    "wa_conversations?on_conflict=phone&select=id,phone,profile_name,city,treatment,next_action,ai_mode,bot_paused,first_attribution,nimbo_person_id,nimbo_schedule_id,nimbo_last_offered_slots,nimbo_offer_expires_at,nimbo_pending_slot,nimbo_pending_cause",
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

async function handlePendingNimboIdentity(input: {
  conversation: ConversationRow;
  text: string;
  mode: AiMode;
}): Promise<NimboFlowResult> {
  if (input.conversation.next_action !== "collect_nimbo_identity") {
    return { handled: false };
  }

  const config = await getUsableNimboConfig();
  if (!config) return { handled: false };

  const pendingSlot = input.conversation.nimbo_pending_slot;
  const expiresAt = input.conversation.nimbo_offer_expires_at
    ? Date.parse(input.conversation.nimbo_offer_expires_at)
    : NaN;

  if (
    !pendingSlot ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
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
        "Ese horario ya necesita verificarse nuevamente en Nimbo. ¿Qué día te funciona?",
    };
  }

  if (!looksLikeFullName(input.text)) {
    return {
      handled: true,
      reply: "Necesito tu nombre y apellido tal como quieres que aparezcan en Nimbo.",
    };
  }

  if (input.mode !== "automatic") {
    return {
      handled: true,
      reply:
        "Ya tengo tu nombre. El equipo revisará el registro antes de finalizar la cita.",
      escalate: "karen",
      reasonCode: "nimbo_supervised_identity",
    };
  }

  try {
    let patient = await findNimboPatientByPhone(input.conversation.phone);
    if (!patient) {
      patient = await createNimboPatient({
        phone: input.conversation.phone,
        fullName: normalizeExplicitFullName(input.text),
      });
    }

    const schedule = await createNimboSchedule({
      personId: patient.id,
      startsAt: pendingSlot,
      cause: input.conversation.nimbo_pending_cause ?? input.conversation.treatment ?? "Cita HAUTLAB",
    });

    await updateConversation(input.conversation.id, {
      nimbo_person_id: patient.id,
      nimbo_schedule_id: schedule.id,
      nimbo_pending_slot: null,
      nimbo_pending_cause: null,
      nimbo_last_offered_slots: null,
      nimbo_offer_expires_at: null,
      appointment_status: "confirmed",
      appointment_confirmed_at: new Date().toISOString(),
      appointment_datetime: schedule.startsAt,
      appointment_source: "nimbo_whatsapp",
      stage: "scheduled",
      next_action: "confirm_registered_appointment",
    });

    return {
      handled: true,
      booked: true,
      reply:
        "Listo. Tu cita quedó agendada en Nimbo para " +
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
          "Ese horario acaba de dejar de estar disponible en Nimbo. ¿Qué otro horario te funciona?",
      };
    }

    if (config.portal_url) {
      await updateConversation(input.conversation.id, {
        next_action: "self_booking",
        nimbo_pending_slot: null,
        nimbo_pending_cause: null,
      });
      return {
        handled: true,
        reply:
          "Nimbo necesita completar tu registro antes de reservar. Puedes hacerlo aquí: " +
          config.portal_url,
      };
    }

    return {
      handled: true,
      reply:
        "No pude completar el registro en Nimbo de forma segura. Voy a pasar el caso al equipo para finalizar la cita.",
      escalate: "karen",
      reasonCode: "nimbo_patient_registration_failed",
    };
  }
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
  let eligible = allRequestedSlots.filter((slot) =>
    isSlotForDaypart(slot.startsAt, config.timezone, input.decision.bookingDaypart),
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
      if (input.mode !== "automatic") {
        return {
          handled: true,
          reply:
            "El horario quedó seleccionado en Nimbo y está pendiente de aprobación del equipo.",
          escalate: "karen",
          reasonCode: "nimbo_supervised_booking",
        };
      }

      const existingPatient =
        input.conversation.nimbo_person_id
          ? { id: input.conversation.nimbo_person_id, fullName: null }
          : await findNimboPatientByPhone(input.conversation.phone);

      if (existingPatient) {
        try {
          const schedule = await createNimboSchedule({
            personId: existingPatient.id,
            startsAt: selected.startsAt,
            cause: input.conversation.treatment ?? "Cita HAUTLAB",
          });

          await updateConversation(input.conversation.id, {
            nimbo_person_id: existingPatient.id,
            nimbo_schedule_id: schedule.id,
            nimbo_last_offered_slots: null,
            nimbo_offer_expires_at: null,
            appointment_status: "confirmed",
      appointment_confirmed_at: new Date().toISOString(),
      appointment_datetime: schedule.startsAt,
            appointment_source: "nimbo_whatsapp",
            stage: "scheduled",
            next_action: "confirm_registered_appointment",
          });

          return {
            handled: true,
            booked: true,
            reply:
              "Listo. Tu cita quedó agendada en Nimbo para " +
              formatAppointmentLabel(schedule.startsAt, config.timezone) +
              ".",
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "nimbo_booking_failed";
          if (!message.includes("slot_no_longer_available")) {
            return { handled: false };
          }
        }
      } else {
        await updateConversation(input.conversation.id, {
          next_action: "collect_nimbo_identity",
          nimbo_pending_slot: selected.startsAt,
          nimbo_pending_cause: input.conversation.treatment ?? "Cita HAUTLAB",
          nimbo_offer_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
        });
        return {
          handled: true,
          reply:
            "Para registrarte en Nimbo y finalizar esa cita necesito tu nombre y apellido.",
        };
      }
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
    (day) => day.date > bookingDate && day.slots.length > 0,
  );
  if (nextDay) {
    const options = nextDay.slots.slice(0, 3);
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

async function callTriage(input: {
  origin: string;
  message: string;
  city: string | null;
  conversationId: string;
}): Promise<TriageDecision> {
  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ?? "";
  if (!internalKey) throw new Error("internal_api_key_not_configured");

  const city = input.city === "merida" || input.city === "cdmx" ? input.city : "unknown";
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
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  if (!accessToken || !phoneNumberId) throw new Error("whatsapp_send_not_configured");

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

async function triggerEscalation(input: {
  origin: string;
  conversationId: string;
  operator: OperatorKey;
}) {
  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ?? "";
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

  const pendingNimbo = await handlePendingNimboIdentity({
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
      clinical_risk: false,
      priority: nimboBooking.escalate ? "high" : "normal",
      human_review_reason: nimboBooking.escalate
        ? nimboBooking.reasonCode ?? "nimbo_human_review_required"
        : null,
      last_ai_analysis: {
        intent: decision.intent,
        action: decision.action,
        operator: decision.operator,
        confidence: decision.confidence,
        reasonCode: decision.reasonCode,
        bookingDate: decision.bookingDate,
        bookingTime: decision.bookingTime,
        bookingDaypart: decision.bookingDaypart,
        bookingConfirmedChoice: decision.bookingConfirmedChoice,
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
    next_action: decision.action,
    clinical_risk: clinicalRisk,
    priority,
    human_review_reason: decision.action === "escalate" ? decision.reasonCode : null,
    last_ai_analysis: {
      intent: decision.intent,
      action: decision.action,
      operator: decision.operator,
      confidence: decision.confidence,
      reasonCode: decision.reasonCode,
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
