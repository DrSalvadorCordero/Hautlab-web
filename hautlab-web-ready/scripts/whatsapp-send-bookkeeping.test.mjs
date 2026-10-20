import assert from 'node:assert/strict';
import test from 'node:test';
import { persistSentReply, withRequiredHandoff } from '../lib/whatsapp-send-bookkeeping.ts';

test('50 rejected/stale claims never create outbound bookkeeping', async () => {
  let saved = 0;
  let timestamps = 0;
  const attempt = () => persistSentReply({
    metaMessageId: null,
    save: async () => { saved++; },
    markAnswered: async () => { timestamps++; },
    onTimestampError: () => { throw Error('should not be called'); },
  });
  assert.deepEqual(await Promise.all(Array.from({ length: 50 }, attempt)), Array(50).fill(false));
  assert.equal(saved, 0);
  assert.equal(timestamps, 0);
});

test('accepted outbound is persisted and marked answered once', async () => {
  let saved = 0;
  let timestamps = 0;
  assert.equal(await persistSentReply({
    metaMessageId: 'synthetic-meta-id',
    save: async () => { saved++; },
    markAnswered: async () => { timestamps++; },
    onTimestampError: () => { throw Error('unexpected'); },
  }), true);
  assert.equal(saved, 1);
  assert.equal(timestamps, 1);
});

test('timestamp PATCH outage cannot suppress clinical handoff', async () => {
  let saved = 0;
  let warnings = 0;
  let handoffs = 0;
  const result = await withRequiredHandoff(
    () => persistSentReply({
      metaMessageId: 'synthetic-meta-id',
      save: async () => { saved++; },
      markAnswered: async () => { throw Error('synthetic timestamp database outage'); },
      onTimestampError: () => { warnings++; },
    }),
    async () => { handoffs++; },
  );
  assert.equal(result, true);
  assert.equal(saved, 1);
  assert.equal(warnings, 1);
  assert.equal(handoffs, 1);
});

test('Meta error or persisted message insert failure still attempts human handoff', async () => {
  for (const failure of ['meta', 'message-insert']) {
    let handoffs = 0;
    await assert.rejects(
      withRequiredHandoff(async () => {
        if (failure === 'meta') throw Error('synthetic ambiguous Meta send');
        return persistSentReply({
          metaMessageId: 'synthetic-meta-id',
          save: async () => { throw Error('synthetic insert failure'); },
          markAnswered: async () => { throw Error('must not be called'); },
          onTimestampError: () => { throw Error('must not be called'); },
        });
      }, async () => { handoffs++; }),
    );
    assert.equal(handoffs, 1, failure);
  }
});

test('a denied reply can still trigger one protected operator handoff', async () => {
  let handoffs = 0;
  await withRequiredHandoff(
    () => persistSentReply({metaMessageId: null, save: async()=>{}, markAnswered: async()=>{}, onTimestampError: ()=>{}}),
    async () => { handoffs++; },
  );
  assert.equal(handoffs, 1);
});


test('both Meta and escalation failures remain inspectable without duplicate handoffs', async () => {
  const operationError = Error('synthetic Meta transport ambiguous');
  const handoffError = Error('synthetic operator escalation outage');
  let handoffs = 0;
  await assert.rejects(
    withRequiredHandoff(
      async () => { throw operationError; },
      async () => { handoffs++; throw handoffError; },
    ),
    error => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.message, 'whatsapp_operation_and_handoff_failed');
      assert.deepEqual(error.errors, [operationError, handoffError]);
      return true;
    },
  );
  assert.equal(handoffs, 1, 'must not attempt multiple operator handoffs');
});

test('successful reply still reports a failed mandatory handoff', async () => {
  const handoffError = Error('synthetic escalation unavailable');
  let handoffs = 0;
  await assert.rejects(withRequiredHandoff(
    async () => 'synthetic-reply-sent',
    async () => { handoffs++; throw handoffError; },
  ), error => error === handoffError);
  assert.equal(handoffs, 1);
});
