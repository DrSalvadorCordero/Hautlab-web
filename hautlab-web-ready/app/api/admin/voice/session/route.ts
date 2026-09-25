import { NextRequest, NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";
import { buildVoiceReceptionInstructions } from "@/lib/voice/hautlab-voice-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 96 * 1024;

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

export async function POST(request: NextRequest) {
  const access = await getAdminAccess();
  const allowed = Boolean(
    access.allowed && (access.isOwner || access.organizationRole === "org:admin"),
  );
  if (!allowed) return json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) {
    return json({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, MAX_BODY_BYTES)) {
    return json({ error: "payload_too_large" }, { status: 413 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return json({ error: "openai_not_configured" }, { status: 503 });

  let sdp = "";
  try {
    const body = (await request.json()) as { sdp?: unknown };
    if (typeof body.sdp === "string") sdp = body.sdp.trim();
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  if (!sdp || Buffer.byteLength(sdp, "utf8") > MAX_BODY_BYTES) {
    return json({ error: "invalid_sdp" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/live/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": access.userId ?? "hautlab-admin",
      },
      body: JSON.stringify({
        session: {
          model: "gpt-live-1",
          instructions: buildVoiceReceptionInstructions(),
          audio: {
            output: {
              voice: "marin",
            },
          },
          store: false,
        },
        transport: {
          type: "webrtc",
          sdp,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    const text = await response.text();
    if (!response.ok) {
      let providerError: { error?: { type?: string; code?: string; param?: string } } = {};
      try {
        providerError = JSON.parse(text) as typeof providerError;
      } catch {
        providerError = {};
      }
      console.error("[hautlab-voice] live session creation failed", {
        status: response.status,
        type: providerError.error?.type ?? null,
        code: providerError.error?.code ?? null,
        param: providerError.error?.param ?? null,
      });
      return json({ error: "live_session_failed" }, { status: response.status });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return json({ error: "invalid_live_response" }, { status: 502 });
    }

    return json(payload, { status: 201 });
  } catch (error) {
    console.error("[hautlab-voice] live session request failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return json({ error: "live_session_unavailable" }, { status: 502 });
  }
}
