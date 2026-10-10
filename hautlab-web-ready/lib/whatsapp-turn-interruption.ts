export type NonBookingTurn =
  | { kind: "pause"; reply: string; resetBooking: true }
  | { kind: "courtesy"; reply: string; resetBooking: false };

function normalizeTurn(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .replace(/[¿?¡!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Exact whole-turn matches only: do not swallow messages that contain
// a clinical concern, a booking choice or a new substantive question.
const pauseTurns = new Set([
  "mejor nos esperamos",
  "mejor esperamos",
  "prefiero esperar",
  "mejor espero",
  "por ahora no quiero agendar",
  "por el momento no quiero agendar",
  "no quiero agendar",
  "ya no quiero agendar",
  "gracias por ahora no quiero agendar",
  "lo voy a pensar",
  "voy a pensarlo",
  "mejor lo pienso",
  "mejor despues",
  "en otro momento",
  "ahorita no",
  "no gracias",
  "mejor no gracias",
  "no me interesa",
  "ya no me interesa",
  "luego lo veo",
  "lo dejamos para despues",
  "lo dejamos para otro dia",
]);
const courtesyTurns = new Set([
  "gracias",
  "muchas gracias",
  "mil gracias",
  "gracias por la informacion",
  "gracias por la info",
  "gracias por todo",
  "ok gracias",
  "de acuerdo gracias",
  "no se preocupe",
  "no te preocupes",
]);

export function classifyNonBookingTurn(text: string): NonBookingTurn | null {
  const normalized = normalizeTurn(text);
  if (pauseTurns.has(normalized)) {
    return {
      kind: "pause",
      reply: "De acuerdo. Si decides retomarlo, aquí podemos ayudarte.",
      resetBooking: true,
    };
  }
  if (courtesyTurns.has(normalized)) {
    return {
      kind: "courtesy",
      reply: normalized.includes("preocup") ? "De acuerdo." : "A ti.",
      resetBooking: false,
    };
  }
  return null;
}
