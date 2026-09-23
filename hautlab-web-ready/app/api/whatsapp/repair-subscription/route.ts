import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CALLBACK_URL = "https://www.hautlabmx.com/api/whatsapp/webhook";
const EXPECTED_APP_ID = "1277545887579303";

async function graphRequest(
  url: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

export async function GET() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() ?? "";
  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN?.trim() ??
    process.env.META_VERIFY_TOKEN?.trim() ??
    "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";

  if (!accessToken || !wabaId || !verifyToken) {
    return NextResponse.json(
      {
        ok: false,
        configured: {
          accessToken: Boolean(accessToken),
          wabaId: Boolean(wabaId),
          verifyToken: Boolean(verifyToken),
        },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const endpoint = `https://graph.facebook.com/${graphVersion}/${wabaId}/subscribed_apps`;

  const before = await graphRequest(endpoint, accessToken);

  const subscribe = await graphRequest(endpoint, accessToken, {
    method: "POST",
    body: JSON.stringify({}),
  });

  const override = subscribe.ok
    ? await graphRequest(endpoint, accessToken, {
        method: "POST",
        body: JSON.stringify({
          override_callback_uri: CALLBACK_URL,
          verify_token: verifyToken,
        }),
      })
    : { ok: false, status: 0, payload: { skipped: true } };

  const after = await graphRequest(endpoint, accessToken);

  const sanitize = (value: unknown) => {
    if (!value || typeof value !== "object") return value;
    const source = value as Record<string, unknown>;
    const data = Array.isArray(source.data)
      ? source.data.map((item) => {
          if (!item || typeof item !== "object") return item;
          const row = item as Record<string, unknown>;
          const apiData =
            row.whatsapp_business_api_data &&
            typeof row.whatsapp_business_api_data === "object"
              ? (row.whatsapp_business_api_data as Record<string, unknown>)
              : null;
          return {
            appId: apiData?.id ?? null,
            appName: apiData?.name ?? null,
            overrideCallbackUri: row.override_callback_uri ?? null,
          };
        })
      : undefined;
    const error =
      source.error && typeof source.error === "object"
        ? (source.error as Record<string, unknown>)
        : null;
    return {
      ...(data ? { data } : {}),
      ...(error
        ? {
            error: {
              message: error.message ?? null,
              type: error.type ?? null,
              code: error.code ?? null,
              error_subcode: error.error_subcode ?? null,
            },
          }
        : {}),
      ...(typeof source.success === "boolean" ? { success: source.success } : {}),
    };
  };

  const afterData =
    after.payload && typeof after.payload === "object"
      ? (after.payload as { data?: Array<Record<string, unknown>> }).data ?? []
      : [];
  const expected = afterData.find((item) => {
    const apiData =
      item.whatsapp_business_api_data &&
      typeof item.whatsapp_business_api_data === "object"
        ? (item.whatsapp_business_api_data as Record<string, unknown>)
        : null;
    return apiData?.id === EXPECTED_APP_ID;
  });

  return NextResponse.json(
    {
      ok: subscribe.ok && override.ok && after.ok,
      callback: CALLBACK_URL,
      expectedAppPresent: Boolean(expected),
      before: {
        status: before.status,
        ok: before.ok,
        payload: sanitize(before.payload),
      },
      subscribe: {
        status: subscribe.status,
        ok: subscribe.ok,
        payload: sanitize(subscribe.payload),
      },
      override: {
        status: override.status,
        ok: override.ok,
        payload: sanitize(override.payload),
      },
      after: {
        status: after.status,
        ok: after.ok,
        payload: sanitize(after.payload),
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
