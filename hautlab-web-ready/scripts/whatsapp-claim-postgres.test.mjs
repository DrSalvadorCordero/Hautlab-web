import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const run = promisify(execFile);
const url = process.env.HAUTLAB_TEST_POSTGRES_URL;
// Only a disposable local PostgreSQL service is allowed; never accept a cloud URL.
if (!url || !['localhost','127.0.0.1'].includes(new URL(url).hostname)) {
 throw Error('HAUTLAB_TEST_POSTGRES_URL must point to a disposable local database');
}
const sql = async (query) => (await run('psql', [url, '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', query], {maxBuffer: 1024*1024})).stdout.trim();
test('32 independent PostgreSQL connections reserve exactly one reply', async () => {
 await sql(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE wa_conversations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), phone text UNIQUE, bot_paused boolean DEFAULT false);
 CREATE TABLE wa_messages(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, conversation_id uuid REFERENCES wa_conversations(id), meta_message_id text, direction text, created_at timestamptz DEFAULT clock_timestamp());
 GRANT SELECT,UPDATE ON wa_conversations TO service_role; GRANT SELECT ON wa_messages TO service_role;
 INSERT INTO wa_conversations(phone) VALUES ('synthetic-only');
 INSERT INTO wa_messages(conversation_id,meta_message_id,direction) SELECT id,'turn-1','inbound' FROM wa_conversations;`);
 await sql(readFileSync(new URL('../supabase/migrations/20261020033100_wa_auto_reply_contract.sql',import.meta.url),'utf8'));
 const attempts = await Promise.all(Array.from({length:32},()=>sql("SET ROLE service_role; SELECT wa_claim_auto_reply('synthetic-only','turn-1');")));
 assert.equal(attempts.filter(value=>/[0-9a-f]{8}-[0-9a-f-]{27}/.test(value)).length,1);
 assert.equal(await sql('SELECT count(*) FROM wa_auto_reply_claims'), '1');
 await sql("INSERT INTO wa_messages(conversation_id,meta_message_id,direction) SELECT id,'turn-2','inbound' FROM wa_conversations;");
 assert.match(await sql("SET ROLE service_role; SELECT wa_claim_auto_reply('synthetic-only','turn-2');"), /[0-9a-f]{8}-/);
 assert.equal(await sql('SELECT count(*) FROM wa_messages'), '2');
});
