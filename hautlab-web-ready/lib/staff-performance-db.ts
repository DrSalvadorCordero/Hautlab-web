import "server-only";

export type RevenueLedgerRow = {
  month: string;
  revenue_owner: string;
  payment_channel: "cash" | "mercado_pago";
  payments: number;
  gross_revenue: number;
  commission: number;
};

export type StaffSnapshot = {
  month: string;
  operatorKey: string;
  displayName: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  totalPay: number;
  revenue: { cash: number; mercadoPago: number; total: number };
  attendance: {
    scheduledMinutes: number;
    workedMinutes: number;
    attendancePct: number;
    lateMinutes: number;
    lateCount: number;
    geofenceExitEvents: number;
    outsideMinutes: number;
  };
  leads: {
    assigned: number;
    responded: number;
    appointmentRequested: number;
    appointmentConfirmed: number;
  };
  score: number;
  scoreBreakdown: {
    attendance: number;
    response: number;
    booking: number;
    cashAccuracy: number;
    geofence: number;
    incidentDeduction: number;
  };
};

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
