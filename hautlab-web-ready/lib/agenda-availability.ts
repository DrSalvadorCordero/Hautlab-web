export type PublicAppointmentSlot = { startsAt: string; label: string };
export type PublicAppointmentDay = {
  date: string;
  slots: PublicAppointmentSlot[];
};

export type PublicAppointmentAvailability = {
  status: "ok" | "stale" | "unavailable";
  checkedAt: string | null;
  days: PublicAppointmentDay[];
};

// This function intentionally strips every provider property except the
// calendar day, start time and locally formatted label. No patient data.
export function publicAvailabilityFromSnapshot(input: {
  snapshot: { status: string; checked_at: string; days: unknown } | null;
  now: number;
  minLeadMinutes: number;
}): PublicAppointmentAvailability {
  const { snapshot, now } = input;
  const checkedAt = snapshot?.checked_at ?? null;
  const checkedAtMs = Date.parse(checkedAt ?? "");
  if (
    !snapshot ||
    snapshot.status !== "ok" ||
    !Number.isFinite(checkedAtMs) ||
    !Array.isArray(snapshot.days)
  ) return { status: "unavailable", checkedAt: null, days: [] };

  // A stale cache is not a credible offer. The authenticated health probe
  // populates this snapshot independently of public requests.
  if (checkedAtMs > now + 2 * 60_000 || now - checkedAtMs > 75 * 60_000) {
    return { status: "stale", checkedAt, days: [] };
  }

  const earliest = now + Math.max(60, Math.min(1440, input.minLeadMinutes || 60)) * 60_000;
  const latest = now + 7 * 24 * 60 * 60_000;
  const dates = new Map<string, PublicAppointmentSlot[]>();
  const seen = new Set<string>();
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Merida", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const localTime = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Merida", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });

  for (const day of snapshot.days.slice(0, 14)) {
    if (!day || typeof day !== "object" || Array.isArray(day)) continue;
    const rawSlots = (day as { slots?: unknown }).slots;
    if (!Array.isArray(rawSlots)) continue;
    for (const item of rawSlots.slice(0, 100)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const startsAt = (item as { startsAt?: unknown }).startsAt;
      if (typeof startsAt !== "string") continue;
      const startMs = Date.parse(startsAt);
      if (!Number.isFinite(startMs) || startMs < earliest || startMs > latest) continue;
      const iso = new Date(startMs).toISOString();
      if (seen.has(iso)) continue;
      seen.add(iso);
      const date = localDate.format(new Date(startMs));
      const slot = { startsAt: iso, label: localTime.format(new Date(startMs)) };
      const group = dates.get(date) ?? [];
      group.push(slot);
      dates.set(date, group);
    }
  }

  return {
    status: "ok",
    checkedAt: new Date(checkedAtMs).toISOString(),
    days: [...dates.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(0, 8)
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 24),
      })),
  };
}
