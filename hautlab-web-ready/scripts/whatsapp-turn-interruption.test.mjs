import assert from "node:assert/strict";
import test from "node:test";
import { classifyNonBookingTurn } from "../lib/whatsapp-turn-interruption.ts";

const cases = [
  [
    "Mejor nos esperamos",
    "pause"
  ],
  [
    "Mejor esperamos",
    "pause"
  ],
  [
    "Prefiero esperar",
    "pause"
  ],
  [
    "Mejor espero",
    "pause"
  ],
  [
    "Por ahora no quiero agendar",
    "pause"
  ],
  [
    "Por el momento no quiero agendar",
    "pause"
  ],
  [
    "No quiero agendar",
    "pause"
  ],
  [
    "Ya no quiero agendar",
    "pause"
  ],
  [
    "Gracias, por ahora no quiero agendar",
    "pause"
  ],
  [
    "Lo voy a pensar",
    "pause"
  ],
  [
    "Voy a pensarlo",
    "pause"
  ],
  [
    "Mejor lo pienso",
    "pause"
  ],
  [
    "Mejor después",
    "pause"
  ],
  [
    "En otro momento",
    "pause"
  ],
  [
    "Ahorita no",
    "pause"
  ],
  [
    "No, gracias",
    "pause"
  ],
  [
    "Gracias",
    "courtesy"
  ],
  [
    "Muchas gracias",
    "courtesy"
  ],
  [
    "Mil gracias",
    "courtesy"
  ],
  [
    "Gracias por la información",
    "courtesy"
  ],
  [
    "Gracias por la info",
    "courtesy"
  ],
  [
    "Gracias por todo",
    "courtesy"
  ],
  [
    "Ok, gracias",
    "courtesy"
  ],
  [
    "No se preocupe",
    "courtesy"
  ],
  [
    "Gracias, ¿me puedes dar el precio?",
    null
  ],
  [
    "No se preocupe, siento un dolor muy fuerte",
    null
  ],
  [
    "Quiero cita mañana",
    null
  ],
  [
    "No quiero agendar para mañana, mejor viernes",
    null
  ],
  [
    "¿Cuánto cuesta la consulta?",
    null
  ],
  [
    "Sí, el horario de las 4",
    null
  ]
];

test("30 real-world inspired WhatsApp turn interruption classifications", async (t) => {
  assert.equal(cases.length, 30);
  for (const [input, expected] of cases) {
    await t.test(input, () => {
      const actual = classifyNonBookingTurn(input);
      assert.equal(actual?.kind ?? null, expected);
      if (actual) {
        assert.ok(actual.reply.length > 0);
        assert.equal(actual.resetBooking, expected === "pause");
        assert.doesNotMatch(actual.reply, /horarios disponibles|qué día|cuál prefieres/i);
      }
    });
  }
});
