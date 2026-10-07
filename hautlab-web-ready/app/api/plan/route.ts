import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PLAN_GOALS,
  PLAN_PRIORITIES,
  createHautlabPlan,
  hautlabPlanAccessCookieName,
} from "@/lib/server/hautlab-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const PLAN_SESSION_SECONDS = 60 * 60 * 24 * 90;

const schema = z.object({
  goals: z.array(z.enum(PLAN_GOALS)).min(1).max(3),
  priorities: z.array(z.enum(PLAN_PRIORITIES)).max(3).default([]),
  preferences: z
    .object({
      timing: z.enum(["now", "month", "exploring"]).optional(),
      budget: z.enum(["focused", "flexible", "unsure"]).optional(),
    })
    .default({}),
  sourcePath: z.string().max(512).optional(),
  language: z.enum(["es", "en"]).default("es"),
});

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "payload_too_large" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "payload_too_large" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = null;
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_plan_input" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { plan, accessToken } = await createHautlabPlan({
      goals: parsed.data.goals,
      priorities: parsed.data.priorities,
      preferences: parsed.data.preferences,
      language: parsed.data.language,
      sourcePath: parsed.data.sourcePath ?? request.nextUrl.pathname,
    });

    const portalPath = `/mi-hautlab/${plan.public_code}`;
    const portalUrl = new URL(portalPath, request.nextUrl.origin).toString();

    const response = NextResponse.json(
      {
        code: plan.public_code,
        portalUrl,
        recommendations: plan.recommendations,
        estimate: {
          min: plan.estimated_range_min,
          max: plan.estimated_range_max,
          currency: plan.currency,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );

    response.cookies.set(
      hautlabPlanAccessCookieName(plan.public_code),
      accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: portalPath,
        maxAge: PLAN_SESSION_SECONDS,
      },
    );

    return response;
  } catch (error) {
    console.error("[hautlab-plan] create failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { error: "plan_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
