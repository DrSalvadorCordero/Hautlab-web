import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getHautlabPlan,
  hautlabPlanAccessCookieName,
} from "@/lib/server/hautlab-plan";
import {
  VISUAL_INTAKE_CONSENT_VERSION,
  VISUAL_INTAKE_KINDS,
  VISUAL_INTAKE_MAX_BYTES,
  VISUAL_INTAKE_MIME_TYPES,
  confirmVisualIntakeUpload,
  createVisualIntakeUpload,
  deleteVisualIntakeAsset,
} from "@/lib/server/hautlab-intake";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("sign"),
    code: z.string().regex(/^HLP-[A-Z0-9]{8}$/),
    kind: z.enum(VISUAL_INTAKE_KINDS),
    mimeType: z.enum(VISUAL_INTAKE_MIME_TYPES),
    sizeBytes: z.number().int().positive().max(VISUAL_INTAKE_MAX_BYTES),
    consentAccepted: z.literal(true),
    consentVersion: z.literal(VISUAL_INTAKE_CONSENT_VERSION),
  }),
  z.object({
    action: z.literal("complete"),
    code: z.string().regex(/^HLP-[A-Z0-9]{8}$/),
    assetId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("delete"),
    code: z.string().regex(/^HLP-[A-Z0-9]{8}$/),
    assetId: z.string().uuid(),
  }),
]);

function json(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return NextResponse.json(value, { ...init, headers });
}

async function authorizedPlan(request: NextRequest, code: string) {
  const token = request.cookies.get(hautlabPlanAccessCookieName(code))?.value;
  if (!token) return null;
  return getHautlabPlan(code, token);
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return json({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, MAX_BODY_BYTES)) {
    return json({ error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, { status: 413 });
    }
    raw = JSON.parse(body);
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "invalid_payload" }, { status: 400 });
  }

  const session = await authorizedPlan(request, parsed.data.code);
  if (!session) return json({ error: "unauthorized" }, { status: 401 });

  try {
    if (parsed.data.action === "sign") {
      const result = await createVisualIntakeUpload({
        planId: session.plan.id,
        kind: parsed.data.kind,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes,
      });
      return json(result, { status: 201 });
    }

    if (parsed.data.action === "complete") {
      const asset = await confirmVisualIntakeUpload(
        session.plan.id,
        parsed.data.assetId,
      );
      return json({ asset });
    }

    await deleteVisualIntakeAsset(session.plan.id, parsed.data.assetId);
    return json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "visual_intake_failed";
    const status =
      /limit|view_exists/.test(message)
        ? 409
        : /invalid|mismatch/.test(message)
          ? 400
          : /not_found/.test(message)
            ? 404
            : 502;
    console.error("[visual-intake] request failed", {
      action: parsed.data.action,
      reason: message.slice(0, 100),
    });
    return json({ error: message.slice(0, 100) }, { status });
  }
}
