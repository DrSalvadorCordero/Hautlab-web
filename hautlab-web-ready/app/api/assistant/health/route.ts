import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json(
    {
      status: configured ? "ready" : "missing_configuration"
    },
    {
      status: configured ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
