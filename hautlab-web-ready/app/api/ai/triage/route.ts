import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getWhatsAppPromptSettings,
  WHATSAPP_SAFETY_INSTRUCTIONS,
} from "@/lib/whatsapp-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  city: z.enum(["merida", "cdmx", "unknown"]).default("unknown"),
  conversationId: z.string().trim().max(200).optional(),
});

const modelDecisionSchema = z.object({
  intent: z.enum([
    "information",
    "pricing",
    "booking",
    "follow_up",
    "clinical",
    "adverse_event",
    "complaint",
    "human_request",
    "unknown",
  ]),
  action: z.enum(["reply", "clarify", "escalate"]),
  operator: z.enum(["doctor", "karen", "none"]),
  confidence: z.number().min(0).max(1),
  reply: z.string().max(1200),
  reasonCode: z.enum([
    "safe_admin",
    "safe_commercial",
    "needs_city",
    "needs_context",
    "clinical_boundary",
    "adverse_event_boundary",
    "complaint_boundary",
    "human_requested",
    "uncertain",
  ]),
});

type ModelDecision = z.infer<typeof modelDecisionSchema>;

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function privacySafeIdentifier(conversationId?: string) {
  if (!conversationId) return undefined;
  return createHash("sha256").update(conversationId).digest("hex").slice(0, 32);
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof response.output_text === "string") return response.output_text;

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  return null;
}

function applyHardGuardrails(decision: ModelDecision): ModelDecision {
  if (decision.intent === "clinical" || decision.intent === "adverse_event") {
    return {
      ...decision,
      action: "escalate",
      operator: "doctor",
      reply:
        "Quiero que esto lo revise directamente el Dr. Salvador antes de darte una indicación. Voy a escalar la conversación.",
      reasonCode:
        decision.intent === "adverse_event"
          ? "adverse_event_boundary"
          : "clinical_boundary",
    };
  }

  if (decision.intent === "complaint") {
    return {
      ...decision,
      action: "escalate",
      operator: "karen",
      reply:
        "Voy a pasar tu conversación con Karen para que revise personalmente lo ocurrido y le dé seguimiento.",
      reasonCode: "complaint_boundary",
    };
  }

  if (decision.intent === "human_request") {
    return {
      ...decision,
      action: "escalate",
      operator: "karen",
      reply: "Claro. Voy a pasar tu conversación con una persona del equipo.",
      reasonCode: "human_requested",
    };
  }

  if (decision.confidence < 0.7 && decision.action === "reply") {
    return {
      ...decision,
      action: "clarify",
      operator: "none",
      reply: "Para orientarte correctamente, necesito un poco más de contexto antes de continuar.",
      reasonCode: "uncertain",
    };
  }

  return decision;
}

export async function POST(request: NextRequest) {
  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ?? "";
  const receivedKey = request.headers.get("x-hautlab-internal-key")?.trim() ?? "";
  const isProduction = process.env.VERCEL_ENV === "production";

  if (isProduction) {
    if (!internalKey) {
      return NextResponse.json(
        { error: "Internal API authentication is not configured." },
        { status: 503 },
      );
    }
    if (!receivedKey || !secureEqual(receivedKey, internalKey)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsedInput = inputSchema.safeParse(rawBody);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsedInput.error.flatten() },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
  }

  const model = process.env.HAUTLAB_ROUTER_MODEL?.trim() || "gpt-5-mini";
  const { message, city, conversationId } = parsedInput.data;

  try {
    const promptSettings = await getWhatsAppPromptSettings();
    const systemInstructions = `${WHATSAPP_SAFETY_INSTRUCTIONS.trim()}\n\n${promptSettings.prompt.trim()}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "low" },
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "hautlab_triage_decision",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                intent: {
                  type: "string",
                  enum: [
                    "information",
                    "pricing",
                    "booking",
                    "follow_up",
                    "clinical",
                    "adverse_event",
                    "complaint",
                    "human_request",
                    "unknown",
                  ],
                },
                action: { type: "string", enum: ["reply", "clarify", "escalate"] },
                operator: { type: "string", enum: ["doctor", "karen", "none"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                reply: { type: "string", maxLength: 1200 },
                reasonCode: {
                  type: "string",
                  enum: [
                    "safe_admin",
                    "safe_commercial",
                    "needs_city",
                    "needs_context",
                    "clinical_boundary",
                    "adverse_event_boundary",
                    "complaint_boundary",
                    "human_requested",
                    "uncertain",
                  ],
                },
              },
              required: [
                "intent",
                "action",
                "operator",
                "confidence",
                "reply",
                "reasonCode",
              ],
            },
          },
        },
        instructions: systemInstructions,
        input: `City context: ${city}.\nIncoming WhatsApp message:\n${message}`,
        store: false,
        safety_identifier: privacySafeIdentifier(conversationId),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const payload = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("[hautlab-ai-triage] OpenAI request failed", {
        status: openaiResponse.status,
        requestId: openaiResponse.headers.get("x-request-id"),
      });
      return NextResponse.json({ error: "AI routing unavailable." }, { status: 502 });
    }

    const outputText = extractOutputText(payload);
    if (!outputText) {
      return NextResponse.json({ error: "AI routing returned no decision." }, { status: 502 });
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(outputText);
    } catch {
      return NextResponse.json({ error: "AI routing returned invalid JSON." }, { status: 502 });
    }

    const parsedDecision = modelDecisionSchema.safeParse(candidate);
    if (!parsedDecision.success) {
      return NextResponse.json({ error: "AI routing returned an invalid decision." }, { status: 502 });
    }

    const decision = applyHardGuardrails(parsedDecision.data);

    return NextResponse.json(
      {
        ...decision,
        model,
        automated: decision.action !== "escalate",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[hautlab-ai-triage] request failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json({ error: "AI routing unavailable." }, { status: 503 });
  }
}
