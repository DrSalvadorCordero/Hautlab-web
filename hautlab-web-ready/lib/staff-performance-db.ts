import "server-only";
import type { RevenueLedgerRow, StaffSnapshot } from "@/lib/staff-performance-types";

export class StaffPerformanceDatabaseError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
    this.name = "StaffPerformanceDatabaseError";
  }
}

function config() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  return url && key ? { url, key } : null;
}

export function isStaffPerformanceConfigured() {
  return Boolean(config());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const current = config();
  if (!current) throw new StaffPerformanceDatabaseError("database_not_configured", 503);

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
    throw new StaffPerformanceDatabaseError(message, response.status);
  }
  return payload as T;
}

export async function getStaffSnapshot(month: string, operatorKey = "karen") {
  return request<StaffSnapshot>("rpc/hlstaff_monthly_snapshot", {
    method: "POST",
    body: JSON.stringify({ p_month: month, p_operator_key: operatorKey })
  });
}

export async function listRevenueLedger(month: string) {
  const query = new URLSearchParams({
    select: "month,revenue_owner,payment_channel,payments,gross_revenue,commission",
    month: `eq.${month}`,
    order: "revenue_owner.asc,payment_channel.asc"
  });
  return request<RevenueLedgerRow[]>(`hlstaff_revenue_ledger_monthly?${query}`);
}
