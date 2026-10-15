/**
 * Location output guard for patient-facing WhatsApp triage replies.
 *
 * A saved prompt, an old conversation or model drift must never advertise a
 * second branch. This is evaluated after clinical hard guardrails and before
 * the reply-length guardrail.
 */
const otherCity = /\b(?:cdmx|ciudad\s+de\s+m[eé]xico|distrito\s+federal)\b/i;
const askingForCity =
  /(?:\b(?:en\s+)?qu[eé]\s+ciudad\b|\bcu[aá]l\s+sede\b|\b(?:prefieres|quieres|te\s+gustar[ií]a)\s+atenderte\s+en\b)/i;

type ReplyDecision = {
  intent: string;
  action: string;
  operator: string;
  reasonCode: string;
  commercialStage: string;
  nextBestAction: string;
  pendingQuestion: string | null;
  reply: string;
};

export function applyWhatsAppLocationGuardrail<T extends ReplyDecision>(
  decision: T,
  latestPatientMessage: string,
): T {
  // Never alter an adverse-event or clinical response.
  if (decision.intent === "clinical" || decision.intent === "adverse_event") {
    return decision;
  }

  const generatedOtherCity = otherCity.test(decision.reply);
  const generatedCityQuestion = askingForCity.test(decision.reply);
  if (
    !generatedOtherCity &&
    !generatedCityQuestion &&
    decision.reasonCode !== "needs_city"
  ) {
    return decision;
  }

  // A direct request for service in another location receives a clear factual
  // answer without presenting another clinic or an unverified booking offer.
  if (otherCity.test(latestPatientMessage)) {
    return {
      ...decision,
      reply: "Por ahora atendemos únicamente en Mérida, Yucatán.",
      intent: "information",
      action: "reply",
      operator: "none",
      reasonCode: "safe_admin",
      nextBestAction: "answer",
      pendingQuestion: null,
    } as T;
  }

  // Otherwise fail closed to the reception team rather than risk inventing a
  // city/branch or silently deleting price, booking or clinical details.
  return {
    ...decision,
    reply: "Atendemos únicamente en Mérida, Yucatán. Te canalizo con el equipo para continuar.",
    action: "escalate",
    operator: "karen",
    reasonCode: "uncertain",
    commercialStage: "human_review",
    nextBestAction: "escalate",
    pendingQuestion: null,
  } as T;
}
