import { createHmac } from "node:crypto";
import {
  cancelOperatorDigestJobs,
  cancelTelegramJob,
  closeTelegramConversation,
  createTelegramJob,
  getTelegramConversationByRef,
  listRecentTelegramConversations,
  listTelegramOperationalConversations,
  listTelegramJobs,
  recordTelegramWhatsAppReply,
  resumeTelegramConversation,
  searchTelegramConversations,
  takeTelegramConversation,
  type TelegramConversation,
  type TelegramOperatorKey,
} from "@/lib/telegram-db";
import {
  deriveConversationOperationalState,
  isOperationalPendingState,
} from "@/lib/operational-state";
import { getNimboConfig } from "@/lib/server/nimbo";
import { syncKnownNimboSchedules } from "@/lib/server/nimbo-sync";

const TIME_ZONE = "America/Merida";
const LEGACY_SEND_RELAY_URL = "https://nuevo-zzys.vercel.app/api/send-relay";
const RELAY_SECRET_KEY = "relay_hmac_secret";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

async function getRelaySecret() {
  const config = getSupabaseConfig();
  if (!config) return "";

  const response = await fetch(
    `${config.url}/rest/v1/wa_internal_config?key=eq.${encodeURIComponent(
      RELAY_SECRET_KEY,
    )}&select=secret_value&limit=1`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) return "";

  const rows = (await response.json().catch(() => [])) as Array<{
    secret_value?: string;
  }>;
  return rows[0]?.secret_value?.trim() || "";
}

function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = localParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatLocalDateTime(value: string | null) {
  if (!value) return "sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLocalTime(value: string | null) {
  if (!value) return "sin hora";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sin hora";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function cleanPatientName(row: TelegramConversation) {
  return row.profile_name?.trim().slice(0, 80) || "Paciente";
}

function operationalState(row: TelegramConversation) {
  return deriveConversationOperationalState(row);
}

function isActiveBookingPending(row: TelegramConversation) {
  return operationalState(row) === "booking_pending";
}

function isReactivationCandidate(row: TelegramConversation) {
  return operationalState(row) === "reactivation";
}

function operationalLabel(row: TelegramConversation) {
  const state = operationalState(row);
  if (state === "clinical_review") return "revisión clínica";
  if (state === "human_pending") return "en atención";
  if (state === "booking_pending") return "cita por confirmar";
  if (state === "reactivation") return "reactivación comercial";
  if (state === "scheduled") return "cita confirmada";
  if (state === "closed") return "cerrada";
  return row.stage?.replace(/_/g, " ") || "seguimiento";
}

function rowLine(row: TelegramConversation, withTime = false) {
  const time = withTime && row.appointment_datetime
    ? `${formatLocalTime(row.appointment_datetime)} · `
    : "";
  return `${time}#${row.handoff_ref} · ${cleanPatientName(row)} · ${operationalLabel(row)}`;
}

function todayKey() {
  return localDateKey(new Date())!;
}

function isToday(value: string | null) {
  return Boolean(value && localDateKey(value) === todayKey());
}

function isPending(row: TelegramConversation) {
  return isOperationalPendingState(operationalState(row));
}

function mergeConversationRows(
  recent: TelegramConversation[],
  operational: TelegramConversation[],
) {
  const byId = new Map<string, TelegramConversation>();
  for (const row of [...recent, ...operational]) byId.set(row.id, row);
  return Array.from(byId.values());
}

export async function getTelegramTodaySummaryText() {
  await syncKnownNimboSchedules({ limit: 9, staleAfterMinutes: 2 }).catch(() => null);
  const [recentRows, operationalRows] = await Promise.all([
    listRecentTelegramConversations(500),
    listTelegramOperationalConversations(),
  ]);
  const rows = mergeConversationRows(recentRows, operationalRows);
  const today = todayKey();
  const newToday = rows.filter((row) => localDateKey(row.created_at) === today);
  const appointments = rows
    .filter(
      (row) =>
        row.appointment_status === "confirmed" &&
        row.appointment_datetime &&
        localDateKey(row.appointment_datetime) === today,
    )
    .sort(
      (a, b) =>
        Date.parse(a.appointment_datetime ?? "") -
        Date.parse(b.appointment_datetime ?? ""),
    );
  const pending = rows.filter(isPending);
  const reactivation = rows.filter(isReactivationCandidate);
  const clinical = rows.filter(
    (row) => operationalState(row) === "clinical_review",
  );

  const lines = [
    "HAUTLAB · HOY",
    `Nuevos contactos: ${newToday.length}`,
    `Citas confirmadas hoy: ${appointments.length}`,
    `Pendientes operativos: ${pending.length}`,
    `Reactivación comercial: ${reactivation.length}`,
    `Revisión clínica: ${clinical.length}`,
  ];

  if (appointments.length) {
    lines.push("", "Agenda:");
    lines.push(...appointments.slice(0, 8).map((row) => rowLine(row, true)));
    if (appointments.length > 8) {
      lines.push(`+${appointments.length - 8} citas más`);
    }
  }

  const priorityPending = pending
    .sort((a, b) => {
      const score = (row: TelegramConversation) =>
        (row.clinical_risk ? 8 : 0) +
        (row.risk_level === "urgent" ? 8 : 0) +
        (row.handoff_status === "pending" ? 4 : 0) +
        (isActiveBookingPending(row) ? 2 : 0);
      return score(b) - score(a);
    })
    .slice(0, 5);

  if (priorityPending.length) {
    lines.push("", "Prioridad:");
    lines.push(...priorityPending.map((row) => rowLine(row)));
  }

  return lines.join("\n");
}

export async function getTelegramPendingText() {
  const allRows = await listTelegramOperationalConversations();
  const rows = allRows
    .filter(isPending)
    .sort((a, b) => {
      const clinicalA = a.clinical_risk || a.risk_level === "urgent" ? 1 : 0;
      const clinicalB = b.clinical_risk || b.risk_level === "urgent" ? 1 : 0;
      if (clinicalA !== clinicalB) return clinicalB - clinicalA;
      return Date.parse(b.last_message_at ?? b.created_at) -
        Date.parse(a.last_message_at ?? a.created_at);
    });
  const reactivation = allRows.filter(isReactivationCandidate);

  if (!rows.length) {
    return reactivation.length
      ? `No hay pendientes operativos en este momento. Reactivación comercial: ${reactivation.length}.`
      : "No hay pendientes operativos en este momento.";
  }

  const lines = [`PENDIENTES · ${rows.length}`];
  lines.push(...rows.slice(0, 15).map((row) => rowLine(row)));
  if (rows.length > 15) lines.push(`+${rows.length - 15} pendientes más`);
  if (reactivation.length) {
    lines.push("", `Reactivación comercial separada: ${reactivation.length} conversaciones antiguas.`);
  }
  lines.push("", "Usa /paciente <nombre> o /tomar <ref>.");
  return lines.join("\n");
}

export async function getTelegramAgendaText() {
  await syncKnownNimboSchedules({ limit: 9, staleAfterMinutes: 2 }).catch(() => null);
  const rows = (await listRecentTelegramConversations(500))
    .filter(
      (row) =>
        row.appointment_status === "confirmed" &&
        isToday(row.appointment_datetime),
    )
    .sort(
      (a, b) =>
        Date.parse(a.appointment_datetime ?? "") -
        Date.parse(b.appointment_datetime ?? ""),
    );

  if (!rows.length) return "No encuentro citas confirmadas para hoy en el Command Center.";

  return [
    `AGENDA HOY · ${rows.length}`,
    ...rows.map((row) => rowLine(row, true)),
  ].join("\n");
}

export async function getTelegramPatientSearchText(query: string) {
  const matches = await searchTelegramConversations(query, 10);
  if (!matches.length) {
    return `No encontré coincidencias para “${query.trim().slice(0, 80)}”.`;
  }
  return [
    `RESULTADOS · ${matches.length}`,
    ...matches.map((row) => {
      const last = row.last_patient_message_at
        ? ` · último contacto ${formatLocalDateTime(row.last_patient_message_at)}`
        : "";
      return `${rowLine(row)}${last}`;
    }),
    "",
    "Usa el # de referencia para /tomar, /responder, /reanudar o /cerrar.",
  ].join("\n");
}

async function sendWhatsAppText(toRaw: string, body: string) {
  const to = toRaw.replace(/\D/g, "");
  if (!/^[1-9][0-9]{9,14}$/.test(to)) throw new Error("invalid_patient_phone");

  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_TOKEN?.trim() ||
    "";
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    process.env.PHONE_NUMBER_ID?.trim() ||
    "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v25.0";

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
        signal: AbortSignal.timeout(12_000),
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { code?: unknown; type?: string };
    };
    if (!response.ok) {
      console.error("[telegram-command] Meta WhatsApp send failed", {
        status: response.status,
        code: payload.error?.code ?? null,
        type: payload.error?.type ?? null,
      });
      throw new Error(`whatsapp_send_${response.status}`);
    }
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
    signal: AbortSignal.timeout(12_000),
  });

  const relayText = await relayResponse.text();
  let relayPayload: { messageId?: string; error?: string } = {};
  if (relayText) {
    try {
      relayPayload = JSON.parse(relayText) as typeof relayPayload;
    } catch {
      relayPayload = {};
    }
  }

  if (!relayResponse.ok) {
    console.error("[telegram-command] WhatsApp relay send failed", {
      status: relayResponse.status,
      error: relayPayload.error ?? null,
    });
    throw new Error(`whatsapp_relay_${relayResponse.status}`);
  }

  return relayPayload.messageId ?? null;
}

function dateKeyAfterDays(days: number) {
  return localDateKey(new Date(Date.now() + days * 24 * 60 * 60 * 1000))!;
}

function meridaOffsetForDate(dateKey: string) {
  try {
    const probe = new Date(`${dateKey}T12:00:00Z`);
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      timeZoneName: "longOffset",
      hour: "2-digit",
    })
      .formatToParts(probe)
      .find((part) => part.type === "timeZoneName")?.value;
    const value = offset?.replace("GMT", "");
    return value && /^[+-]\d{2}:\d{2}$/.test(value) ? value : "-06:00";
  } catch {
    return "-06:00";
  }
}

function parseRunAt(input: string) {
  const value = input.trim();
  const relative = value.match(/^en\s+(\d{1,4})\s*(m|min|minutos?|h|hr|horas?)$/i);
  if (relative) {
    const amount = Number(relative[1]);
    const multiplier = /^h/i.test(relative[2]) ? 60 : 1;
    const date = new Date(Date.now() + amount * multiplier * 60_000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const local = value.match(
    /^(?:(hoy|mañana)\s+|(\d{4}-\d{2}-\d{2})\s+)([01]?\d|2[0-3]):([0-5]\d)$/i,
  );
  if (!local) return null;

  const dateKey = local[2] || dateKeyAfterDays(local[1]?.toLowerCase() === "mañana" ? 1 : 0);
  const hour = String(Number(local[3])).padStart(2, "0");
  const minute = local[4];
  const parsed = new Date(
    `${dateKey}T${hour}:${minute}:00${meridaOffsetForDate(dateKey)}`,
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function nextClockOccurrence(clock: string) {
  const match = clock.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  const hour = String(Number(match[1])).padStart(2, "0");
  const minute = match[2];
  let dateKey = dateKeyAfterDays(0);
  let candidate = new Date(
    `${dateKey}T${hour}:${minute}:00${meridaOffsetForDate(dateKey)}`,
  );
  if (candidate.getTime() <= Date.now()) {
    dateKey = dateKeyAfterDays(1);
    candidate = new Date(
      `${dateKey}T${hour}:${minute}:00${meridaOffsetForDate(dateKey)}`,
    );
  }
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function helpText() {
  return [
    "HAUTLAB COMMAND CENTER",
    "/hoy — resumen operativo",
    "/pendientes — pendientes prioritarios",
    "/paciente <nombre> — buscar paciente",
    "/agenda — citas confirmadas de hoy",
    "/tomar <ref> — tomar conversación",
    "/reanudar <ref> — devolver conversación al bot",
    "/cerrar <ref> — cerrar conversación",
    "/responder <ref> <mensaje> — enviar por WhatsApp",
    "/programar mañana 09:00 | texto",
    "/programar 2026-09-30 14:30 | texto",
    "/programar en 30m | texto",
    "/digest 08:00 — resumen diario",
    "/digest off — detener resumen diario",
    "/jobs — recordatorios activos",
    "/cancelar <id> — cancelar recordatorio",
    "/estado — salud de integraciones",
  ].join("\n");
}

function parseRef(value: string) {
  const ref = Number(value.replace(/^#/, ""));
  return Number.isInteger(ref) && ref > 0 ? ref : null;
}

export async function getTelegramStatusText(operatorKey?: TelegramOperatorKey) {
  const [nimbo, jobs, relaySecret] = await Promise.all([
    getNimboConfig().catch(() => null),
    listTelegramJobs(operatorKey, 50).catch(() => []),
    getRelaySecret().catch(() => ""),
  ]);
  const whatsappReady = Boolean(
    (process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
      process.env.WHATSAPP_TOKEN?.trim()) &&
      (process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
        process.env.PHONE_NUMBER_ID?.trim()),
  ) || Boolean(relaySecret);
  return [
    "HAUTLAB · ESTADO",
    "Telegram: activo",
    `WhatsApp: ${whatsappReady ? "configurado" : "requiere configuración"}`,
    `Nimbo: ${nimbo?.enabled ? "conectado" : "no conectado"}`,
    `Agenda sync: ${
      nimbo?.last_schedule_sync_at
        ? `${nimbo.last_schedule_sync_status ?? "desconocido"} · ${formatLocalDateTime(nimbo.last_schedule_sync_at)}`
        : "sin ejecución"
    }`,
    `Jobs activos: ${jobs.length}`,
  ].join("\n");
}

export async function handleTelegramOperatorText(
  operatorKey: TelegramOperatorKey,
  chatId: number,
  rawText: string,
) {
  const text = rawText.trim();
  if (!text) return "Escribe /ayuda para ver los comandos.";

  const commandMatch = text.match(/^\/([a-záéíóúñ_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/i);
  const command = commandMatch?.[1]?.toLocaleLowerCase("es-MX");
  const args = commandMatch?.[2]?.trim() ?? "";

  if (command === "start" || command === "ayuda" || command === "help") return helpText();
  if (command === "hoy") return getTelegramTodaySummaryText();
  if (command === "pendientes") return getTelegramPendingText();
  if (command === "agenda") return getTelegramAgendaText();
  if (command === "estado") return getTelegramStatusText(operatorKey);

  if (command === "paciente") {
    if (args.length < 2) return "Uso: /paciente <nombre>";
    return getTelegramPatientSearchText(args);
  }

  if (command === "tomar" || command === "reanudar" || command === "cerrar") {
    const ref = parseRef(args.split(/\s+/)[0] ?? "");
    if (!ref) return `Uso: /${command} <ref>`;

    if (command === "tomar") {
      const row = await takeTelegramConversation(ref, operatorKey);
      return row
        ? `Tomada #${ref} · ${cleanPatientName(row)}. El bot queda pausado.`
        : `No encontré la referencia #${ref}.`;
    }
    if (command === "reanudar") {
      const row = await resumeTelegramConversation(ref);
      return row
        ? `Reanudada #${ref} · ${cleanPatientName(row)}. El bot puede volver a responder.`
        : `No encontré la referencia #${ref}.`;
    }
    const row = await closeTelegramConversation(ref, operatorKey);
    return row
      ? `Cerrada #${ref} · ${cleanPatientName(row)}.`
      : `No encontré la referencia #${ref}.`;
  }

  if (command === "responder") {
    const parts = args.match(/^(#?\d+)\s+([\s\S]{1,4096})$/);
    if (!parts) return "Uso: /responder <ref> <mensaje>";
    const ref = parseRef(parts[1]);
    if (!ref) return "Referencia inválida.";

    const conversation = await getTelegramConversationByRef(ref);
    if (!conversation) return `No encontré la referencia #${ref}.`;

    const message = parts[2].trim();
    const messageId = await sendWhatsAppText(conversation.phone, message);
    await recordTelegramWhatsAppReply({
      conversation,
      operatorKey,
      body: message,
      metaMessageId: messageId,
    });
    return `Enviado por WhatsApp a #${ref} · ${cleanPatientName(conversation)}. El bot queda pausado.`;
  }

  if (command === "programar") {
    const [whenRaw, ...messageParts] = args.split("|");
    const message = messageParts.join("|").trim();
    const runAt = parseRunAt(whenRaw ?? "");
    if (!runAt || !message) {
      return "Uso: /programar mañana 09:00 | texto\nTambién: /programar en 30m | texto";
    }
    if (runAt.getTime() <= Date.now()) return "La hora programada debe estar en el futuro.";

    const job = await createTelegramJob({
      operatorKey,
      chatId,
      kind: "message",
      message,
      nextRunAt: runAt.toISOString(),
      createdBy: `telegram:${operatorKey}`,
    });
    return `Programado · ${formatLocalDateTime(job.next_run_at)} · ID ${job.id}`;
  }

  if (command === "digest") {
    if (args.toLowerCase() === "off") {
      await cancelOperatorDigestJobs(operatorKey);
      return "Resumen diario desactivado.";
    }
    const next = nextClockOccurrence(args);
    if (!next) return "Uso: /digest HH:MM  (ejemplo: /digest 08:00)";
    await cancelOperatorDigestJobs(operatorKey);
    const job = await createTelegramJob({
      operatorKey,
      chatId,
      kind: "daily_digest",
      nextRunAt: next.toISOString(),
      repeatMinutes: 1440,
      createdBy: `telegram:${operatorKey}`,
    });
    return `Resumen diario activo · próxima entrega ${formatLocalDateTime(job.next_run_at)}.`;
  }

  if (command === "jobs") {
    const jobs = await listTelegramJobs(operatorKey, 20);
    if (!jobs.length) return "No tienes recordatorios activos.";
    return [
      `JOBS ACTIVOS · ${jobs.length}`,
      ...jobs.map(
        (job) =>
          `${job.id} · ${job.kind === "daily_digest" ? "digest" : "recordatorio"} · ${formatLocalDateTime(job.next_run_at)}`,
      ),
    ].join("\n");
  }

  if (command === "cancelar") {
    const id = args.trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return "Uso: /cancelar <id>";
    const job = await cancelTelegramJob(id, operatorKey);
    return job ? "Recordatorio cancelado." : "No encontré ese recordatorio activo.";
  }

  if (!command) {
    const normalized = text.toLocaleLowerCase("es-MX");
    if (/\bpendiente(s)?\b/.test(normalized)) return getTelegramPendingText();
    if (/\bagenda\b/.test(normalized)) return getTelegramAgendaText();
    if (/\b(estado|status)\b/.test(normalized)) return getTelegramStatusText(operatorKey);
    if (/\b(hoy|resumen)\b/.test(normalized)) return getTelegramTodaySummaryText();
    const patient = text.match(/^(?:paciente|buscar)\s+(.{2,100})$/i);
    if (patient) return getTelegramPatientSearchText(patient[1]);
  }

  return "No reconocí esa instrucción. Usa /ayuda.";
}
