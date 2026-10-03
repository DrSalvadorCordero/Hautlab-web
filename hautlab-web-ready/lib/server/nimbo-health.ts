export type NimboAvailabilitySnapshot = {
  status: string;
  error: string | null;
  slot_count: number;
  checked_at: string;
};

// The hourly authenticated probe establishes health. Configuration alone
// cannot establish that Nimbo can return a real calendar.
export function classifyNimboAvailabilitySnapshot(
  snapshot: NimboAvailabilitySnapshot | null,
  now = Date.now(),
) {
  if (!snapshot) return { status: "degraded" as const, detail: "availability_not_verified" };
  if (snapshot.status === "error") {
    return { status: "down" as const, detail: snapshot.error || "availability_probe_failed" };
  }
  const checkedAt = Date.parse(snapshot.checked_at);
  if (snapshot.status !== "ok" || !Number.isFinite(checkedAt) || checkedAt > now || now - checkedAt > 90 * 60_000) {
    return { status: "degraded" as const, detail: "availability_probe_stale_or_invalid" };
  }
  return { status: "healthy" as const, detail: `availability_verified:slots=${snapshot.slot_count}` };
}
