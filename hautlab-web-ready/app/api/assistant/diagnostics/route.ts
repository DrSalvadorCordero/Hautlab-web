import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-5-mini";

  if (!apiKey) {
    return NextResponse.json(
      { status: "missing_key", model },
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

    const requestId = response.headers.get("x-request-id");

    if (response.ok) {
      return NextResponse.json(
        { status: "ready", model, requestId },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    let code: string | null = null;
    let type: string | null = null;
    let message: string | null = null;

    try {
      const payload = (await response.json()) as {
        error?: { code?: string; type?: string; message?: string };
      };
      code = payload.error?.code ?? null;
      type = payload.error?.type ?? null;
      message = payload.error?.message?.slice(0, 240) ?? null;
    } catch {
      // No diagnostic body available.
    }

    return NextResponse.json(
      { status: "openai_error", httpStatus: response.status, model, code, type, message, requestId },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
    const causeCode =
      cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string"
        ? cause.code
        : null;

    return NextResponse.json(
      {
        status: "network_error",
        model,
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message.slice(0, 240) : null,
        causeCode
      },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
