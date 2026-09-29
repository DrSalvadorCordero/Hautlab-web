export type ConversationOperationalState =
  | "clinical_review"
  | "human_pending"
  | "booking_pending"
  | "reactivation"
  | "scheduled"
  | "closed"
  | "idle";

export type OperationalStateInput = {
  clinical_risk: boolean;
  risk_level: string | null;
  assigned_to: string | null;
  bot_paused: boolean;
  handoff_status: string | null;
  appointment_status: string | null;
  appointment_requested_at: string | null;
  last_patient_message_at: string | null;
  last_message_at: string | null;
  closed_at: string | null;
  outcome: string | null;
  created_at?: string | null;
};

function bookingActiveWindowMs() {
  const configured = Number(process.env.HAUTLAB_BOOKING_ACTIVE_HOURS ?? "72");
  const hours = Number.isFinite(configured)
    ? Math.max(12, Math.min(168, configured))
    : 72;
  return hours * 60 * 60 * 1000;
}

function bookingReferenceAt(row: OperationalStateInput) {
  return (
    row.last_patient_message_at ??
    row.appointment_requested_at ??
    row.last_message_at ??
    row.created_at ??
    null
  );
}

export function deriveConversationOperationalState(
  row: OperationalStateInput,
  now = Date.now(),
): ConversationOperationalState {
  if (row.closed_at || row.outcome) return "closed";
  if (row.clinical_risk || row.risk_level === "urgent") return "clinical_review";
  if (
    row.bot_paused ||
    row.handoff_status === "pending" ||
    row.handoff_status === "assigned" ||
    Boolean(row.assigned_to)
  ) {
    return "human_pending";
  }

  if (
    row.appointment_status === "collecting" ||
    row.appointment_status === "pending_confirmation"
  ) {
    const reference = Date.parse(bookingReferenceAt(row) ?? "");
    if (
      Number.isFinite(reference) &&
      now - reference <= bookingActiveWindowMs()
    ) {
      return "booking_pending";
    }
    return "reactivation";
  }

  if (row.appointment_status === "confirmed") return "scheduled";
  return "idle";
}

export function isOperationalPendingState(state: ConversationOperationalState) {
  return (
    state === "clinical_review" ||
    state === "human_pending" ||
    state === "booking_pending"
  );
}
