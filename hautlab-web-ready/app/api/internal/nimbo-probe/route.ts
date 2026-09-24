import { NextRequest, NextResponse } from "next/server";
import {
  getNimboAvailability,
  isNimboReadyForAutobooking,
  verifyNimboConnection,
} from "@/lib/server/nimbo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROBE_KEY = "nimbo_probe_8W3k6Q2m";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("k") !== PROBE_KEY) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const config = await verifyNimboConnection();
    const days = await getNimboAvailability({
      from: "2026-09-24",
      to: "2026-09-30",
    });
    const slotCount = days.reduce((sum, day) => sum + day.slots.length, 0);
    return NextResponse.json(
      {
        ok: true,
        readyForAutobooking: isNimboReadyForAutobooking(config),
        enabled: config.enabled,
        timezone: config.timezone,
        consultationDurationMinutes: config.consultation_duration_minutes,
        bookingMinLeadMinutes: config.booking_min_lead_minutes,
        availableDays: days.filter((day) => day.slots.length > 0).length,
        slotCount,
        lastVerifiedAt: config.last_verified_at,
        lastError: config.last_error,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message.slice(0, 120) : "probe_failed",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
