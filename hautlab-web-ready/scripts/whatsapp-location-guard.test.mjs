import test from "node:test";
import assert from "node:assert/strict";
import { applyWhatsAppLocationGuardrail } from "../lib/whatsapp-location-guard.ts";

const base = {
  intent: "information",
  action: "reply",
  operator: "none",
  reasonCode: "safe_admin",
  commercialStage: "exploring",
  nextBestAction: "answer",
  pendingQuestion: null,
};

test("ordinary price reply stays unchanged", () => {
  const decision = { ...base, intent: "pricing", reply: "La consulta cuesta $1,300 MXN." };
  assert.deepEqual(applyWhatsAppLocationGuardrail(decision, "¿Cuánto cuesta?"), decision);
});

test("model must not offer a choice of two cities", () => {
  const decision = {
    ...base,
    reply: "¿Prefieres atenderte en Mérida o Ciudad de México?",
    reasonCode: "needs_city",
  };
  const result = applyWhatsAppLocationGuardrail(decision, "Quiero información de rinomodelación");
  assert.equal(result.action, "escalate");
  assert.equal(result.operator, "karen");
  assert.match(result.reply, /Mérida/);
  assert.doesNotMatch(result.reply, /CDMX|Ciudad de México/i);
});

test("explicit request for CDMX gets factual Mérida-only reply", () => {
  const result = applyWhatsAppLocationGuardrail(
    { ...base, reply: "También tenemos atención en CDMX." },
    "¿Hay consulta en CDMX?",
  );
  assert.equal(result.reply, "Por ahora atendemos únicamente en Mérida, Yucatán.");
  assert.equal(result.action, "reply");
  assert.equal(result.operator, "none");
});

test("generated city question is intercepted without naming another city", () => {
  const result = applyWhatsAppLocationGuardrail(
    { ...base, reply: "¿En qué ciudad prefieres atenderte?" },
    "Quiero información sobre botox",
  );
  assert.equal(result.action, "escalate");
  assert.doesNotMatch(result.reply, /ciudad de mexico|cdmx/i);
});

test("model needs_city reason is intercepted even with vague response", () => {
  const result = applyWhatsAppLocationGuardrail(
    { ...base, reasonCode: "needs_city", reply: "¿Dónde?" },
    "Hola",
  );
  assert.equal(result.action, "escalate");
});

test("never modifies urgent clinical handoffs", () => {
  for (const intent of ["clinical", "adverse_event"]) {
    const decision = {
      ...base,
      intent,
      action: "escalate",
      operator: "doctor",
      reply: "Acude a urgencias de inmediato; debes ser valorado por un médico.",
    };
    assert.deepEqual(applyWhatsAppLocationGuardrail(decision, "Tengo dolor intenso"), decision);
  }
});
