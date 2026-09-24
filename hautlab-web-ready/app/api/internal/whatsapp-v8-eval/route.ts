import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CASES = [
  { id: "cold_quote", message: "Solo estoy cotizando. Cuánto cuesta la rinomodelación?" },
  { id: "hot_book", message: "Me interesa la rinomodelación y quiero hacerlo esta semana. ¿Cómo agendo?" },
  { id: "price_objection", message: "Se me hace caro el relleno de labios, ¿por qué cuesta eso?" },
  { id: "comparison", message: "En otra clínica me cobran menos por la nariz. ¿Qué diferencia hay?" },
  { id: "fear", message: "Me da miedo verme muy operada. Quiero algo natural en los labios." },
  { id: "hot_tomorrow", message: "Quiero hacerme los labios mañana, ¿qué horarios tienes?" },
  { id: "decline", message: "Gracias, por ahora no quiero agendar." },
  { id: "trust", message: "¿Cómo sé que el resultado no se verá exagerado?" },
  { id: "clinical", message: "Tengo unas manchas nuevas y me pican, qué me pongo?" },
  { id: "adverse", message: "Después del relleno veo borroso de un ojo" },
];

export async function GET(request: NextRequest) {
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_GIT_COMMIT_REF !== "feat/whatsapp-brain-v8-conversion"
  ) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim();
  if (!internalKey) {
    return NextResponse.json({ error: "Internal API key missing." }, { status: 503 });
  }

  const origin = request.nextUrl.origin;
  const results = [];

  for (const testCase of CASES) {
    const response = await fetch(`${origin}/api/ai/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hautlab-internal-key": internalKey,
      },
      body: JSON.stringify({
        message: testCase.message,
        city: "merida",
      }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    results.push({
      id: testCase.id,
      status: response.status,
      ...payload,
    });
  }

  return NextResponse.json({ version: "v8-preview", results });
}
