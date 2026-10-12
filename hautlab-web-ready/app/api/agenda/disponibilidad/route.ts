import { NextResponse } from "next/server";
import { publicAvailabilityFromSnapshot } from "@/lib/agenda-availability";
import {
  getNimboConfig,
  getNimboPublicAvailabilitySnapshot,
  isNimboReadyForAutobooking,
} from "@/lib/server/nimbo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getNimboConfig();
    if (!isNimboReadyForAutobooking(config)) {
      return NextResponse.json(
        { status: "unavailable", checkedAt: null, days: [] },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = publicAvailabilityFromSnapshot({
      snapshot: await getNimboPublicAvailabilitySnapshot(),
      now: Date.now(),
      minLeadMinutes: config.booking_min_lead_minutes,
    });
    // No patient identity, medical information or credentials leave the server.
    return NextResponse.json(result, {
      status: result.status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": result.status === "ok"
          ? "public, s-maxage=60, stale-while-revalidate=30"
          : "no-store",
      },
    });
  } catch {
    // Never expose upstream credentials, patient data or provider errors.
    return NextResponse.json(
      { status: "unavailable", checkedAt: null, days: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
