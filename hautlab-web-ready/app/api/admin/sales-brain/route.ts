import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  calculateSalesQuote,
  getSalesServices,
} from "@/lib/sales-brain";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = 16 * 1024;

const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        serviceKey: z.enum([
          "dermatology_consultation",
          "upper_face_botulinum_toxin",
          "hyaluronic_acid_one_syringe",
        ]),
        quantity: z.number().int().min(1).max(12),
      }),
    )
    .min(1)
    .max(12),
  leadTemperature: z.enum(["cold", "warm", "hot"]),
  objection: z.enum([
    "none",
    "price",
    "trust",
    "fear",
    "timing",
    "comparison",
    "uncertainty",
  ]),
  history: z.enum(["new", "repeat", "high_value"]),
  askedDiscount: z.boolean(),
  prepaid: z.boolean(),
  paymentMode: z.enum(["preferential", "card", "installments"]),
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

export async function GET() {
  const access = await getAdminAccess();
  const canManage = Boolean(access.isOwner || access.organizationRole === "org:admin");
  if (!canManage) return noStoreJson({ error: "forbidden" }, { status: 403 });

  return noStoreJson({
    services: getSalesServices(),
    assumptions: {
      fillerDirectCost: 800,
      botoxConservativeUnits: 60,
      botoxVialCost: 2300,
      botoxVialUnits: 200,
      medicalHourValue: 1300,
      cardFeeReference: 0.0406,
    },
  });
}

export async function POST(request: Request) {
  const access = await getAdminAccess();
  const canManage = Boolean(access.isOwner || access.organizationRole === "org:admin");
  if (!canManage) return noStoreJson({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, maxBodyBytes)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_quote" }, { status: 400 });
  }

  return noStoreJson({
    quote: calculateSalesQuote(parsed.data),
  });
}
