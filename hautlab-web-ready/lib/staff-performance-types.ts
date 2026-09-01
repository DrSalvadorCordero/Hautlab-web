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
