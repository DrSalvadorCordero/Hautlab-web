import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function configured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!host.endsWith(".vercel.app")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();

  let attendancePaths: string[] = [];
  let schemaError: string | null = null;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: "application/openapi+json"
        },
        cache: "no-store"
      });
      const payload = await response.json();
      const paths = payload && typeof payload === "object" && "paths" in payload
        ? Object.keys((payload as { paths?: Record<string, unknown> }).paths ?? {})
        : [];
      attendancePaths = paths.filter((path) => path.includes("attendance"));
      if (!response.ok) schemaError = `HTTP ${response.status}`;
    } catch (error) {
      schemaError = error instanceof Error ? error.message : "schema_request_failed";
    }
  }

  return NextResponse.json({
    databaseUrls: {
      POSTGRES_URL: configured("POSTGRES_URL"),
      POSTGRES_URL_NON_POOLING: configured("POSTGRES_URL_NON_POOLING"),
      POSTGRES_PRISMA_URL: configured("POSTGRES_PRISMA_URL"),
      SUPABASE_DB_URL: configured("SUPABASE_DB_URL"),
      DATABASE_URL: configured("DATABASE_URL")
    },
    supabaseRestConfigured: Boolean(supabaseUrl && serviceRoleKey),
    attendancePaths,
    schemaError
  }, { headers: { "Cache-Control": "no-store" } });
}
