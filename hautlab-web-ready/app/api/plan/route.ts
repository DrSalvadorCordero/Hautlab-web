import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PLAN_GOALS,
  PLAN_PRIORITIES,
  createHautlabPlan,
} from "@/lib/server/hautlab-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const body = await request.json().catch(() => null);
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

    const portalUrl = new URL(
      `/mi-hautlab/${plan.public_code}?access=${accessToken}`,
      request.nextUrl.origin,
    ).toString();

    return NextResponse.json(
      {
        code: plan.public_code,
        accessToken,
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
