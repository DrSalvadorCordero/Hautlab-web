import { NextRequest, NextResponse } from "next/server";
import {
  deleteTelegramWebhook,
  getTelegramBotIdentity,
  getTelegramWebhookInfo,
  safeSecretEqual,
  setTelegramCommands,
  setTelegramWebhook,
  telegramConfigured,
} from "@/lib/telegram";
import { telegramDatabaseConfigured } from "@/lib/telegram-db";
import { getTelegramSecret } from "@/lib/telegram-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function setupKey() {
  const dedicated = await getTelegramSecret("setup_key", { allowMissing: true });
  return dedicated || process.env.HAUTLAB_INTERNAL_API_KEY?.trim() || "";
}

async function authorized(request: NextRequest) {
  const expected = await setupKey();
  if (!expected) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const direct = request.headers.get("x-hautlab-setup-key");
  return safeSecretEqual(bearer || direct, expected);
}

function webhookUrl(request: NextRequest) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    request.nextUrl.origin;
  const url = new URL("/api/telegram/webhook", base);
  if (url.protocol !== "https:") throw new Error("telegram_webhook_requires_https");
  return url.toString();
}

function noStore(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  if (!(await authorized(request))) {
    return noStore({ error: "unauthorized" }, 401);
  }

  const configured = await telegramConfigured();
  const bot = configured
    ? await getTelegramBotIdentity().catch(() => null)
    : null;
  const webhook = configured
    ? await getTelegramWebhookInfo().catch(() => null)
    : null;

  return noStore({
    configured,
    database_configured: telegramDatabaseConfigured(),
    bot: bot
      ? {
          id: bot.id,
          username: bot.username ?? null,
          first_name: bot.first_name,
        }
      : null,
    webhook: webhook
      ? {
          url: webhook.url || null,
          pending_update_count: webhook.pending_update_count,
          last_error_date: webhook.last_error_date ?? null,
          last_error_message: webhook.last_error_message ?? null,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  if (!(await authorized(request))) {
    return noStore({ error: "unauthorized" }, 401);
  }
  if (!(await telegramConfigured())) {
    return noStore({ error: "telegram_not_configured" }, 503);
  }

  try {
    const [bot] = await Promise.all([
      getTelegramBotIdentity(),
      setTelegramCommands(),
    ]);
    const target = webhookUrl(request);
    await setTelegramWebhook(target);
    const webhook = await getTelegramWebhookInfo();

    return noStore({
      ok: true,
      bot: {
        id: bot.id,
        username: bot.username ?? null,
        first_name: bot.first_name,
      },
      webhook: {
        url: webhook.url,
        pending_update_count: webhook.pending_update_count,
      },
    });
  } catch (error) {
    console.error("[telegram-setup] activation failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStore({ error: "telegram_setup_failed" }, 502);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await authorized(request))) {
    return noStore({ error: "unauthorized" }, 401);
  }
  if (!(await telegramConfigured())) {
    return noStore({ error: "telegram_not_configured" }, 503);
  }

  try {
    await deleteTelegramWebhook();
    return noStore({ ok: true });
  } catch (error) {
    console.error("[telegram-setup] webhook removal failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStore({ error: "telegram_webhook_delete_failed" }, 502);
  }
}
