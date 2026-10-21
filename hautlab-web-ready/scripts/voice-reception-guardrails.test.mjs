import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const prompt = readFileSync(new URL("../lib/voice/hautlab-voice-prompt.ts", import.meta.url), "utf8");

// Synthetic situations only: verifies prompt policy, NOT real audio, Live or SIP behavior.
const scenarios = [
  ["saludo inicial", /SALUDO INICIAL[\s\S]*HAUTLAB, asistente virtual de recepción/],
  ["español por defecto", /español de México por defecto/],
  ["cambio al inglés", /persona habla en inglés, cambia a inglés/],
  ["responder primero", /Responde primero la pregunta concreta/],
  ["una pregunta por turno", /una sola pregunta por turno/],
  ["silencios", /Ante un silencio breve, espera/],
  ["interrupciones", /Si te interrumpen, deja de hablar/],
  ["precios y objeciones", /objeción de precio, explica solo lo autorizado/],
  ["cita no confirmada", /Solo considera una cita confirmada cuando el backend lo confirme/],
  ["sin inventar horarios", /Nunca inventes disponibilidad, citas, precios/],
  ["solicitud de humano", /Si pide hablar con una persona, acepta la solicitud/],
  ["sin transferencia ficticia", /no prometas que alguien ya recibió el aviso/],
  ["número equivocado", /Si es un número equivocado/],
  ["urgencia clínica", /pérdida súbita de visión, dificultad respiratoria/],
  ["sin saludos repetidos", /Saluda una sola vez/],
  ["sin muletillas", /Evita muletillas/],
];
for (const [scenario, expected] of scenarios) {
  test(`Voice prompt policy: ${scenario}`, () => {
    assert.match(prompt, expected);
  });
}

test("Voice price guard overrides general knowledge", () => {
  const knowledge = prompt.indexOf("${buildAssistantInstructions()}");
  const priceGuard = prompt.indexOf("PRECIOS Y AGENDA — RESTRICCIÓN PRIORITARIA");
  assert.ok(knowledge >= 0 && priceGuard > knowledge, "Current-price guard must follow potentially historical knowledge");
  assert.match(prompt.slice(priceGuard), /catálogo vigente verificado específicamente para esta sesión/);
  assert.match(prompt.slice(priceGuard), /no presentes una cifra como aproximación/);
});

test("Voice Lab never assumes phone or human transfer", () => {
  assert.match(prompt, /En Voice Lab no presupongas conexión telefónica ni transferencia humana/);
  assert.match(prompt, /no prometas que alguien ya recibió el aviso/);
});

test("Voice requires real backend booking confirmation", () => {
  assert.match(prompt, /Solo considera una cita confirmada cuando el backend lo confirme/);
  assert.match(prompt, /No ofrezcas horarios ni afirmes que una cita está reservada sin disponibilidad y confirmación reales del backend/);
});

test("Voice handles wrong number, interruptions and silence without restarting", () => {
  assert.match(prompt, /Si es un número equivocado, aclara brevemente que es HAUTLAB/);
  assert.match(prompt, /Si te interrumpen, deja de hablar, escucha y responde a la nueva intención/);
  assert.match(prompt, /No repitas el saludo ni reinicies la conversación/);
});

test("Voice template closes after the final guardrail", () => {
  assert.match(prompt, /PRECIOS Y AGENDA — RESTRICCIÓN PRIORITARIA[\s\S]*\n\x60;\s*\n\}/);
});
