import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_TOKEN_HASH = "24cc27f7e841b3c2043d16587df17581e4123e34209fded297591aea0c8f3500";
const PROXY_URL = "https://www.hautlabmx.com/__clerk";
const ALLOWED_DOMAINS = new Set(["hautlabmx.com", "www.hautlabmx.com"]);

function tokenIsValid(token: string | null) {
  if (!token) return false;

  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(EXPECTED_TOKEN_HASH);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: NextRequest) {
  if (!tokenIsValid(request.nextUrl.searchParams.get("token"))) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ ok: false, step: "environment" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json"
  };

  const domainsResponse = await fetch("https://api.clerk.com/v1/domains", {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000)
  });

  const domainsPayload = await domainsResponse.json().catch(() => null);
  if (!domainsResponse.ok) {
    return NextResponse.json(
      { ok: false, step: "list-domains", status: domainsResponse.status },
      { status: 502 }
    );
  }

  const domains = Array.isArray(domainsPayload)
    ? domainsPayload
    : Array.isArray(domainsPayload?.data)
      ? domainsPayload.data
      : [];

  const domain = domains.find(
    (item: { name?: string; id?: string; is_satellite?: boolean }) =>
      item?.id && item?.name && ALLOWED_DOMAINS.has(item.name.toLowerCase()) && !item.is_satellite
  );

  if (!domain?.id) {
    return NextResponse.json({ ok: false, step: "find-domain" }, { status: 404 });
  }

  const updateResponse = await fetch(`https://api.clerk.com/v1/domains/${domain.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ proxy_url: PROXY_URL }),
    signal: AbortSignal.timeout(20_000)
  });

  const updatePayload = await updateResponse.json().catch(() => null);
  if (!updateResponse.ok) {
    const errorCode = Array.isArray(updatePayload?.errors) ? updatePayload.errors[0]?.code : undefined;
    return NextResponse.json(
      { ok: false, step: "update-domain", status: updateResponse.status, code: errorCode ?? null },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, proxy: PROXY_URL });
}
