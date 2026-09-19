import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function normalizePhone(value: unknown) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return /^[1-9][0-9]{9,14}$/.test(digits) ? digits : null;
}

export async function POST(request: NextRequest) {
  const expected = process.env.HAUTLAB_OPERATOR_API_KEY?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!expected || !supplied || !secureEqual(expected, supplied)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: { to?: unknown; body?: unknown };
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const to = normalizePhone(input.to);
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!to || !body || body.length > 4096) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const version = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  if (!token || !phoneId) {
    return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });
  }

  const meta = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const payload = await meta.json().catch(() => ({})) as {
    messages?: Array<{ id?: string }>;
    error?: { code?: unknown };
  };
  if (!meta.ok) {
    console.error("[operator-whatsapp-send] Meta rejected send", {
      status: meta.status, code: payload.error?.code ?? null,
    });
    return NextResponse.json({ error: "provider_send_failed" }, { status: 502 });
  }

  const messageId = payload.messages?.[0]?.id;
  if (!messageId) return NextResponse.json({ error: "message_id_missing" }, { status: 502 });
  return NextResponse.json({ sent: true, messageId }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const expected = process.env.HAUTLAB_OPERATOR_API_KEY?.trim();
  const supplied = request.nextUrl.searchParams.get("key")?.trim() ?? "";
  if (!expected || !supplied || !secureEqual(expected, supplied)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const to = normalizePhone(request.nextUrl.searchParams.get("to"));
  const body = request.nextUrl.searchParams.get("body")?.trim() ?? "";
  if (!to || !body || body.length > 4096) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const version = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  if (!token || !phoneId) return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });
  const meta = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }), cache: "no-store", signal: AbortSignal.timeout(15000) });
  const payload = await meta.json().catch(() => ({})) as { messages?: Array<{ id?: string }>; error?: { code?: unknown } };
  if (!meta.ok) return NextResponse.json({ error: "provider_send_failed", providerStatus: meta.status, providerCode: payload.error?.code ?? null }, { status: 502 });
  const messageId = payload.messages?.[0]?.id;
  if (!messageId) return NextResponse.json({ error: "message_id_missing" }, { status: 502 });
  return NextResponse.json({ sent: true, messageId }, { headers: { "Cache-Control": "no-store" } });
}
