import "server-only";

import type { GrowthOsSnapshot } from "@/lib/growth-os-types";\n\nexport class GrowthOsDatabaseError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
    this.name = "GrowthOsDatabaseError";
  }
}

function config() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  return url && key ? { url, key } : null;
}

export function isGrowthOsConfigured() {
  return Boolean(config());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const current = config();
  if (!current) throw new GrowthOsDatabaseError("database_not_configured", 503);

  const response = await fetch(`${current.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: current.key,
      Authorization: `Bearer ${current.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message?: unknown }).message)
      : `HTTP ${response.status}`;
    throw new GrowthOsDatabaseError(message, response.status);
  }
  return payload as T;
}

export async function getGrowthOsSnapshot(days: number) {
  return request<GrowthOsSnapshot>("rpc/growth_os_snapshot", {
    method: "POST",
    body: JSON.stringify({ p_days: days })
  });
}
