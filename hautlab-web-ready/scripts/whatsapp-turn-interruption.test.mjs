import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

// Regression guard: a patient reply must never undo human takeover automatically.
test("human handoff remains paused until an operator explicitly resumes it", () => {
  const source = readFileSync(new URL("../lib/whatsapp-orchestrator.ts", import.meta.url), "utf8");
  assert.match(source, /bot_paused:\s*true,[\s\S]*?paused_reason:\s*"manual_reply"/);
  assert.match(source, /if \(!conversation \|\| conversation\.bot_paused\) return "off"/);
  assert.match(source, /const mode = await currentAutomationMode\(conversation\.id\)/);
  assert.doesNotMatch(source, /resumeAfterHumanReplyIfSafe|canResumeAfterHumanReply/);
});


test("outbound automatic replies are protected by an atomic per-inbound claim", () => {
  const source = readFileSync(new URL("../lib/whatsapp-orchestrator.ts", import.meta.url), "utf8");
  assert.match(source, /rpc\/wa_claim_auto_reply/);
  assert.match(source, /return sendClaimedReply\(/);
  assert.match(source, /if \(!input\.metaMessageId\) return;/);
  assert.match(source, /wa_auto_reply_claims\?id=eq\./);
  assert.match(source, /sent_at: new Date\(\)\.toISOString\(\)/);
  assert.equal((source.match(/sendWhatsAppText\(/g) ?? []).length, 8);
  assert.equal((source.match(/sendWhatsAppUnclaimedText\(/g) ?? []).length, 2);
});

// Distinct questions may legitimately receive the same price or scheduling text.
test("new turns are not discarded by a reply-body time window", () => {
  const source = readFileSync(new URL("../lib/whatsapp-orchestrator.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /recentlySentIdenticalAutomatedReply/);
  const store = source.slice(source.indexOf("async function storeSentMessage("), source.indexOf("function effectiveMode("));
  assert.ok(store.indexOf("if (!input.metaMessageId) return;") < store.indexOf("last_team_message_at:"));
  assert.equal((source.match(/last_team_message_at: new Date\(\)\.toISOString\(\)/g) ?? []).length, 1);
});
