import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = 12 * 1024;

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();

const payloadSchema = z.object({
  landingUrl: z.string().url().max(2048),
  currentUrl: z.string().url().max(2048),
  referrer: nullableText(2048),
  utmSource: nullableText(500),
  utmMedium: nullableText(500),
  utmCampaign: nullableText(500),
  utmContent: nullableText(500),
  utmTerm: nullableText(500),
  gclid: nullableText(500),
  fbclid: nullableText(500),
  msclkid: nullableText(500),
  language: z.enum(["es", "en"]).default("es"),
});

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function compact(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  const code = `HL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const input = parsed.data;

  const response = await fetch(`${config.url}/rest/v1/growth_attribution_touchpoints`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      code,
      landing_url: input.landingUrl,
      current_url: input.currentUrl,
      referrer: compact(input.referrer),
      utm_source: compact(input.utmSource),
      utm_medium: compact(input.utmMedium),
      utm_campaign: compact(input.utmCampaign),
      utm_content: compact(input.utmContent),
      utm_term: compact(input.utmTerm),
      gclid: compact(input.gclid),
      fbclid: compact(input.fbclid),
      msclkid: compact(input.msclkid),
      language: input.language,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    console.error("[growth-attribution] create failed", { status: response.status });
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }

  return NextResponse.json(
    { code },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
