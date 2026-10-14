import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY read-only operational probe. Remove immediately after incident review.
// Never log bearer tokens, message contents, contact numbers, or clinical data.
const WABA_ID = "784112665694561";
const EXPECTED_PHONE_NUMBER_ID = "189275798988659";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject : {};
}

async function graphGet(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const data: unknown = await response.json().catch(() => null);
  const payload = object(data);
  const failure = object(payload.error);
  return {
    ok: response.ok,
    status: response.status,
    data: Array.isArray(payload.data) ? payload.data as unknown[] : [],
    errorCode: failure.code ?? null,
    errorType: typeof failure.type === "string" ? failure.type.slice(0, 50) : null,
  };
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("verify_subscriptions") !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const configuredPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  if (!accessToken || configuredPhoneId !== EXPECTED_PHONE_NUMBER_ID) {
    return NextResponse.json(
      { status: "not_configured", phoneMatches: configuredPhoneId === EXPECTED_PHONE_NUMBER_ID },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v25.0";
  if (!/^v\d+\.\d+$/.test(graphVersion)) {
    return NextResponse.json({ error: "invalid_graph_version" }, { status: 503 });
  }

  try {
    const base = `https://graph.facebook.com/${graphVersion}/${WABA_ID}`;
    const [subscriptions, numbers] = await Promise.all([
      graphGet(`${base}/subscribed_apps?limit=100`, accessToken),
      graphGet(`${base}/phone_numbers?fields=id&limit=100`, accessToken),
    ]);
    const subscriberApps = subscriptions.data.map((entry) => {
      const row = object(entry);
      const app = object(row.whatsapp_business_api_data);
      const id = app.id ?? row.id;
      const name = app.name ?? row.name;
      const callback = row.override_callback_uri;
      let callbackHost: string | null = null;
      if (typeof callback === "string") {
        try { callbackHost = new URL(callback).hostname.slice(0, 160); } catch { /* no public callback */ }
      }
      return {
        id: typeof id === "string" || typeof id === "number" ? String(id).slice(0, 100) : null,
        name: typeof name === "string" ? name.slice(0, 150) : null,
        callbackHost,
      };
    });
    const phoneIds = numbers.data.map((entry) => String(object(entry).id ?? "")).filter(Boolean);
    console.info("hautlab_meta_subscriptions_audit", JSON.stringify({
      subscriptionsStatus: subscriptions.status,
      subscriptionsErrorCode: subscriptions.errorCode,
      subscriptionsErrorType: subscriptions.errorType,
      apps: subscriberApps,
      numbersStatus: numbers.status,
      numbersErrorCode: numbers.errorCode,
      containsCanonicalPhone: phoneIds.includes(EXPECTED_PHONE_NUMBER_ID),
      numbersCount: phoneIds.length,
    }));
    return NextResponse.json(
      { audit: "recorded", subscriptionsStatus: subscriptions.status,
        numbersStatus: numbers.status, appsCount: subscriberApps.length,
        canonicalPhoneListed: phoneIds.includes(EXPECTED_PHONE_NUMBER_ID) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("hautlab_meta_subscriptions_audit", JSON.stringify({
      status: "transport_error",
      type: error instanceof Error ? error.name.slice(0, 60) : "unknown",
    }));
    return NextResponse.json({ audit: "transport_error" }, { status: 502 });
  }
}
