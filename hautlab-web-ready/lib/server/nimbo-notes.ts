import { getNimboConfig, nimboClinicalRequest } from "./nimbo";
import { normalizeName, normalizePhone, positiveId, record, type Note, type NoteRemote, type NoteStore, type Operation } from "./nimbo-notes-core";

export async function notesDatabase<T>(path: string, init?: RequestInit): Promise<T> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("notes_database_not_configured");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init,
    headers: { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json", Prefer: "return=representation" },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(response.status === 409 ? "duplicate_operation" : "notes_database_unavailable");
  return await response.json() as T;
}
const table = "nimbo_note_operations";
export const noteStore: NoteStore = {
  async insert(row) { const rows = await notesDatabase<Operation[]>(table, { method: "POST", body: JSON.stringify(row) }); if (!rows[0]) throw new Error("draft_not_saved"); return rows[0]; },
  async get(id, actor) { return (await notesDatabase<Operation[]>(`${table}?id=eq.${encodeURIComponent(id)}&actor_id=eq.${encodeURIComponent(actor)}&limit=1`))[0] ?? null; },
  async claim(id, actor, digest, now) {
    const rows = await notesDatabase<Operation[]>(`${table}?id=eq.${encodeURIComponent(id)}&actor_id=eq.${encodeURIComponent(actor)}&digest=eq.${digest}&state=eq.draft&expires_at=gt.${encodeURIComponent(now)}`,
      { method: "PATCH", body: JSON.stringify({ state: "submitting", approved_at: now }) });
    return rows.length === 1;
  },
  async finish(id, state, remoteId, at) {
    const rows = await notesDatabase<Operation[]>(`${table}?id=eq.${encodeURIComponent(id)}&state=eq.submitting`,
      { method: "PATCH", body: JSON.stringify({ state, remote_id: remoteId, verified_at: at }) });
    if (rows.length !== 1) throw new Error("audit_not_saved");
  },
};
export const noteRemote: NoteRemote = {
  async validate(note) {
    const config = await getNimboConfig();
    if (!config.enabled || config.base_url !== note.baseUrl || config.doctor_account_id !== note.accountId || config.organization_id !== note.organizationId) throw new Error("notes_environment_mismatch");
    const personRoot = record(await nimboClinicalRequest(`people/${note.personId}`));
    const person = personRoot.person === undefined ? personRoot : record(personRoot.person);
    const fullName = typeof person.full_name === "string" ? person.full_name : [person.first_name, person.last_name].filter(x => typeof x === "string").join(" ");
    if (positiveId(person.id) !== note.personId || person.born_at !== note.birthDate ||
        typeof person.telephone2 !== "string" || normalizePhone(person.telephone2) !== normalizePhone(note.phone) ||
        normalizeName(fullName) !== normalizeName(note.fullName)) throw new Error("patient_identity_mismatch");
    const root = record(await nimboClinicalRequest(`consultations/${note.consultationId}`));
    const consultation = root.consultation === undefined ? root : record(root.consultation);
    // Missing fields fail closed; do not infer encounter membership from a caller-supplied ID.
    if (positiveId(consultation.id) !== note.consultationId || positiveId(consultation.person_id) !== note.personId ||
        positiveId(consultation.account_id) !== note.accountId || positiveId(consultation.organization_id) !== note.organizationId) throw new Error("encounter_identity_mismatch");
  },
  async list(note) {
    const rows: unknown[] = [];
    for (let page = 1; page <= 20; page++) {
      const response = await nimboClinicalRequest(`medical_notes?consultation_id=${note.consultationId}&page=${page}&per_page=100`);
      const batch = Array.isArray(response) ? response : record(response).medical_notes;
      if (!Array.isArray(batch)) throw new Error("notes_contract_unverified");
      rows.push(...batch);
      if (batch.length < 100) return rows;
    }
    throw new Error("notes_pagination_incomplete");
  },
  async create(note: Note) {
    return nimboClinicalRequest("medical_notes", { medical_note: {
      person_id: String(note.personId), consultation_id: String(note.consultationId), account_id: String(note.accountId),
      comment: note.comment, note_type: "consultation", created_at: null, voice_note_url: null,
    } });
  },
};
