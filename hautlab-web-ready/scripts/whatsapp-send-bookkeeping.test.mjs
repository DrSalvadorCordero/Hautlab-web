import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/whatsapp-orchestrator.ts', import.meta.url), 'utf8');
// Execute the actual timestamp-update blocks with fake persistence. This catches
// rejected sends hiding an unanswered turn without contacting Meta or patients.
const blocks = [...source.matchAll(/if \(metaMessageId\) \{\s*await updateConversation\((?:input\.conversation\.id|conversation\.id), \{\s*last_team_message_at: new Date\(\)\.toISOString\(\),\s*\}\);\s*\}/g)].map(m => m[0]);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

test('all five automatic-send timestamp paths preserve rejected turns', async () => {
  assert.equal(blocks.length, 5);
  for (const block of blocks) {
    const run = new AsyncFunction('metaMessageId', 'updateConversation', 'input', 'conversation', block);
    const updates = [];
    const persist = async (...args) => updates.push(args);
    const conversation = { id: 'synthetic-conversation' };
    await Promise.all(Array.from({ length: 50 }, () => run(null, persist, { conversation }, conversation)));
    assert.equal(updates.length, 0, 'concurrent rejected sends must not mark answered');
    await run('synthetic-meta-id', persist, { conversation }, conversation);
    assert.equal(updates.length, 1, 'accepted send must still mark answered');
    assert.equal(updates[0][0], conversation.id);
    assert.ok(Number.isFinite(Date.parse(updates[0][1].last_team_message_at)));
  }
});
