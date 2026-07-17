import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-5-mini";

  if (!apiKey || /\s/.test(apiKey)) {
    return NextResponse.json(
      { status: "invalid_configuration" },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        store: false,
        input: "Responde únicamente: OK",
        max_output_tokens: 8
      }),
      signal: AbortSignal.timeout(20_000)
    });

    return NextResponse.json(
      { status: response.ok ? "ready" : "openai_error", httpStatus: response.status },
      {
        status: response.ok ? 200 : 502,
        headers: { "Cache-Control": "no-store, max-age=0" }
      }
    );
  } catch {
    return NextResponse.json(
      { status: "network_error" },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
