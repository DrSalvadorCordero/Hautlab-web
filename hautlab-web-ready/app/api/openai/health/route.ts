import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";

  if (!apiKey) {
    return NextResponse.json(
      {
        service: "hautlab-openai",
        status: "not_configured",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error("[openai-health] authentication failed", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
      });

      return NextResponse.json(
        {
          service: "hautlab-openai",
          status: "error",
          authenticated: false,
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      {
        service: "hautlab-openai",
        status: "ok",
        authenticated: true,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("[openai-health] request failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      {
        service: "hautlab-openai",
        status: "unavailable",
        authenticated: false,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
