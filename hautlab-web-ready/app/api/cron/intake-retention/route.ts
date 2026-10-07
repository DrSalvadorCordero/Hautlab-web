import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cleanupExpiredVisualIntake } from "@/lib/server/hautlab-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function matches(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return Boolean(expected) &&
    left.length === right.length &&
    timingSafeEqual(left, right);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "cron_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!matches(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const result = await cleanupExpiredVisualIntake();
    console.info("[visual-intake] retention cleanup", result);
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[visual-intake] retention cleanup failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { error: "cleanup_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
