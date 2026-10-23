import assert from "node:assert/strict";
import test from "node:test";
import { createVoiceGreetingGate } from "../lib/voice/voice-greeting-gate.ts";

test("only one greeting and one start are emitted per session", () => {
  const gate = createVoiceGreetingGate();
  assert.equal(gate.claimGreeting(), true);
  assert.equal(gate.claimGreeting(), false);
  assert.equal(gate.claimStart(), true);
  assert.equal(gate.claimStart(), false);
});

test("an unexpected greeting acknowledgment cannot start speech", () => {
  const gate = createVoiceGreetingGate();
  assert.equal(gate.claimStart(), false);
  assert.equal(gate.claimGreeting(), true);
  assert.equal(gate.claimStart(), true);
});

test("a new session can greet after cleanup", () => {
  const gate = createVoiceGreetingGate();
  assert.equal(gate.claimGreeting(), true);
  assert.equal(gate.claimStart(), true);
  gate.reset();
  assert.equal(gate.claimGreeting(), true);
  assert.equal(gate.claimStart(), true);
});
