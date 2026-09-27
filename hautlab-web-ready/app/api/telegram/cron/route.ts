import { NextRequest, NextResponse } from "next/server";
import {
  claimTelegramJob,
  completeTelegramJob,
  failTelegramJob,
  listDueTelegramJobs,
  type TelegramJob,
} from "@/lib/telegram-db";
import { getTelegramTodaySummaryText } from "@/lib/telegram-operator";
import { safeSecretEqual, sendTelegramMessage } from "@/lib/telegram";
import { getTelegramSecret } from "@/lib/telegram-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function cronSecret() {
  return getTelegramSecret("cron_key", { allowMissing: true });
}

function authorized(request: NextRequest, expected: string) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return safeSecretEqual(bearer, expected);
}

function nextRecurringRun(job: TelegramJob) {
  if (!job.repeat_minutes) return null;
  const interval = job.repeat_minutes * 60_000;
  let next = Date.parse(job.next_run_at);
  if (!Number.isFinite(next)) next = Date.now();
  do {
    next += interval;
  } while (next <= Date.now());
  return new Date(next).toISOString();
}

async function executeJob(job: TelegramJob) {
  const claimed = await claimTelegramJob(job.id);
  if (!claimed) return { status: "skipped" as const };

  try {
    const text =
      claimed.kind === "daily_digest"
        ? await getTelegramTodaySummaryText()
        : claimed.message?.trim();

    if (!text) throw new Error("telegram_job_empty_message");

    await sendTelegramMessage(claimed.chat_id, text);
    const next = nextRecurringRun(claimed);
    await completeTelegramJob(claimed, next);
    return { status: "sent" as const, recurring: Boolean(next) };
  } catch (error) {
    const code =
      error instanceof Error
        ? error.message.replace(/[^a-zA-Z0-9_.:-]+/g, "_").slice(0, 200)
        : "telegram_job_failed";
    await failTelegramJob(claimed, code).catch(() => undefined);
    return { status: "failed" as const, error: code };
  }
}

export async function GET(request: NextRequest) {
  const expected = await cronSecret();

  if (!expected) {
    return NextResponse.json(
      { ok: true, enabled: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!authorized(request, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const due = await listDueTelegramJobs(25);
    const results = [];
    for (const job of due) {
      results.push(await executeJob(job));
    }

    return NextResponse.json(
      {
        ok: true,
        enabled: true,
        due: due.length,
        sent: results.filter((item) => item.status === "sent").length,
        failed: results.filter((item) => item.status === "failed").length,
        skipped: results.filter((item) => item.status === "skipped").length,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[telegram-cron] failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { error: "telegram_cron_failed" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
