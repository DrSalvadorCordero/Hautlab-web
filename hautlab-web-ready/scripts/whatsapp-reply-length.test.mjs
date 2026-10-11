import test from "node:test";
import assert from "node:assert/strict";
import {
  applyWhatsAppReplyLengthGuardrail,
  WHATSAPP_REPLY_MAX_CHARS,
  WHATSAPP_REPLY_TARGET_CHARS,
} from "../lib/whatsapp-reply-length.ts";

const base = {
  intent: "information",
  action: "reply",
  operator: "none",
  reasonCode: "safe_admin",
  nextBestAction: "answer",
  commercialStage: "exploring",
  bookingDate: null,
};

test("brief answers remain unchanged", () => {
  const decision = { ...base, reply: "La consulta dermatológica cuesta $1,300 MXN." };
  assert.deepEqual(applyWhatsAppReplyLengthGuardrail(decision), decision);
  assert.equal(WHATSAPP_REPLY_TARGET_CHARS, 140);
  assert.equal(WHATSAPP_REPLY_MAX_CHARS, 220);
});

test("unnecessary greeting is removed without touching the factual answer", () => {
  const reply = "Claro, La consulta dermatológica cuesta $1,300 MXN.";
  const result = applyWhatsAppReplyLengthGuardrail({ ...base, reply });
  assert.equal(result.reply, "La consulta dermatológica cuesta $1,300 MXN.");
});

test("necessary detail between 140 and 220 chars remains intact", () => {
  const reply = "La sesión incluye valoración y el tratamiento autorizado. " +
    "La tarifa disponible es de $2,900 MXN y cualquier cambio en el plan se confirma con el equipo.";
  assert.ok(reply.length > WHATSAPP_REPLY_TARGET_CHARS);
  assert.ok(reply.length <= WHATSAPP_REPLY_MAX_CHARS);
  assert.equal(applyWhatsAppReplyLengthGuardrail({ ...base, reply }).reply, reply);
});

test("overlong informational answers escalate instead of being truncated", () => {
  const result = applyWhatsAppReplyLengthGuardrail({ ...base, reply: "Una explicación muy extensa. ".repeat(20) });
  assert.equal(result.action, "escalate");
  assert.equal(result.operator, "karen");
  assert.equal(result.nextBestAction, "escalate");
  assert.equal(result.commercialStage, "human_review");
  assert.ok(result.reply.length <= WHATSAPP_REPLY_MAX_CHARS);
});

test("never cut an overlong commercial quote and lose a price", () => {
  const result = applyWhatsAppReplyLengthGuardrail({
    ...base,
    intent: "pricing",
    reply: "El plan cuesta $12,000 MXN; la alternativa cuesta $15,000 MXN. " + "Detalles complementarios. ".repeat(12),
  });
  assert.equal(result.action, "escalate");
  assert.equal(result.operator, "karen");
  assert.equal(result.reply.includes("$12,000"), false);
});

test("long booking replies preserve agenda metadata", () => {
  const result = applyWhatsAppReplyLengthGuardrail({
    ...base,
    intent: "booking",
    bookingDate: "2026-10-13",
    nextBestAction: "offer_slots",
    reply: "Una descripción larga sobre horarios de agenda. ".repeat(10),
  });
  assert.equal(result.intent, "booking");
  assert.equal(result.nextBestAction, "offer_slots");
  assert.equal(result.bookingDate, "2026-10-13");
  assert.equal(result.action, "reply");
  assert.ok(result.reply.length <= WHATSAPP_REPLY_MAX_CHARS);
});

test("long booking replies with missing date ask only one question", () => {
  const result = applyWhatsAppReplyLengthGuardrail({
    ...base,
    intent: "booking",
    bookingDate: null,
    nextBestAction: "ask_date",
    reply: "Una descripción larga sobre horarios de agenda. ".repeat(10),
  });
  assert.equal(result.reply, "¿Qué día te funciona?");
});

test("clinical and adverse event replies are never shortened", () => {
  const reply = "Acude a urgencias de inmediato si tienes síntomas de alarma. ".repeat(8);
  for (const intent of ["clinical", "adverse_event"]) {
    const decision = { ...base, intent, operator: "doctor", action: "escalate", reply };
    assert.deepEqual(applyWhatsAppReplyLengthGuardrail(decision), decision);
  }
});

test("nonclinical human handoffs are concise without changing the operator", () => {
  const result = applyWhatsAppReplyLengthGuardrail({
    ...base,
    intent: "complaint",
    operator: "karen",
    action: "escalate",
    reply: "Explicación administrativa extensa. ".repeat(15),
  });
  assert.equal(result.action, "escalate");
  assert.equal(result.operator, "karen");
  assert.ok(result.reply.length <= WHATSAPP_REPLY_MAX_CHARS);
});
