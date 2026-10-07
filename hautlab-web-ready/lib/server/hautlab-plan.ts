import { createHash, randomBytes } from "node:crypto";

export const PLAN_GOALS = [
  "rested",
  "definition",
  "profile",
  "lips",
  "texture",
  "acne",
  "skin_quality",
  "clinical_skin",
] as const;

export const PLAN_PRIORITIES = [
  "natural",
  "low_downtime",
  "single_visit",
  "skin_first",
] as const;

export type PlanGoal = (typeof PLAN_GOALS)[number];
export type PlanPriority = (typeof PLAN_PRIORITIES)[number];

type CatalogRow = {
  service_key: string;
  service_name: string;
  price_mxn: number | string | null;
  cash_price_mxn: number | string | null;
  installments: string | null;
  includes: string | null;
};

export type HautlabPlanRecommendation = {
  key: string;
  name: string;
  why: string;
  publicPrice: number | null;
  preferentialPrice: number | null;
  installments: string | null;
};

export type HautlabPlanSnapshot = {
  id: string;
  public_code: string;
  status: string;
  language: "es" | "en";
  goals: PlanGoal[];
  priorities: PlanPriority[];
  preferences: Record<string, unknown>;
  recommendations: HautlabPlanRecommendation[];
  estimated_range_min: number | null;
  estimated_range_max: number | null;
  currency: "MXN";
  conversation_id: string | null;
  created_at: string;
  last_opened_at: string | null;
};

export type HautlabPlanConversation = {
  appointment_status: string;
  appointment_datetime: string | null;
  appointment_requested_at: string | null;
  appointment_confirmed_at: string | null;
  next_action: string | null;
};

const GOAL_SERVICES: Record<PlanGoal, string[]> = {
  rested: ["upper_face_botulinum_toxin", "tear_trough_filler", "midface_cheek_filler"],
  definition: ["chin_jawline_filler", "masseter_toxin"],
  profile: ["rhinomodeling", "chin_jawline_filler"],
  lips: ["lip_filler"],
  texture: ["skin_reset_03", "fractional_rf", "chemical_peel"],
  acne: ["dermatology_consultation", "skin_reset_03", "fractional_rf"],
  skin_quality: ["collagen_biostimulator", "skin_reset_03"],
  clinical_skin: ["dermatology_consultation", "ndyag_laser", "chemical_peel"],
};

const WHY: Record<string, string> = {
  upper_face_botulinum_toxin: "Puede ayudar a suavizar líneas dinámicas cuando la valoración confirma que contribuyen a una apariencia cansada.",
  tear_trough_filler: "Puede considerarse cuando el soporte y la anatomía de la ojera son adecuados; requiere valoración individual.",
  midface_cheek_filler: "El soporte de tercio medio puede cambiar la lectura de cansancio o pérdida de estructura en pacientes seleccionados.",
  chin_jawline_filler: "Permite valorar proyección, proporción y continuidad del tercio inferior sin asumir que más volumen siempre es mejor.",
  masseter_toxin: "Puede ser útil cuando el volumen o la función del masetero participan en la forma facial.",
  rhinomodeling: "Permite valorar perfil y proporciones nasales con un enfoque conservador y dependiente de anatomía.",
  lip_filler: "Se plantea desde proporción, soporte y movimiento, no desde un volumen predeterminado.",
  skin_reset_03: "Un protocolo seriado puede ser útil cuando la prioridad es calidad de piel y mantenimiento progresivo.",
  fractional_rf: "Puede considerarse para textura y cicatrices cuando la indicación y el fototipo lo permiten.",
  chemical_peel: "La selección del peeling depende del objetivo, fototipo y tolerancia de la piel.",
  dermatology_consultation: "Cuando el objetivo puede tener un componente dermatológico, el diagnóstico médico debe ir antes del procedimiento.",
  collagen_biostimulator: "Puede formar parte de un plan de calidad de piel o soporte cuando la indicación es adecuada.",
  ndyag_laser: "La longitud de onda y el protocolo dependen de la lesión o indicación específica.",
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !key) throw new Error("supabase_not_configured");
  return { url, key };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
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
  if (!response.ok) {
    throw new Error(`supabase_error:${response.status}`);
  }
  return payload as T;
}

function numeric(value: number | string | null) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function makePublicCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `HLP-${suffix}`;
}

function makeAccessToken() {
  return randomBytes(24).toString("hex");
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

async function loadRecommendations(goals: PlanGoal[]) {
  const keys = unique(goals.flatMap((goal) => GOAL_SERVICES[goal])).slice(0, 8);
  if (!keys.length) return [] as HautlabPlanRecommendation[];

  const filter = keys.map((key) => encodeURIComponent(key)).join(",");
  const rows = await supabaseJson<CatalogRow[]>(
    `wa_service_catalog?service_key=in.(${filter})&active=eq.true&select=service_key,service_name,price_mxn,cash_price_mxn,installments,includes`,
  );
  const byKey = new Map(rows.map((row) => [row.service_key, row]));

  return keys
    .map((key) => byKey.get(key))
    .filter((row): row is CatalogRow => Boolean(row))
    .map((row) => ({
      key: row.service_key,
      name: row.service_name,
      why: WHY[row.service_key] ?? row.includes ?? "Se define después de una valoración médica individual.",
      publicPrice: numeric(row.price_mxn),
      preferentialPrice: numeric(row.cash_price_mxn),
      installments: row.installments,
    }))
    .slice(0, 5);
}

function estimateRange(recommendations: HautlabPlanRecommendation[]) {
  const prices = recommendations.flatMap((item) =>
    [item.preferentialPrice, item.publicPrice].filter(
      (value): value is number => typeof value === "number" && value > 0,
    ),
  );
  if (!prices.length) return { min: null, max: null };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export async function createHautlabPlan(input: {
  goals: PlanGoal[];
  priorities: PlanPriority[];
  preferences: Record<string, unknown>;
  language?: "es" | "en";
  sourcePath?: string | null;
}) {
  const recommendations = await loadRecommendations(input.goals);
  const estimate = estimateRange(recommendations);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const publicCode = makePublicCode();
    const accessToken = makeAccessToken();
    const accessTokenHash = hashAccessToken(accessToken);

    try {
      const rows = await supabaseJson<HautlabPlanSnapshot[]>(
        "hautlab_plans?select=id,public_code,status,language,goals,priorities,preferences,recommendations,estimated_range_min,estimated_range_max,currency,conversation_id,created_at,last_opened_at",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            public_code: publicCode,
            access_token_hash: accessTokenHash,
            status: "draft",
            language: input.language ?? "es",
            goals: input.goals,
            priorities: input.priorities,
            preferences: input.preferences,
            recommendations,
            estimated_range_min: estimate.min,
            estimated_range_max: estimate.max,
            source_path: input.sourcePath?.slice(0, 512) || null,
          }),
        },
      );
      const plan = rows[0];
      if (!plan) throw new Error("plan_create_failed");
      return { plan, accessToken };
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "supabase_error:409" || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("plan_create_failed");
}

export function extractHautlabPlanCode(value: string | null | undefined) {
  if (!value) return null;
  return value.match(/\b(HLP-[A-Z0-9]{8})\b/i)?.[1]?.toUpperCase() ?? null;
}

export function stripHautlabPlanReference(value: string | null) {
  if (!value) return null;
  const cleaned = value
    .replace(/(?:\n|\s)*(?:Plan|Código|Codigo)\s*:?\s*HLP-[A-Z0-9]{8}\s*$/i, "")
    .trim();
  return cleaned || null;
}

export async function attachHautlabPlanToConversation(input: {
  publicCode: string;
  conversationId: string;
  attributionCode?: string | null;
}) {
  const rows = await supabaseJson<Array<{ id: string }>>(
    `hautlab_plans?public_code=eq.${encodeURIComponent(input.publicCode)}&select=id&limit=1`,
  );
  const planId = rows[0]?.id;
  if (!planId) return false;

  await Promise.all([
    supabaseJson(
      `wa_conversations?id=eq.${encodeURIComponent(input.conversationId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ hautlab_plan_id: planId }),
      },
    ),
    supabaseJson(`hautlab_plans?id=eq.${encodeURIComponent(planId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        conversation_id: input.conversationId,
        status: "engaged",
        ...(input.attributionCode ? { attribution_code: input.attributionCode } : {}),
      }),
    }),
  ]);

  return true;
}

export async function getHautlabPlan(publicCode: string, accessToken: string) {
  if (!/^HLP-[A-Z0-9]{8}$/.test(publicCode) || !/^[a-f0-9]{48}$/.test(accessToken)) {
    return null;
  }
  const hash = hashAccessToken(accessToken);
  const rows = await supabaseJson<HautlabPlanSnapshot[]>(
    `hautlab_plans?public_code=eq.${encodeURIComponent(publicCode)}&access_token_hash=eq.${hash}&select=id,public_code,status,language,goals,priorities,preferences,recommendations,estimated_range_min,estimated_range_max,currency,conversation_id,created_at,last_opened_at&limit=1`,
  );
  const plan = rows[0];
  if (!plan) return null;

  await supabaseJson(`hautlab_plans?id=eq.${encodeURIComponent(plan.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      last_opened_at: new Date().toISOString(),
      status: plan.status === "draft" ? "shared" : plan.status,
    }),
  });

  let conversation: HautlabPlanConversation | null = null;
  if (plan.conversation_id) {
    const conversations = await supabaseJson<HautlabPlanConversation[]>(
      `wa_conversations?id=eq.${encodeURIComponent(plan.conversation_id)}&select=appointment_status,appointment_datetime,appointment_requested_at,appointment_confirmed_at,next_action&limit=1`,
    );
    conversation = conversations[0] ?? null;
  }

  return { plan, conversation };
}
