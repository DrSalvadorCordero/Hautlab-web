import { NextRequest, NextResponse } from "next/server";
import {
  createTelegramAudit,
  finishTelegramAudit,
  getTelegramLinkByOperator,
  getTelegramLinkByUser,
  pairTelegramOperator,
  touchTelegramLink,
  type TelegramOperatorKey,
} from "@/lib/telegram-db";
import { handleTelegramOperatorText } from "@/lib/telegram-operator";
import {
  safeSecretEqual,
  sendTelegramMessage,
  telegramWebhookSecret,
} from "@/lib/telegram";
import { getTelegramSecret } from "@/lib/telegram-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 128 * 1024;

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number;
      type?: string;
    };
    from?: {
      id?: number;
      is_bot?: boolean;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

function ok() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}

async function pairingSecret(operatorKey: TelegramOperatorKey) {
  return getTelegramSecret(
    operatorKey === "doctor"
      ? "pairing_secret_doctor"
      : "pairing_secret_karen",
    { allowMissing: true },
  );
}

function parsePairCommand(text: string) {
  const match = text
    .trim()
    .match(/^\/pair(?:@\w+)?\s+(doctor|karen)\s+([^\s]{12,256})$/i);
  if (!match) return null;
  return {
    operatorKey: match[1].toLowerCase() as TelegramOperatorKey,
    secret: match[2],
  };
}

function commandName(text: string) {
  const match = text.trim().match(/^\/([^\s@]+)(?:@\w+)?/);
  if (match) return match[1].toLowerCase().slice(0, 80);
  return "natural_language";
}

function errorCode(error: unknown) {
  if (!(error instanceof Error)) return "unknown_error";
  return error.message
    .replace(/[^a-zA-Z0-9_.:-]+/g, "_")
    .slice(0, 160);
}

export async function GET() {
  return NextResponse.json(
    { service: "HAUTLAB Telegram webhook", status: "ready" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const expectedSecret = await telegramWebhookSecret();
  const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");

  if (!expectedSecret || !safeSecretEqual(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let bodyText = "";
  try {
    bodyText = await request.text();
  } catch {
    return ok();
  }
  if (Buffer.byteLength(bodyText, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let update: TelegramUpdate;
  try {
    update = JSON.parse(bodyText) as TelegramUpdate;
  } catch {
    return ok();
  }

  const message = update.message;
  const userId = message?.from?.id;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;
  const text = message?.text?.trim();

  if (
    typeof update.update_id !== "number" ||
    typeof userId !== "number" ||
    typeof chatId !== "number" ||
    typeof messageId !== "number" ||
    !text ||
    message?.from?.is_bot ||
    message?.chat?.type !== "private"
  ) {
    return ok();
  }

  let link = await getTelegramLinkByUser(userId).catch(() => null);
  const auditId = await createTelegramAudit({
    updateId: update.update_id,
    messageId,
    telegramUserId: userId,
    telegramChatId: chatId,
    operatorKey: link?.operator_key ?? null,
    action: commandName(text),
    payload: {
      command: commandName(text),
      character_count: text.length,
      paired: Boolean(link),
    },
  }).catch(() => null);

  if (!auditId) return ok();

  try {
    if (!link) {
      const pair = parsePairCommand(text);
      if (!pair) {
        await finishTelegramAudit(auditId, {
          status: "rejected",
          errorCode: "telegram_not_paired",
        });
        await sendTelegramMessage(
          chatId,
          "Este bot es privado. Vincúlalo con /pair <operador> <clave>.",
        ).catch(() => undefined);
        return ok();
      }

      const expectedPairingSecret = await pairingSecret(pair.operatorKey);
      if (
        !expectedPairingSecret ||
        !safeSecretEqual(pair.secret, expectedPairingSecret)
      ) {
        await finishTelegramAudit(auditId, {
          status: "rejected",
          errorCode: "invalid_pairing_secret",
        });
        await sendTelegramMessage(chatId, "Clave de vinculación inválida.").catch(
          () => undefined,
        );
        return ok();
      }

      const existingOperatorLink = await getTelegramLinkByOperator(pair.operatorKey);
      if (
        existingOperatorLink?.active &&
        existingOperatorLink.telegram_user_id !== userId
      ) {
        await finishTelegramAudit(auditId, {
          status: "rejected",
          errorCode: "operator_already_paired",
        });
        await sendTelegramMessage(
          chatId,
          "Ese operador ya está vinculado a otra cuenta de Telegram.",
        ).catch(() => undefined);
        return ok();
      }

      const displayName = [message.from?.first_name, message.from?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      link = await pairTelegramOperator({
        operatorKey: pair.operatorKey,
        telegramUserId: userId,
        telegramChatId: chatId,
        username: message.from?.username ?? null,
        displayName: displayName || null,
      });

      if (!link) throw new Error("telegram_pairing_failed");

      await finishTelegramAudit(auditId, {
        status: "processed",
        result: { operator_key: link.operator_key, paired: true },
      });
      await sendTelegramMessage(
        chatId,
        `HAUTLAB Command Center vinculado como ${link.operator_key === "doctor" ? "Dr. Salvador" : "Karen"}.\n\nUsa /ayuda para ver los comandos.`,
      );
      return ok();
    }

    await touchTelegramLink(link.operator_key, chatId);
    const reply = await handleTelegramOperatorText(
      link.operator_key,
      chatId,
      text,
    );
    await sendTelegramMessage(chatId, reply);
    await finishTelegramAudit(auditId, {
      status: "processed",
      result: {
        operator_key: link.operator_key,
        reply_character_count: reply.length,
      },
    });
    return ok();
  } catch (error) {
    const code = errorCode(error);
    console.error("[telegram-webhook] command failed", {
      updateId: update.update_id,
      operator: link?.operator_key ?? null,
      code,
    });
    await finishTelegramAudit(auditId, {
      status: "failed",
      errorCode: code,
    }).catch(() => undefined);
    await sendTelegramMessage(
      chatId,
      "No pude completar esa acción. Quedó registrada para revisión.",
    ).catch(() => undefined);
    return ok();
  }
}
