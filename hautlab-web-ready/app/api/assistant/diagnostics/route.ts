import { NextResponse } from "next/server";
import { buildAssistantInstructions } from "@/lib/assistant-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary smoke test for the preview environment.
export async function GET() {
  const rawApiKey = process.env.OPENAI_API_KEY;
  const apiKey = rawApiKey?.trim();
  const model = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-5-mini";

  if (!apiKey) {
    return NextResponse.json(
      { status: "missing_key" },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  if (/\s/.test(apiKey) || rawApiKey !== apiKey) {
    return NextResponse.json(
      { status: "invalid_key_format" },
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
        instructions: buildAssistantInstructions(),
        input: [
          {
            role: "user",
            content: "¿Cuánto cuesta la consulta dermatológica?"
          }
        ],
        reasoning: { effort: "low" },
        max_output_tokens: 420
      }),
      signal: AbortSignal.timeout(20_000)
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "openai_error", httpStatus: response.status },
        { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };

    const reply =
      payload.output_text?.trim() ||
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .find((content) => content.type === "output_text" && content.text?.trim())
        ?.text?.trim() ||
      null;

    return NextResponse.json(
      { status: reply ? "ready" : "empty_response", reply },
      {
        status: reply ? 200 : 502,
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
