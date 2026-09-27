import { NextRequest, NextResponse } from "next/server";
import {
  cancelTelegramJob,
  createTelegramJob,
  getTelegramLinkByOperator,
  listTelegramJobs,
  listTelegramOperatorLinks,
  telegramDatabaseConfigured,
  type TelegramOperatorKey,
} from "@/lib/telegram-db";
import {
  getTelegramPatientSearchText,
  getTelegramPendingText,
  getTelegramStatusText,
  getTelegramTodaySummaryText,
  handleTelegramOperatorText,
} from "@/lib/telegram-operator";
import {
  getTelegramBotIdentity,
  getTelegramWebhookInfo,
  safeSecretEqual,
  sendTelegramMessage,
  telegramConfigured,
} from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_NAME = "HAUTLAB Telegram MCP";
const SERVER_VERSION = "1.0.0";
const MCP_PROTOCOL = "2025-06-18";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type RpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: any;
};

function jsonRpc(id: RpcRequest["id"], result: Json, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { status });
}

function jsonRpcError(
  id: RpcRequest["id"],
  code: number,
  message: string,
  data?: Json,
  status = 200,
) {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: {
        code,
        message,
        ...(data === undefined ? {} : { data }),
      },
    },
    { status },
  );
}

function bridgeKey(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get("key") ??
    request.headers.get("x-hautlab-mcp-key") ??
    ""
  );
}

function expectedBridgeKey() {
  return (
    process.env.TELEGRAM_MCP_KEY?.trim() ||
    process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ||
    ""
  );
}

function validBridgeKey(request: NextRequest) {
  const expected = expectedBridgeKey();
  return Boolean(expected) && safeSecretEqual(bridgeKey(request), expected);
}

function textContent(value: unknown) {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
    structuredContent: typeof value === "string" ? { text: value } : value,
  };
}

function requireApproved(args: any) {
  if (args?.confirmation !== "APPROVED") {
    throw new Error(
      'Write blocked. This tool requires confirmation="APPROVED" after explicit approval of the exact action.',
    );
  }
}

function operatorKey(value: unknown): TelegramOperatorKey {
  if (value === "doctor" || value === "karen") return value;
  throw new Error("invalid_operator_key");
}

function safeLimit(value: unknown, fallback = 20) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(1, Math.min(100, Math.trunc(number)));
}

const tools = [
  {
    name: "telegram_connection_status",
    description:
      "Check HAUTLAB Telegram bot, database, operator-link, webhook, Nimbo and WhatsApp readiness. Read-only.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "telegram_today_summary",
    description:
      "Return today's HAUTLAB operational summary with counts, agenda and priority follow-ups. Read-only.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "telegram_pending_summary",
    description:
      "Return current HAUTLAB pending conversations and operational follow-ups. Read-only.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "telegram_search_patient",
    description:
      "Search HAUTLAB operational conversations by patient name or phone suffix. Returns minimum necessary operational information. Read-only.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 2, maxLength: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_list_jobs",
    description:
      "List active scheduled Telegram reminders or daily digests. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_send_operator_message",
    description:
      "Send a private Telegram message to a paired HAUTLAB operator. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["operator_key", "message", "confirmation"],
      properties: {
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        message: { type: "string", minLength: 1, maxLength: 4096 },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_schedule_operator_message",
    description:
      "Schedule a private Telegram message for a paired HAUTLAB operator. run_at must be a future ISO 8601 timestamp. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["operator_key", "message", "run_at", "confirmation"],
      properties: {
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        message: { type: "string", minLength: 1, maxLength: 4096 },
        run_at: { type: "string", minLength: 10, maxLength: 80 },
        repeat_minutes: { type: "integer", minimum: 5, maximum: 525600 },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_cancel_job",
    description:
      "Cancel one active Telegram scheduled job. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["job_id", "confirmation"],
      properties: {
        job_id: { type: "string", minLength: 36, maxLength: 36 },
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_take_conversation",
    description:
      "Assign a HAUTLAB WhatsApp conversation to a human operator and pause the bot. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["reference", "operator_key", "confirmation"],
      properties: {
        reference: { type: "integer", minimum: 1 },
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_resume_conversation",
    description:
      "Release a HAUTLAB WhatsApp conversation back to automation. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["reference", "operator_key", "confirmation"],
      properties: {
        reference: { type: "integer", minimum: 1 },
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_close_conversation",
    description:
      "Close a HAUTLAB WhatsApp conversation and keep automation paused. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["reference", "operator_key", "confirmation"],
      properties: {
        reference: { type: "integer", minimum: 1 },
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "telegram_reply_whatsapp",
    description:
      "Send an exact operator-approved WhatsApp reply to a HAUTLAB conversation and pause automation. WRITE TOOL; requires explicit approval.",
    inputSchema: {
      type: "object",
      required: ["reference", "operator_key", "message", "confirmation"],
      properties: {
        reference: { type: "integer", minimum: 1 },
        operator_key: { type: "string", enum: ["doctor", "karen"] },
        message: { type: "string", minLength: 1, maxLength: 4096 },
        confirmation: { type: "string", enum: ["APPROVED"] },
      },
      additionalProperties: false,
    },
  },
] as const;

async function callTool(name: string, args: any) {
  switch (name) {
    case "telegram_connection_status": {
      const links = await listTelegramOperatorLinks().catch(() => []);
      const [bot, webhook] = telegramConfigured()
        ? await Promise.all([
            getTelegramBotIdentity().catch(() => null),
            getTelegramWebhookInfo().catch(() => null),
          ])
        : [null, null];

      return textContent({
        telegram_configured: telegramConfigured(),
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
              configured: Boolean(webhook.url),
              pending_update_count: webhook.pending_update_count,
              last_error_date: webhook.last_error_date ?? null,
              last_error_message: webhook.last_error_message ?? null,
            }
          : null,
        operators: ["doctor", "karen"].map((key) => {
          const link = links.find((row) => row.operator_key === key);
          return {
            operator_key: key,
            linked: Boolean(link?.active),
            last_seen_at: link?.last_seen_at ?? null,
          };
        }),
        operational_status: await getTelegramStatusText().catch(() => null),
      });
    }

    case "telegram_today_summary":
      return textContent(await getTelegramTodaySummaryText());

    case "telegram_pending_summary":
      return textContent(await getTelegramPendingText());

    case "telegram_search_patient":
      return textContent(
        await getTelegramPatientSearchText(String(args?.query ?? "")),
      );

    case "telegram_list_jobs": {
      const operator = args?.operator_key
        ? operatorKey(args.operator_key)
        : undefined;
      const jobs = await listTelegramJobs(operator, safeLimit(args?.limit));
      return textContent(
        jobs.map((job) => ({
          id: job.id,
          operator_key: job.operator_key,
          kind: job.kind,
          next_run_at: job.next_run_at,
          repeat_minutes: job.repeat_minutes,
          status: job.status,
          message_preview:
            job.kind === "message"
              ? job.message?.slice(0, 160) ?? null
              : "HAUTLAB daily digest",
        })),
      );
    }

    case "telegram_send_operator_message": {
      requireApproved(args);
      const operator = operatorKey(args?.operator_key);
      const link = await getTelegramLinkByOperator(operator);
      if (!link) throw new Error("telegram_operator_not_paired");
      const message = String(args?.message ?? "").trim().slice(0, 4096);
      if (!message) throw new Error("telegram_empty_message");
      const sent = await sendTelegramMessage(link.telegram_chat_id, message);
      return textContent({
        ok: true,
        operator_key: operator,
        telegram_message_id: sent.message_id,
      });
    }

    case "telegram_schedule_operator_message": {
      requireApproved(args);
      const operator = operatorKey(args?.operator_key);
      const link = await getTelegramLinkByOperator(operator);
      if (!link) throw new Error("telegram_operator_not_paired");
      const runAt = new Date(String(args?.run_at ?? ""));
      if (Number.isNaN(runAt.getTime()) || runAt.getTime() <= Date.now()) {
        throw new Error("telegram_invalid_future_run_at");
      }
      const repeatMinutes =
        args?.repeat_minutes === undefined
          ? null
          : Math.trunc(Number(args.repeat_minutes));
      if (
        repeatMinutes !== null &&
        (!Number.isFinite(repeatMinutes) ||
          repeatMinutes < 5 ||
          repeatMinutes > 525600)
      ) {
        throw new Error("telegram_invalid_repeat_minutes");
      }
      const job = await createTelegramJob({
        operatorKey: operator,
        chatId: link.telegram_chat_id,
        kind: "message",
        message: String(args?.message ?? "").trim(),
        nextRunAt: runAt.toISOString(),
        repeatMinutes,
        createdBy: "mcp",
      });
      return textContent({
        ok: true,
        id: job.id,
        operator_key: job.operator_key,
        next_run_at: job.next_run_at,
        repeat_minutes: job.repeat_minutes,
      });
    }

    case "telegram_cancel_job": {
      requireApproved(args);
      const operator = args?.operator_key
        ? operatorKey(args.operator_key)
        : undefined;
      const job = await cancelTelegramJob(String(args?.job_id ?? ""), operator);
      if (!job) throw new Error("telegram_job_not_found");
      return textContent({ ok: true, id: job.id, status: "cancelled" });
    }

    case "telegram_take_conversation":
    case "telegram_resume_conversation":
    case "telegram_close_conversation":
    case "telegram_reply_whatsapp": {
      requireApproved(args);
      const operator = operatorKey(args?.operator_key);
      const link = await getTelegramLinkByOperator(operator);
      if (!link) throw new Error("telegram_operator_not_paired");
      const ref = Math.trunc(Number(args?.reference));
      if (!Number.isInteger(ref) || ref < 1) {
        throw new Error("telegram_invalid_reference");
      }

      let command = "";
      if (name === "telegram_take_conversation") command = `/tomar ${ref}`;
      if (name === "telegram_resume_conversation") command = `/reanudar ${ref}`;
      if (name === "telegram_close_conversation") command = `/cerrar ${ref}`;
      if (name === "telegram_reply_whatsapp") {
        const message = String(args?.message ?? "").trim();
        if (!message) throw new Error("telegram_empty_message");
        command = `/responder ${ref} ${message}`;
      }

      const result = await handleTelegramOperatorText(
        operator,
        link.telegram_chat_id,
        command,
      );
      return textContent({ ok: true, result });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(request: RpcRequest) {
  const id = request.id ?? null;
  const method = request.method ?? "";

  if (method === "initialize") {
    const requested = request.params?.protocolVersion;
    const protocolVersion =
      requested === "2025-03-26" || requested === "2025-06-18"
        ? requested
        : MCP_PROTOCOL;

    return jsonRpc(id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
    });
  }

  if (method === "ping") return jsonRpc(id, {});
  if (method === "tools/list") return jsonRpc(id, { tools: tools as any });
  if (
    method === "notifications/initialized" ||
    method.startsWith("notifications/")
  ) {
    return new NextResponse(null, { status: 202 });
  }

  if (method === "tools/call") {
    const name = String(request.params?.name ?? "");
    const args = request.params?.arguments ?? {};
    try {
      const result = await callTool(name, args);
      return jsonRpc(id, result as any);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tool execution failed";
      return jsonRpc(
        id,
        {
          content: [{ type: "text", text: message }],
          isError: true,
        } as any,
      );
    }
  }

  return jsonRpcError(id, -32601, "Method not found");
}

export async function POST(request: NextRequest) {
  if (!validBridgeKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: RpcRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error", undefined, 400);
  }

  if (Array.isArray(payload)) {
    return jsonRpcError(
      null,
      -32600,
      "Batch requests are not supported",
      undefined,
      400,
    );
  }

  return handleRpc(payload);
}

export async function GET(request: NextRequest) {
  if (!validBridgeKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: true,
      server: SERVER_NAME,
      version: SERVER_VERSION,
      transport: "streamable-http",
      telegram_configured: telegramConfigured(),
      database_configured: telegramDatabaseConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(request: NextRequest) {
  if (!validBridgeKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return new NextResponse(null, { status: 204 });
}
