import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIGRATION_URL =
  "https://raw.githubusercontent.com/DrSalvadorCordero/Hautlab-web/7cfc9f54e4ff1b8979a3972199f6634b897119ad/docs/attendance.sql";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!host.endsWith(".vercel.app")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const connectionString = (
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
  )?.trim();

  if (!connectionString) {
    return NextResponse.json(
      { error: "postgres_connection_not_configured" },
      { status: 503 }
    );
  }

  const migrationResponse = await fetch(MIGRATION_URL, { cache: "no-store" });
  if (!migrationResponse.ok) {
    return NextResponse.json(
      { error: "migration_source_unavailable", status: migrationResponse.status },
      { status: 502 }
    );
  }

  const migration = await migrationResponse.text();
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    connect_timeout: 20,
    idle_timeout: 5
  });

  try {
    await sql.unsafe(migration).simple();
    await sql`select pg_notify('pgrst', 'reload schema')`;

    const tables = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name like 'attendance_%'
      order by table_name
    `;

    const functions = await sql<{ function_name: string }[]>`
      select p.proname as function_name
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname like 'attendance_%'
      order by p.proname
    `;

    return NextResponse.json(
      {
        ok: true,
        tables: tables.map((row) => row.table_name),
        functions: functions.map((row) => row.function_name)
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const record = error && typeof error === "object" ? (error as Record<string, unknown>) : null;
    return NextResponse.json(
      {
        error: "attendance_migration_failed",
        code: String(record?.code ?? "unknown"),
        message: error instanceof Error ? error.message : "unknown_error"
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}
