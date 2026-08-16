import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";
import { WHATSAPP_SAFETY_INSTRUCTIONS } from "@/lib/whatsapp-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = 128 * 1024;

const settingsSchema = z.object({
  action: z.literal("settings"),
  globalMode: z.enum(["off", "manual", "supervised", "automatic"]),
  emergencyStop: z.boolean(),
});

const knowledgeUpsertSchema = z.object({
  action: z.literal("knowledge-upsert"),
  id: z.string().uuid().optional(),
  knowledgeKey: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).nullable().optional(),
  title: z.string().trim().min(1).max(180),
  content: z.string().trim().min(1).max(12000),
  priority: z.number().int().min(0).max(999),
  active: z.boolean(),
  validFrom: z.string().trim().max(20).nullable().optional(),
  validUntil: z.string().trim().max(20).nullable().optional(),
  sourceNote: z.string().trim().max(500).nullable().optional(),
});

const knowledgeDeleteSchema = z.object({
  action: z.literal("knowledge-delete"),
  id: z.string().uuid(),
});

const serviceUpdateSchema = z.object({
  action: z.literal("service-update"),
  id: z.string().uuid(),
  priceMxn: z.number().nonnegative().max(1000000).nullable(),
  cashPriceMxn: z.number().nonnegative().max(1000000).nullable(),
  installments: z.string().trim().max(200).nullable(),
  includes: z.string().trim().max(2000).nullable(),
  notes: z.string().trim().max(2000).nullable(),
  active: z.boolean(),
});

const memoryUpdateSchema = z.object({
  action: z.literal("memory-update"),
  id: z.string().uuid(),
  conversationSummary: z.string().trim().max(5000).nullable(),
  patientGoal: z.string().trim().max(2000).nullable(),
  communicationStyle: z.string().trim().max(500).nullable(),
  language: z.string().trim().max(80).nullable(),
  pendingQuestion: z.string().trim().max(2000).nullable(),
  lastQuestionAsked: z.string().trim().max(2000).nullable(),
  objection: z.string().trim().max(2000).nullable(),
  appointmentDatePreference: z.string().trim().max(500).nullable(),
  appointmentTimePreference: z.string().trim().max(500).nullable(),
  knownFacts: z.record(z.unknown()),
  missingInformation: z.array(z.unknown()).max(100),
});

const payloadSchema = z.discriminatedUnion("action", [
  settingsSchema,
  knowledgeUpsertSchema,
  knowledgeDeleteSchema,
  serviceUpdateSchema,
  memoryUpdateSchema,
]);

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function supabaseHeaders(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...supabaseHeaders(config.key),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(7000),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return payload as T;
}

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

  try {
    const [settings, knowledge, services, memories] = await Promise.all([
      supabaseJson<
        Array<{
          global_mode: "off" | "manual" | "supervised" | "automatic";
          emergency_stop: boolean;
          updated_at: string | null;
          updated_by: string | null;
        }>
      >("wa_settings?id=eq.global&select=global_mode,emergency_stop,updated_at,updated_by&limit=1"),
      supabaseJson<
        Array<{
          id: string;
          knowledge_key: string;
          category: string;
          city: string | null;
          title: string;
          content: string;
          priority: number;
          active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          source_note: string | null;
          updated_at: string | null;
        }>
      >(
        "wa_knowledge_base?select=id,knowledge_key,category,city,title,content,priority,active,valid_from,valid_until,source_note,updated_at&order=priority.desc,updated_at.desc&limit=200",
      ),
      supabaseJson<
        Array<{
          id: string;
          city: string;
          service_key: string;
          service_name: string;
          price_mxn: string | number | null;
          cash_price_mxn: string | number | null;
          installments: string | null;
          includes: string | null;
          notes: string | null;
          active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          updated_at: string | null;
        }>
      >(
        "wa_service_catalog?select=id,city,service_key,service_name,price_mxn,cash_price_mxn,installments,includes,notes,active,valid_from,valid_until,updated_at&order=city.asc,service_name.asc&limit=200",
      ),
      supabaseJson<
        Array<{
          id: string;
          profile_name: string | null;
          phone: string;
          city: string | null;
          treatment: string | null;
          stage: string | null;
          conversation_summary: string | null;
          patient_goal: string | null;
          communication_style: string | null;
          language: string | null;
          pending_question: string | null;
          last_question_asked: string | null;
          objection: string | null;
          appointment_date_preference: string | null;
          appointment_time_preference: string | null;
          known_facts: Record<string, unknown> | null;
          missing_information: unknown[] | null;
          last_message_at: string | null;
        }>
      >(
        "wa_conversations?select=id,profile_name,phone,city,treatment,stage,conversation_summary,patient_goal,communication_style,language,pending_question,last_question_asked,objection,appointment_date_preference,appointment_time_preference,known_facts,missing_information,last_message_at&order=last_message_at.desc&limit=60",
      ),
    ]);

    return noStoreJson({
      canEdit: Boolean(access.isOwner || access.organizationRole === "org:admin"),
      routerModel: process.env.HAUTLAB_ROUTER_MODEL?.trim() || "gpt-5-mini",
      safetyInstructions: WHATSAPP_SAFETY_INSTRUCTIONS.trim(),
      settings: settings[0] ?? {
        global_mode: "supervised",
        emergency_stop: false,
        updated_at: null,
        updated_by: null,
      },
      knowledge,
      services,
      memories,
    });
  } catch (error) {
    console.error("[whatsapp-console-admin] read failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStoreJson({ error: "load_failed" }, { status: 502 });
  }
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

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
      return noStoreJson({ error: "payload_too_large" }, { status: 413 });
    }
    raw = JSON.parse(body);
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return noStoreJson(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const updatedBy = access.email ?? access.userId;

  try {
    const payload = parsed.data;

    if (payload.action === "settings") {
      await supabaseJson(
        "wa_settings?id=eq.global",
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            global_mode: payload.globalMode,
            emergency_stop: payload.emergencyStop,
            updated_at: now,
            updated_by: updatedBy,
          }),
        },
      );
      return noStoreJson({ ok: true, updatedAt: now });
    }

    if (payload.action === "knowledge-delete") {
      await supabaseJson(`wa_knowledge_base?id=eq.${encodeURIComponent(payload.id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      return noStoreJson({ ok: true });
    }

    if (payload.action === "knowledge-upsert") {
      const row = {
        knowledge_key: payload.knowledgeKey,
        category: payload.category,
        city: payload.city || null,
        title: payload.title,
        content: payload.content,
        priority: payload.priority,
        active: payload.active,
        valid_from: payload.validFrom || null,
        valid_until: payload.validUntil || null,
        source_note: payload.sourceNote || null,
        updated_at: now,
      };

      if (payload.id) {
        const result = await supabaseJson<Array<Record<string, unknown>>>(
          `wa_knowledge_base?id=eq.${encodeURIComponent(payload.id)}&select=*`,
          {
            method: "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(row),
          },
        );
        return noStoreJson({ ok: true, item: result[0] ?? null });
      }

      const result = await supabaseJson<Array<Record<string, unknown>>>(
        "wa_knowledge_base?select=*",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(row),
        },
      );
      return noStoreJson({ ok: true, item: result[0] ?? null });
    }

    if (payload.action === "service-update") {
      const result = await supabaseJson<Array<Record<string, unknown>>>(
        `wa_service_catalog?id=eq.${encodeURIComponent(payload.id)}&select=*`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            price_mxn: payload.priceMxn,
            cash_price_mxn: payload.cashPriceMxn,
            installments: payload.installments || null,
            includes: payload.includes || null,
            notes: payload.notes || null,
            active: payload.active,
            updated_at: now,
          }),
        },
      );
      return noStoreJson({ ok: true, item: result[0] ?? null });
    }

    const result = await supabaseJson<Array<Record<string, unknown>>>(
      `wa_conversations?id=eq.${encodeURIComponent(payload.id)}&select=*`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          conversation_summary: payload.conversationSummary || null,
          patient_goal: payload.patientGoal || null,
          communication_style: payload.communicationStyle || null,
          language: payload.language || null,
          pending_question: payload.pendingQuestion || null,
          last_question_asked: payload.lastQuestionAsked || null,
          objection: payload.objection || null,
          appointment_date_preference: payload.appointmentDatePreference || null,
          appointment_time_preference: payload.appointmentTimePreference || null,
          known_facts: payload.knownFacts,
          missing_information: payload.missingInformation,
          updated_at: now,
        }),
      },
    );

    return noStoreJson({ ok: true, item: result[0] ?? null });
  } catch (error) {
    console.error("[whatsapp-console-admin] write failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStoreJson({ error: "save_failed" }, { status: 502 });
  }
}
