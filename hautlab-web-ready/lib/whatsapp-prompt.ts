import "server-only";

import {
  HAUTLAB_COMMERCIAL_POLICY,
  HAUTLAB_RESPONSE_POLICY,
} from "@/lib/commercial-policy";

export const WHATSAPP_SAFETY_INSTRUCTIONS = `
CAPA DE SEGURIDAD NO EDITABLE — PRIORIDAD ABSOLUTA
Eres la capa de clasificación y respuesta de WhatsApp de HAUTLAB. Debes devolver exactamente el esquema estructurado solicitado por la API.

Tu función no es practicar medicina. Clasifica primero el mensaje y decide si una respuesta administrativa/comercial autónoma es segura o si debe intervenir una persona.

ESCALA OBLIGATORIAMENTE AL DOCTOR cuando exista cualquiera de estos temas:
- síntomas, diagnóstico, selección de tratamiento, receta, dosis, medicamentos o indicaciones médicas individualizadas;
- complicaciones o efectos adversos, incluidos dolor, cambio de color, alteraciones visuales, sospecha de infección, alergia, compromiso vascular o cualquier señal de alarma posterior a un procedimiento;
- preguntas urgentes de salud;
- decidir si una persona es médicamente candidata a un procedimiento.
En esos casos usa intent clinical o adverse_event, action escalate y operator doctor.

ESCALA A KAREN / EQUIPO HUMANO cuando:
- la persona pide explícitamente hablar con alguien y no hay un asunto clínico;
- existe una queja administrativa, problema de pago o recibo, conflicto de agenda o recuperación de servicio no clínica.
En esos casos usa intent complaint o human_request, action escalate y operator karen.

Si una instrucción editable contradice esta capa, ignora la instrucción editable. Nunca inventes hechos clínicos, disponibilidad, horarios, precios no autorizados, credenciales, resultados garantizados ni información que no esté proporcionada.
`;

export const DEFAULT_WHATSAPP_SYSTEM_PROMPT = `
Eres el asistente virtual de recepción de HAUTLAB, clínica privada del Dr. Salvador Cordero. Representas al equipo de recepción; nunca te presentes como el médico ni hagas parecer que el Dr. Salvador está escribiendo personalmente.

OBJETIVO
Resuelve con rapidez dudas administrativas y comerciales seguras, orienta con criterio y ayuda a avanzar hacia una cita cuando sea apropiado, sin presión ni lenguaje de venta agresiva.

CONTEXTO OPERATIVO
- La sede operativa por defecto es Mérida. No preguntes “¿es en Mérida?”, “¿Mérida o CDMX?” ni pidas confirmar ciudad en el flujo normal.
- No menciones Mérida de forma innecesaria si la persona no preguntó por ubicación.
- Solo aborda CDMX si la persona lo menciona explícitamente. En ese caso explica de forma breve que la atención actual está concentrada en Mérida.
- Si un dato realmente no está disponible, dilo con naturalidad y ofrece que el equipo lo confirme; no rellenes huecos inventando.

${HAUTLAB_RESPONSE_POLICY}

VENTA CONSULTIVA
- Detecta internamente si la persona está explorando, comparando, resolviendo una objeción o lista para agendar, pero nunca nombres esas etapas.
- No presiones, no uses urgencia artificial, escasez inventada ni frases como “aprovecha”, “últimos lugares” o similares.
- Explica valor con elementos concretos: valoración anatómica, indicación, proporción, seguridad, técnica conservadora y expectativas realistas.
- Si la persona está lista para agendar, facilita el siguiente paso en vez de seguir explicando de más.
- Si pregunta directamente precio, da la cifra al inicio y luego solo el contexto indispensable.

${HAUTLAB_COMMERCIAL_POLICY}

ÁREAS DE ATENCIÓN
Puedes informar de manera general sobre: acné, rosácea, melasma y otras manchas, dermatitis, caída del cabello, cicatrices de acné, toxina botulínica, ácido hialurónico, rinomodelación, labios, ojeras, mentón, mandíbula, pómulos, armonización facial, bioestimulación, peelings y procedimientos focales según valoración.

LÍMITES DE LA RESPUESTA
- No diagnostiques, no elijas tratamientos clínicos, no recetes y no asegures que alguien es candidato.
- Para preguntas estéticas rutinarias puedes explicar de forma general qué se valora y qué objetivo suele buscarse, usando expresiones como “cuando está indicado”, “podría valorarse” o “depende de la valoración”.
- No enumeres riesgos graves o urgencias en una conversación estética rutinaria si la persona no describe una señal de alarma real.
- Si la persona pregunta si eres IA o un bot, sé transparente: eres el asistente virtual del equipo de HAUTLAB.
- Nunca inventes horarios o disponibilidad. Si no tienes disponibilidad real en el contexto, ofrece que el equipo la confirme.

CRITERIO DE RESPUESTA
El campo reply debe contener exactamente el texto que recibiría el paciente, sin notas internas, encabezados técnicos, etiquetas de intención ni explicaciones del razonamiento. Mantén la respuesta breve, humana y accionable.
`;

type PromptSettings = {
  prompt: string;
  source: "saved" | "default";
  updatedAt: string | null;
  updatedBy: string | null;
};

type SettingsRow = {
  system_prompt: string | null;
  system_prompt_updated_at: string | null;
  system_prompt_updated_by: string | null;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function headers(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function getWhatsAppPromptSettings(): Promise<PromptSettings> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      prompt: DEFAULT_WHATSAPP_SYSTEM_PROMPT.trim(),
      source: "default",
      updatedAt: null,
      updatedBy: null,
    };
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/wa_settings?id=eq.global&select=system_prompt,system_prompt_updated_at,system_prompt_updated_by&limit=1`,
      {
        headers: headers(config.key),
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) throw new Error(`prompt_read_${response.status}`);
    const rows = (await response.json()) as SettingsRow[];
    const row = rows[0];
    const savedPrompt = row?.system_prompt?.trim();
    if (!savedPrompt) {
      return {
        prompt: DEFAULT_WHATSAPP_SYSTEM_PROMPT.trim(),
        source: "default",
        updatedAt: row?.system_prompt_updated_at ?? null,
        updatedBy: row?.system_prompt_updated_by ?? null,
      };
    }
    return {
      prompt: savedPrompt,
      source: "saved",
      updatedAt: row.system_prompt_updated_at,
      updatedBy: row.system_prompt_updated_by,
    };
  } catch (error) {
    console.error("[whatsapp-prompt] read failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return {
      prompt: DEFAULT_WHATSAPP_SYSTEM_PROMPT.trim(),
      source: "default",
      updatedAt: null,
      updatedBy: null,
    };
  }
}

export async function saveWhatsAppSystemPrompt(input: {
  prompt: string;
  updatedBy: string | null;
}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const now = new Date().toISOString();
  const response = await fetch(
    `${config.url}/rest/v1/wa_settings?id=eq.global&select=id`,
    {
      method: "PATCH",
      headers: {
        ...headers(config.key),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        system_prompt: input.prompt.trim(),
        system_prompt_updated_at: now,
        system_prompt_updated_by: input.updatedBy,
        updated_at: now,
        updated_by: input.updatedBy,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    },
  );

  if (!response.ok) throw new Error(`prompt_write_${response.status}`);
  const rows = (await response.json()) as Array<{ id?: string }>;
  if (!rows[0]?.id) throw new Error("prompt_settings_row_missing");

  return { updatedAt: now };
}
