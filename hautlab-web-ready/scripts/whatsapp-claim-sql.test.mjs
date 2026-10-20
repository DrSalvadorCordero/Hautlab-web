import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const { PGlite } = await import(process.env.HAUTLAB_PGLITE_MODULE || '@electric-sql/pglite');

test('actual PostgreSQL SQL contract with synthetic messages (single connection)', async () => {
 const db = new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create table wa_conversations(id uuid primary key default gen_random_uuid(),phone text unique,bot_paused boolean default false);
 create table wa_messages(id bigint generated always as identity primary key,conversation_id uuid references wa_conversations(id),meta_message_id text,direction text,created_at timestamptz default clock_timestamp());
 grant select,update on wa_conversations to service_role; grant select on wa_messages to service_role;
 insert into wa_conversations(phone) values('synthetic-a'),('synthetic-b');`);
 const migration=readFileSync(new URL('../supabase/migrations/20261020033100_wa_auto_reply_contract.sql',import.meta.url),'utf8');
 await db.exec(migration); await db.exec(migration); // repeat safely against an existing ledger
 const inbound=async(phone,id)=>db.query(`insert into wa_messages(conversation_id,meta_message_id,direction) select id,$2,'inbound' from wa_conversations where phone=$1`,[phone,id]);
 const claim=async(phone,id)=>(await db.query('select wa_claim_auto_reply($1,$2) as id',[phone,id])).rows[0].id;
 await inbound('synthetic-a','turn-1');
 await db.exec('set role service_role');
 const claims=await Promise.all(Array.from({length:100},()=>claim('synthetic-a','turn-1')));
 assert.equal(claims.filter(Boolean).length,1);
 await db.exec('reset role');
 await inbound('synthetic-a','turn-2');
 assert.ok(await claim('synthetic-a','turn-2'),'distinct inbound while previous reservation pending must survive');
 assert.equal(await claim('synthetic-a','turn-1'),null,'old inbound cannot send');
 await db.exec("update wa_auto_reply_claims set status='sent',sent_at=clock_timestamp()");
 await inbound('synthetic-a','turn-3');
 assert.ok(await claim('synthetic-a','turn-3'),'rapid follow-up after a sent reply must survive');
 await inbound('synthetic-b','other-turn');
 assert.ok(await claim('synthetic-b','other-turn'),'conversation isolation');
 await db.exec("update wa_conversations set bot_paused=true where phone='synthetic-a'");
 await inbound('synthetic-a','paused-turn');
 assert.equal(await claim('synthetic-a','paused-turn'),null);
 assert.equal(await claim('missing','missing'),null);
 assert.equal(await claim('synthetic-b',''),null);
 for (const role of ['anon','authenticated']) {
 await db.exec(`set role ${role}`);
 await assert.rejects(claim('synthetic-b','other-turn'),/permission denied/);
 await assert.rejects(db.query('select * from wa_auto_reply_claims'),/permission denied/);
 await db.exec('reset role');
 }
 assert.equal((await db.query('select count(*)::int as n from wa_messages')).rows[0].n,5,'all legitimate inbound persisted');
 } finally { await db.close(); }
});
