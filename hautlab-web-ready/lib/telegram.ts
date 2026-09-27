import { timingSafeEqual } from "node:crypto";

export type TelegramBotIdentity = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
}

export function telegramWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "";
}

export function telegramConfigured() {
  return Boolean(botToken());
}

export function safeSecretEqual(candidate: string | null | undefined, expected: string | null | undefined) {
  if (!candidate || !expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function telegramApi<T>(
  method: string,
  body?: Record<string, unknown>,
  timeoutMs = 15_000,
): Promise<T> {
  const token = botToken();
  if (!token) throw new Error("telegram_not_configured");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = (await response.json().catch(() => ({}))) as TelegramApiResponse<T>;
  if (!response.ok || !payload.ok || payload.result === undefined) {
    const code = payload.error_code ?? response.status;
    console.error("[telegram] API request failed", {
      method,
      code,
      description: payload.description?.slice(0, 240) ?? null,
    });
    throw new Error(`telegram_api_${code}`);
  }

  return payload.result;
}

export async function getTelegramBotIdentity() {
  return telegramApi<TelegramBotIdentity>("getMe");
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: { disableNotification?: boolean },
) {
  const normalized = text.trim().slice(0, 4096);
  if (!normalized) throw new Error("telegram_empty_message");

  return telegramApi<{ message_id: number; date: number }>("sendMessage", {
    chat_id: chatId,
    text: normalized,
    disable_web_page_preview: true,
    disable_notification: options?.disableNotification ?? false,
  });
}

export async function setTelegramCommands() {
  return telegramApi<boolean>("setMyCommands", {
    commands: [
      { command: "hoy", description: "Resumen operativo de hoy" },
      { command: "pendientes", description: "Pacientes y conversaciones pendientes" },
      { command: "paciente", description: "Buscar paciente por nombre" },
      { command: "agenda", description: "Agenda confirmada de hoy" },
      { command: "tomar", description: "Tomar una conversación" },
      { command: "reanudar", description: "Reanudar automatización de una conversación" },
      { command: "cerrar", description: "Cerrar una conversación" },
      { command: "responder", description: "Responder por WhatsApp" },
      { command: "programar", description: "Programar recordatorio en Telegram" },
      { command: "digest", description: "Programar resumen diario" },
      { command: "jobs", description: "Ver recordatorios programados" },
      { command: "cancelar", description: "Cancelar recordatorio" },
      { command: "estado", description: "Estado de integraciones del Command Center" },
      { command: "ayuda", description: "Ver comandos disponibles" },
    ],
  });
}

export async function setTelegramWebhook(webhookUrl: string) {
  const secret = telegramWebhookSecret();
  if (!secret) throw new Error("telegram_webhook_secret_not_configured");

  const url = new URL(webhookUrl);
  if (url.protocol !== "https:") throw new Error("telegram_webhook_requires_https");

  return telegramApi<boolean>("setWebhook", {
    url: url.toString(),
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });
}

export async function deleteTelegramWebhook() {
  return telegramApi<boolean>("deleteWebhook", { drop_pending_updates: false });
}

export async function getTelegramWebhookInfo() {
  return telegramApi<{
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    ip_address?: string;
  }>("getWebhookInfo");
}
