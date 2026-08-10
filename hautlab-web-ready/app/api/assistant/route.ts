import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildAssistantInstructions,
  buildPriorityAssistantReply
} from "@/lib/assistant-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_BODY_BYTES = 18_000;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200)
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(10)
});

type RateBucket = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __hautlabAssistantRateLimit: Map<string, RateBucket> | undefined;
}

const rateBuckets = globalThis.__hautlabAssistantRateLimit ?? new Map<string, RateBucket>();
globalThis.__hautlabAssistantRateLimit = rateBuckets;

function json(body: Record<string, unknown>, status = 200, headers: HeadersInit = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      ...headers
    }
  });
}

function getClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

function applyRateLimit(identifier: string) {
  const now = Date.now();
  const existing = rateBuckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    };
  }

  existing.count += 1;
  rateBuckets.set(identifier, existing);

  if (rateBuckets.size > 5_000) {
    for (const [key, bucket] of rateBuckets.entries()) {
      if (bucket.resetAt <= now) rateBuckets.delete(key);
    }
  }

  return { allowed: true, retryAfter: 0 };
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const hostname = new URL(origin).hostname;
    return (
      hostname === "hautlabmx.com" ||
      hostname === "www.hautlabmx.com" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function needsEmergencyEscalation(text: string) {
  const normalized = text.toLowerCase();
  return [
    /no (puedo|puede) respirar/,
    /dificultad (grave )?para respirar/,
    /p[eé]rdida s[uú]bita de (la )?visi[oó]n/,
    /dej[eé] de ver/,
    /me estoy quedando (ciega|ciego)/,
    /no (puedo|puede) ver/,
    /visi[oó]n (borrosa|doble|alterada)/,
    /sangrado (abundante|incontrolable|que no para)/,
    /dolor (muy )?intenso (y )?(progresivo|repentino)/,
    /debilidad de un lado/,
    /confusi[oó]n repentina/,
    /fiebre alta.*(hinchaz[oó]n|enrojecimiento)/,
    /quiero (morir|suicidarme|hacerme da[nñ]o)/
  ].some((pattern) => pattern.test(normalized));
}

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

function extractResponseText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text?.trim()) return content.text.trim();
      if (content.type === "refusal" && content.refusal?.trim()) return content.refusal.trim();
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return json({ error: "Origen no permitido." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "La conversación excede el tamaño permitido." }, 413);
  }

  const identifier = getClientIdentifier(request);
  const rateLimit = applyRateLimit(identifier);
  if (!rateLimit.allowed) {
    return json(
      { error: "Has alcanzado el límite temporal del asistente. Puedes continuar por WhatsApp." },
      429,
      { "Retry-After": String(rateLimit.retryAfter) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return json({ error: "Revisa el mensaje e inténtalo nuevamente." }, 400);
  }

  const messages = parsed.data.messages.map((message) => ({
    role: message.role,
    content: message.content.replace(/\u0000/g, "").trim()
  }));

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (needsEmergencyEscalation(latestUserMessage)) {
    return json({
      reply:
        "Por lo que describes, no es adecuado continuar por este chat. Acude de inmediato a un servicio de urgencias o llama al número local de emergencias. Este asistente no puede evaluar ni tratar una urgencia."
    });
  }

  const userMessages = messages.filter((message) => message.role === "user");
  const priorityReply = buildPriorityAssistantReply(
    latestUserMessage,
    userMessages.length,
    userMessages
      .slice(0, -1)
      .map((message) => message.content)
      .join(" ")
  );
  if (priorityReply) {
    return json({ reply: priorityReply });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || /\s/.test(apiKey)) {
    console.error("HAUTLAB assistant configuration error", { reason: "invalid_api_key_format" });
    return json(
      { error: "El asistente está temporalmente fuera de servicio. Puedes continuar por WhatsApp." },
      503
    );
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-5-mini",
        store: false,
        instructions: buildAssistantInstructions(),
        input: messages,
        reasoning: { effort: "low" },
        max_output_tokens: 420
      }),
      signal: AbortSignal.timeout(22_000)
    });

    if (!openAIResponse.ok) {
      console.error("HAUTLAB assistant OpenAI error", {
        status: openAIResponse.status,
        requestId: openAIResponse.headers.get("x-request-id")
      });
      return json(
        { error: "No pude responder en este momento. Puedes continuar por WhatsApp." },
        openAIResponse.status === 429 ? 429 : 502
      );
    }

    const payload = (await openAIResponse.json()) as OpenAIResponsePayload;
    const reply = extractResponseText(payload);

    if (!reply) {
      return json({ error: "No pude generar una respuesta. Puedes continuar por WhatsApp." }, 502);
    }

    return json({ reply });
  } catch (error) {
    console.error("HAUTLAB assistant request failed", {
      name: error instanceof Error ? error.name : "UnknownError"
    });
    return json({ error: "No pude responder en este momento. Puedes continuar por WhatsApp." }, 502);
  }
}
