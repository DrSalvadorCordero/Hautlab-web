import assert from 'node:assert/strict';
import test from 'node:test';
import { sendClaimedReply } from '../lib/whatsapp-claimed-send.ts';

function fixture(overrides = {}) {
 let reserved = false;
 const calls = { sends: 0, reviews: 0, confirms: 0, warnings: 0 };
 return { calls, deps: {
  claim: async () => { if (reserved) return null; reserved = true; return 'synthetic-claim'; },
  send: async () => { calls.sends++; await new Promise(resolve => setTimeout(resolve, 3)); return 'synthetic-outbound'; },
  confirm: async () => { calls.confirms++; },
  review: async () => { calls.reviews++; },
  confirmationFailed: () => { calls.warnings++; },
  ...overrides,
 } };
}
test('100 competing AI/Nimbo/media/escalation attempts send once', async () => {
 const { deps, calls } = fixture();
 const results = await Promise.all(Array.from({length:100}, () => sendClaimedReply(deps)));
 assert.equal(results.filter(Boolean).length, 1);
 assert.equal(calls.sends, 1); assert.equal(calls.confirms, 1);
});
test('denied or stale claim never calls transport', async () => {
 const {deps,calls} = fixture({claim:async()=>null});
 assert.equal(await sendClaimedReply(deps),null); assert.equal(calls.sends,0);
});
test('claim failure never calls transport', async () => {
 const {deps,calls}=fixture({claim:async()=>{throw Error('db unavailable');}});
 await assert.rejects(sendClaimedReply(deps)); assert.equal(calls.sends,0); assert.equal(calls.reviews,1);
});
for (const [label, send] of [['timeout',async()=>{throw Error('timeout');}],['missing Meta id',async()=>null]]) {
 test(`${label}: retains reservation, marks human review, never retries`,async()=>{
  const {deps,calls}=fixture({send});
  await assert.rejects(sendClaimedReply(deps)); assert.equal(calls.reviews,1);
  assert.equal(await sendClaimedReply(deps),null); assert.equal(calls.confirms,0);
 });
}
test('accepted send survives confirmation DB failure without resend',async()=>{
 const {deps,calls}=fixture({confirm:async()=>{throw Error('db unavailable');}});
 assert.equal(await sendClaimedReply(deps),'synthetic-outbound');
 assert.equal(await sendClaimedReply(deps),null);
 assert.equal(calls.sends,1); assert.equal(calls.warnings,1);
});
test('independent legitimate turns each send',async()=>{
 const a=fixture(),b=fixture();
 await Promise.all([sendClaimedReply(a.deps),sendClaimedReply(b.deps)]);
 assert.equal(a.calls.sends+b.calls.sends,2);
});
