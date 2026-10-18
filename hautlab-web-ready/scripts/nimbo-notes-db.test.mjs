// Optional isolated Postgres test: PGLITE_MODULE_PATH=/absolute/path/to/pglite/dist/index.js node --test scripts/nimbo-notes-db.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const path = process.env.PGLITE_MODULE_PATH;
test('migration, access restrictions, immutable approval and audit in isolated Postgres', { skip: !path }, async () => {
  const { PGlite } = await import(path);
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(await readFile(new URL('../supabase/migrations/20261018122104_nimbo_clinical_note_approval.sql', import.meta.url), 'utf8'));
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query('select * from public.nimbo_note_operations'), /permission denied/);
      await assert.rejects(db.query('select * from public.nimbo_note_audit'), /permission denied/);
      await assert.rejects(db.query("insert into public.nimbo_note_operations(actor_id,digest,sealed,expires_at) values('synthetic','"+'a'.repeat(64)+"','encrypted-test',now()+interval '15 minutes')"), /permission denied/);
      await db.exec('reset role');
    }
    await db.exec('set role service_role');
    const {rows:[row]} = await db.query("insert into public.nimbo_note_operations(actor_id,digest,sealed,expires_at) values($1,$2,$3,now()+interval '15 minutes') returning id", ['synthetic','a'.repeat(64),'encrypted-test']);
    await assert.rejects(db.query("insert into public.nimbo_note_operations(actor_id,digest,sealed,expires_at) values($1,$2,$3,now()+interval '15 minutes')", ['synthetic','a'.repeat(64),'encrypted-test']), /unique constraint/);
    await assert.rejects(db.query("update public.nimbo_note_operations set sealed='tampered' where id=$1",[row.id]), /immutable_note_operation/);
    await assert.rejects(db.query("update public.nimbo_note_operations set state='verified',remote_id=1,verified_at=now(),approved_at=now() where id=$1",[row.id]), /invalid_note_transition/);
    const first=await db.query("update public.nimbo_note_operations set state='submitting',approved_at=now() where id=$1 and state='draft' returning id",[row.id]);
    const second=await db.query("update public.nimbo_note_operations set state='submitting',approved_at=now() where id=$1 and state='draft' returning id",[row.id]);
    assert.equal(first.rows.length,1);assert.equal(second.rows.length,0);
    await assert.rejects(db.query("update public.nimbo_note_operations set state='verified',verified_at=now() where id=$1",[row.id]), /check constraint/);
    await db.query("update public.nimbo_note_operations set state='verified',remote_id=505,verified_at=now() where id=$1",[row.id]);
    assert.deepEqual((await db.query('select state from public.nimbo_note_audit order by id')).rows.map(r=>r.state),['draft','submitting','verified']);
    await assert.rejects(db.query("update public.nimbo_note_operations set state='draft' where id=$1",[row.id]), /invalid_note_transition/);
    await assert.rejects(db.query('delete from public.nimbo_note_audit'),/permission denied/);
    await assert.rejects(db.query('delete from public.nimbo_note_operations'),/permission denied/);
  } finally { await db.close(); }
});
