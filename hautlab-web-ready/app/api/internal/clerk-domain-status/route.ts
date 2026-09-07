import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ClerkDomain = {
  id?: string;
  name?: string;
  is_satellite?: boolean;
  proxy_url?: string | null;
};

export async function GET() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    return NextResponse.json({ ok: false, reason: "missing_secret_key" }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.clerk.com/v1/domains", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, status: response.status }, { status: 502 });
    }

    const payload = await response.json() as { data?: ClerkDomain[] } | ClerkDomain[];
    const domains = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
    const domain = domains.find((item) => item.name === "hautlabmx.com") ?? domains.find((item) => item.is_satellite === false) ?? domains[0];

    return NextResponse.json({
      ok: true,
      domain: domain?.name ?? null,
      proxyUrl: domain?.proxy_url ?? null,
      mode: domain?.proxy_url ? "proxy" : "direct"
    });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: error instanceof Error ? error.message : "unknown" }, { status: 502 });
  }
}
