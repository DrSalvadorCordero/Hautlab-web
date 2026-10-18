import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { approveNote, prepareNote, unseal, matchesNote } from '../lib/server/nimbo-notes-core.ts';
const secret = 'a'.repeat(64);
const note = { personId: 101, consultationId: 202, accountId: 303, organizationId: 404,
  fullName: 'Paciente Sintético', birthDate: '1990-01-01', phone: '9990000000', comment: 'NOTA FICTICIA PARA PRUEBAS. Sin datos reales.', baseUrl: 'https://example.invalid/api/v1' };
function fixture() {
  const rows = new Map(); let creates = 0; let failCreate = false; let wrongReadback = false; let identityValid = true; let remoteRows = [];
  const store = {
    async insert(row) { if ([...rows.values()].some(r => r.digest === row.digest)) throw Error('duplicate_operation'); const op = { ...row, id: randomUUID() }; rows.set(op.id, op); return op; },
    async get(id, actor) { const r = rows.get(id); return r?.actor_id === actor ? { ...r } : null; },
    async claim(id, actor, digest, now) { const r = rows.get(id); if (!r || r.actor_id !== actor || r.digest !== digest || r.state !== 'draft' || r.expires_at <= now) return false; r.state = 'submitting'; return true; },
    async finish(id, state, remote_id, verified_at) { Object.assign(rows.get(id), { state, remote_id, verified_at }); },
  };
  const remote = {
    async validate() { if (!identityValid) throw Error('patient_identity_mismatch'); },
    async list() { return remoteRows; },
    async create(n) { creates++; if (failCreate) throw Error('timeout'); remoteRows = [{ id: 505, person_id: wrongReadback ? 999 : n.personId, consultation_id: n.consultationId, account_id: n.accountId, comment: n.comment, note_type: 'consultation' }]; return { medical_note: { id: 505 } }; },
  };
  return { rows, store, remote, get creates() { return creates; }, set failCreate(v) { failCreate = v; }, set wrongReadback(v) { wrongReadback = v; }, set identityValid(v) { identityValid = v; }, set remoteRows(v) { remoteRows = v; } };
}
async function ready(f) { return prepareNote(note, 'owner', secret, f.store, f.remote); }
function approval(d) { return { id: d.id, digest: d.digest, approved: true }; }
const send = (f, d, actor = 'owner', enabled = true) => approveNote(approval(d), actor, secret, f.store, f.remote, enabled);
test('preparation does not write to Nimbo, and encrypts clinical data', async () => {
  const f = fixture(); const d = await ready(f); assert.equal(f.creates, 0);
  const stored = f.rows.get(d.id); assert.ok(!stored.sealed.includes(note.comment)); assert.deepEqual(unseal(stored, secret), note);
});
test('write disabled blocks even valid approval', async () => { const f = fixture(); const d = await ready(f); await assert.rejects(send(f,d,'owner',false), /writes_disabled/); assert.equal(f.creates,0); });
test('different actor and changed digest cannot approve', async () => { const f=fixture();const d=await ready(f); await assert.rejects(send(f,d,'other'),/mismatch/); await assert.rejects(send(f,{...d,digest:'b'.repeat(64)}),/mismatch/); assert.equal(f.creates,0); });
test('explicit approval is required', async () => {const f=fixture();const d=await ready(f);await assert.rejects(approveNote({...approval(d),approved:false},'owner',secret,f.store,f.remote,true),/approval_required/);assert.equal(f.creates,0);});
test('expiry prevents writing',async()=>{const f=fixture();const d=await ready(f);f.rows.get(d.id).expires_at='2000-01-01T00:00:00.000Z';await assert.rejects(send(f,d),/expired/);assert.equal(f.creates,0);});
test('concurrent approval creates only one remote note',async()=>{const f=fixture();const d=await ready(f);const r=await Promise.allSettled([send(f,d),send(f,d)]);assert.equal(f.creates,1);assert.ok(r.some(x=>x.status==='fulfilled'));assert.equal(f.rows.get(d.id).state,'verified');});
test('verified operation replay returns same receipt without POST',async()=>{const f=fixture();const d=await ready(f);const a=await send(f,d);assert.deepEqual(await send(f,d),a);assert.equal(f.creates,1);});
test('timeout stays uncertain and never retries POST',async()=>{const f=fixture();const d=await ready(f);f.failCreate=true;await assert.rejects(send(f,d),/reconciliation_required/);await assert.rejects(send(f,d),/reconciliation_required/);assert.equal(f.creates,1);assert.equal(f.rows.get(d.id).state,'uncertain');});
test('wrong patient on readback is not success',async()=>{const f=fixture();const d=await ready(f);f.wrongReadback=true;await assert.rejects(send(f,d),/reconciliation_required/);assert.equal(f.rows.get(d.id).state,'uncertain');});
test('identity is checked again at approval',async()=>{const f=fixture();const d=await ready(f);f.identityValid=false;await assert.rejects(send(f,d),/identity_mismatch/);assert.equal(f.creates,0);});
test('new draft ID cannot bypass deduplication',async()=>{const f=fixture();await ready(f);await assert.rejects(ready(f),/duplicate_operation/);assert.equal(f.creates,0);});
test('canonical whitespace does not bypass digest deduplication',async()=>{const f=fixture();await ready(f);await assert.rejects(prepareNote({...note,comment:'  '+note.comment+'\n'},'owner',secret,f.store,f.remote),/duplicate_operation/);});
test('ciphertext alteration fails before write',async()=>{const f=fixture();const d=await ready(f);const op=f.rows.get(d.id);const b=Buffer.from(op.sealed,'base64');b[b.length-1]^=1;op.sealed=b.toString('base64');await assert.rejects(send(f,d));assert.equal(f.creates,0);});
test('existing remote note blocks prepare',async()=>{const f=fixture();f.remoteRows=[{id:505,person_id:101,consultation_id:202,account_id:303,comment:note.comment,note_type:'consultation'}];await assert.rejects(ready(f),/already_exists/);assert.equal(f.creates,0);});
test('malformed readback cannot verify and HTML is rejected',async()=>{assert.equal(matchesNote({},note),false);const f=fixture();await assert.rejects(prepareNote({...note,comment:'<script>x</script>'},'owner',secret,f.store,f.remote),/invalid_note/);assert.equal(f.creates,0);});
test('audit storage failure never returns success or retries',async()=>{const f=fixture();const d=await ready(f);f.store.finish=async()=>{throw Error('database down');};await assert.rejects(send(f,d),/reconciliation_required/);await assert.rejects(send(f,d),/reconciliation_required/);assert.equal(f.creates,1);});
