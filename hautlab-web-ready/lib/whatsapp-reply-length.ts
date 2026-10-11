/**
 * Final WhatsApp length guardrail for model-generated replies.
 * Never cut text at a character boundary: that can hide a price, date, condition,
 * or urgent-care instruction. Exceptionally verbose nonclinical replies are
 * routed to the team instead of sending an incomplete answer.
 */
export const WHATSAPP_REPLY_TARGET_CHARS = 140;
export const WHATSAPP_REPLY_MAX_CHARS = 220;

export type WhatsAppReplyGuardrailInput = {
  reply: string;
  intent: string;
  action: "reply" | "clarify" | "escalate";
  operator: "doctor" | "karen" | "none";
  reasonCode: string;
  nextBestAction: string;
  commercialStage: string;
  bookingDate?: string | null;
};

export function applyWhatsAppReplyLengthGuardrail<T extends WhatsAppReplyGuardrailInput>(
  decision: T,
): T {
  if (!decision.reply) return decision;

  // Clinical and adverse-event responses may need urgent-care details.
  if (
    decision.intent === "clinical" ||
    decision.intent === "adverse_event" ||
    decision.operator === "doctor"
  ) {
    return decision;
  }

  const clean = decision.reply
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim()
    .replace(/^(?:Claro|Perfecto|Excelente|Con gusto)[,.:!]\s*/iu, "");

  if (clean.length <= WHATSAPP_REPLY_MAX_CHARS) {
    return clean === decision.reply ? decision : { ...decision, reply: clean };
  }

  // Booking is resolved by Nimbo downstream. Keep booking metadata intact so
  // the scheduler can still use the requested day and offer verified slots.
  if (decision.intent === "booking") {
    return {
      ...decision,
      reply: decision.bookingDate
        ? "El equipo puede ayudarte a confirmar la disponibilidad."
        : "¿Qué día te funciona?",
    };
  }

  // Preserve existing human handoffs without repeating the model's essay.
  if (decision.action === "escalate" && decision.operator === "karen") {
    return {
      ...decision,
      reply: "El equipo revisará tu solicitud.",
    };
  }

  // Do not blindly truncate quotes or informational answers. An exceptional
  // long response becomes a human handoff rather than a misleading fragment.
  return {
    ...decision,
    action: "escalate",
    operator: "karen",
    reasonCode: "uncertain",
    nextBestAction: "escalate",
    commercialStage: "human_review",
    reply: "Te canalizo con el equipo para darte una respuesta precisa.",
  };
}
