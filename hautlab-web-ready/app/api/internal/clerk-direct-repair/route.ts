import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ClerkDomain = {
  id?: string;
  name?: string;
  is_satellite?: boolean;
  proxy_url?: string | null;
};

type ClerkErrorPayload = {
  errors?: Array<{ code?: string; message?: string }>;
};

export async function GET() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    return NextResponse.json({ ok: false, stage: "config", reason: "missing_secret_key" }, { status: 503 });
  }

  try {
    const listResponse = await fetch("https://api.clerk.com/v1/domains", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    if (!listResponse.ok) {
      const error = await listResponse.json().catch(() => null) as ClerkErrorPayload | null;
      return NextResponse.json({
        ok: false,
        stage: "list",
        status: listResponse.status,
        code: error?.errors?.[0]?.code ?? null
      }, { status: 502 });
    }

    const payload = await listResponse.json() as { data?: ClerkDomain[] } | ClerkDomain[];
    const domains = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
    const domain =
      domains.find((item) => item.name === "hautlabmx.com") ??
      domains.find((item) => item.name === "www.hautlabmx.com") ??
      domains.find((item) => item.is_satellite === false) ??
      domains[0];

    if (!domain?.id) {
      return NextResponse.json({ ok: false, stage: "select", reason: "domain_not_found", count: domains.length }, { status: 502 });
    }

    if (!domain.proxy_url) {
      return NextResponse.json({ ok: true, changed: false, mode: "direct", domain: domain.name ?? null });
    }

    const patchResponse = await fetch(`https://api.clerk.com/v1/domains/${encodeURIComponent(domain.id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ proxy_url: null }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000)
    });

    if (!patchResponse.ok) {
      const error = await patchResponse.json().catch(() => null) as ClerkErrorPayload | null;
      return NextResponse.json({
        ok: false,
        stage: "patch",
        status: patchResponse.status,
        code: error?.errors?.[0]?.code ?? null,
        message: error?.errors?.[0]?.message ?? null
      }, { status: 502 });
    }

    return NextResponse.json({ ok: true, changed: true, mode: "direct", domain: domain.name ?? null });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      stage: "exception",
      reason: error instanceof Error ? error.message : "unknown"
    }, { status: 502 });
  }
}
