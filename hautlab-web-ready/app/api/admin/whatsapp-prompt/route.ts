import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  DEFAULT_WHATSAPP_SYSTEM_PROMPT,
  getWhatsAppPromptSettings,
  saveWhatsAppSystemPrompt,
} from "@/lib/whatsapp-prompt";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = 32 * 1024;
const payloadSchema = z.object({
  prompt: z.string().trim().min(500).max(24000),
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access.allowed) {
    return noStoreJson({ error: "unauthorized" }, { status: 401 });
  }

  const settings = await getWhatsAppPromptSettings();
  return noStoreJson({
    ...settings,
    defaultPrompt: DEFAULT_WHATSAPP_SYSTEM_PROMPT.trim(),
    canEdit: Boolean(access.isOwner || access.organizationRole === "org:admin"),
  });
}

export async function PUT(request: Request) {
  const access = await getAdminAccess();
  const canEdit = Boolean(access.isOwner || access.organizationRole === "org:admin");
  if (!canEdit) return noStoreJson({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, maxBodyBytes)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
      return noStoreJson({ error: "payload_too_large" }, { status: 413 });
    }
    payload = JSON.parse(body);
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_prompt" }, { status: 400 });
  }

  try {
    const result = await saveWhatsAppSystemPrompt({
      prompt: parsed.data.prompt,
      updatedBy: access.email ?? access.userId,
    });
    return noStoreJson({ ok: true, updatedAt: result.updatedAt });
  } catch (error) {
    console.error("[whatsapp-prompt-admin] write failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStoreJson({ error: "save_failed" }, { status: 502 });
  }
}
