import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";
import {
  connectNimbo,
  disconnectNimbo,
  getNimboAvailability,
  getNimboConfig,
  isNimboReadyForAutobooking,
  updateNimboSettings,
  verifyNimboConnection,
} from "@/lib/server/nimbo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("connect"),
    baseUrl: z.string().trim().min(8).max(500),
    username: z.string().trim().min(3).max(320),
    password: z.string().min(1).max(1_000),
  }),
  z.object({
    action: z.literal("verify"),
  }),
  z.object({
    action: z.literal("update"),
    enabled: z.boolean().optional(),
    portalUrl: z.string().trim().max(1_000).nullable().optional(),
    consultationDurationMinutes: z.number().int().min(10).max(240).nullable().optional(),
  }),
  z.object({
    action: z.literal("disconnect"),
  }),
  z.object({
    action: z.literal("availability"),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
]);

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function publicConfig(config: Awaited<ReturnType<typeof getNimboConfig>>) {
  return {
    enabled: config.enabled,
    connected: Boolean(config.base_url && config.doctor_account_id),
    readyForAutobooking: isNimboReadyForAutobooking(config),
    baseUrl: config.base_url,
    doctorAccountId: config.doctor_account_id,
    doctorName: config.doctor_name,
    organizationId: config.organization_id,
    organizationSlug: config.organization_slug,
    locationId: config.location_id,
    timezone: config.timezone,
    consultationDurationMinutes: config.consultation_duration_minutes,
    portalUrl: config.portal_url,
    lastConnectedAt: config.last_connected_at,
    lastVerifiedAt: config.last_verified_at,
    lastError: config.last_error,
    updatedAt: config.updated_at,
  };
}

async function requireAdmin() {
  const access = await getAdminAccess();
  const allowed = Boolean(access.allowed && (access.isOwner || access.organizationRole === "org:admin"));
  return { access, allowed };
}

export async function GET() {
  const { allowed } = await requireAdmin();
  if (!allowed) return noStoreJson({ error: "unauthorized" }, { status: 401 });

  try {
    const config = await getNimboConfig();
    return noStoreJson({ config: publicConfig(config) });
  } catch {
    return noStoreJson({ error: "nimbo_status_unavailable" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const { allowed } = await requireAdmin();
  if (!allowed) return noStoreJson({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, MAX_BODY_BYTES)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return noStoreJson({ error: "payload_too_large" }, { status: 413 });
    }
    raw = JSON.parse(body);
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const payload = parsed.data;

    if (payload.action === "connect") {
      const config = await connectNimbo({
        baseUrl: payload.baseUrl,
        username: payload.username,
        password: payload.password,
      });
      return noStoreJson({ ok: true, config: publicConfig(config) });
    }

    if (payload.action === "verify") {
      const config = await verifyNimboConnection();
      return noStoreJson({ ok: true, config: publicConfig(config) });
    }

    if (payload.action === "update") {
      const config = await updateNimboSettings({
        enabled: payload.enabled,
        portalUrl: payload.portalUrl,
        consultationDurationMinutes: payload.consultationDurationMinutes,
      });
      return noStoreJson({ ok: true, config: publicConfig(config) });
    }

    if (payload.action === "disconnect") {
      const config = await disconnectNimbo();
      return noStoreJson({ ok: true, config: publicConfig(config) });
    }

    const days = await getNimboAvailability({
      from: payload.from,
      to: payload.to,
    });
    return noStoreJson({ ok: true, days });
  } catch (error) {
    const message = error instanceof Error ? error.message : "nimbo_request_failed";
    const status =
      /auth|credential|unauthorized/i.test(message)
        ? 401
        : /invalid|requires_https|payload/i.test(message)
          ? 400
          : /not_connected|not_ready/i.test(message)
            ? 409
            : 502;
    return noStoreJson(
      {
        error: message.slice(0, 300),
      },
      { status },
    );
  }
}
