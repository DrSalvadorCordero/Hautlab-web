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
