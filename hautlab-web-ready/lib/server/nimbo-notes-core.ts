import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

export type Note = {
  personId: number; consultationId: number; accountId: number; organizationId: number;
  fullName: string; birthDate: string; phone: string; comment: string; baseUrl: string;
};
export type Operation = {
  id: string; actor_id: string; digest: string; sealed: string;
  state: "draft" | "submitting" | "verified" | "uncertain";
  expires_at: string; remote_id: number | null; verified_at: string | null;
};
export interface NoteStore {
  // INSERT must enforce a unique digest across all operations, not just draft IDs.
  insert(row: Omit<Operation, "id">): Promise<Operation>;
  get(id: string, actor: string): Promise<Operation | null>;
  // Atomic compare-and-set, including expiry, actor and digest. Never a read-then-write lock.
  claim(id: string, actor: string, digest: string, now: string): Promise<boolean>;
  finish(id: string, state: "verified" | "uncertain", remoteId: number | null, at: string | null): Promise<void>;
}
export interface NoteRemote {
  validate(note: Note): Promise<void>;
  list(note: Note): Promise<unknown[]>;
  create(note: Note): Promise<unknown>;
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("unexpected_contract");
  return value as Record<string, unknown>;
}
export function positiveId(value: unknown): number {
  if (typeof value !== "number" && (typeof value !== "string" || !/^[1-9]\d*$/.test(value))) throw new Error("invalid_id");
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("invalid_id");
  return id;
}
export function normalizeName(value: string) { return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("es-MX"); }
export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").replace(/^521(?=\d{10}$)/, "").replace(/^52(?=\d{10}$)/, "");
}
export function validateNote(note: Note) {
  [note.personId, note.consultationId, note.accountId, note.organizationId].forEach(positiveId);
  if (!note.fullName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(note.birthDate) ||
      !/^\d{10,15}$/.test(normalizePhone(note.phone)) || !note.comment.trim() ||
      Buffer.byteLength(note.comment) > 32_000 || /[<>\u0000]/.test(note.comment)) throw new Error("invalid_note");
  if (!/^https:\/\//.test(note.baseUrl)) throw new Error("invalid_origin");
}
function key(secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(secret)) throw new Error("notes_key_missing");
  return Buffer.from(secret, "hex");
}
export function digestNote(note: Note, secret: string) {
  // A keyed digest does not disclose low-entropy clinical text through a dictionary attack.
  return createHmac("sha256", key(secret)).update(JSON.stringify([
    note.baseUrl, note.organizationId, note.accountId, note.personId, note.consultationId,
    note.comment.normalize("NFC").replace(/\r\n/g, "\n").trim(),
  ])).digest("hex");
}
export function seal(note: Note, secret: string, actor: string, digest: string) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  cipher.setAAD(Buffer.from(JSON.stringify([actor, digest])));
  const data = Buffer.concat([cipher.update(JSON.stringify(note), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}
export function unseal(op: Operation, secret: string): Note {
  const data = Buffer.from(op.sealed, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(secret), data.subarray(0, 12));
  decipher.setAAD(Buffer.from(JSON.stringify([op.actor_id, op.digest])));
  decipher.setAuthTag(data.subarray(12, 28));
  const note = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8")) as Note;
  validateNote(note);
  if (digestNote(note, secret) !== op.digest) throw new Error("draft_changed");
  return note;
}
export function matchesNote(value: unknown, note: Note, id?: number) {
  try {
    const row = record(value);
    return (id === undefined || positiveId(row.id) === id) && positiveId(row.person_id) === note.personId &&
      positiveId(row.consultation_id) === note.consultationId && positiveId(row.account_id) === note.accountId &&
      row.note_type === "consultation" && row.comment === note.comment;
  } catch { return false; }
}
export async function prepareNote(note: Note, actor: string, secret: string, store: NoteStore, remote: NoteRemote) {
  validateNote(note);
  if (!actor) throw new Error("unauthorized");
  await remote.validate(note);
  if ((await remote.list(note)).some(row => matchesNote(row, note))) throw new Error("note_already_exists");
  const digest = digestNote(note, secret);
  const op = await store.insert({ actor_id: actor, digest, sealed: seal(note, secret, actor, digest),
    state: "draft", expires_at: new Date(Date.now() + 15 * 60_000).toISOString(), remote_id: null, verified_at: null });
  return { id: op.id, digest, expiresAt: op.expires_at, note };
}
export async function approveNote(input: { id: string; digest: string; approved: boolean }, actor: string,
  secret: string, store: NoteStore, remote: NoteRemote, writesEnabled: boolean) {
  if (!writesEnabled) throw new Error("notes_writes_disabled");
  if (!input.approved || !actor) throw new Error("approval_required");
  const op = await store.get(input.id, actor);
  if (!op || op.actor_id !== actor || op.digest !== input.digest) throw new Error("approval_mismatch");
  if (op.state === "verified") return { state: op.state, remoteId: op.remote_id, verifiedAt: op.verified_at };
  if (op.state !== "draft") throw new Error("reconciliation_required");
  if (Date.parse(op.expires_at) <= Date.now()) throw new Error("approval_expired");
  const note = unseal(op, secret);
  await remote.validate(note); // Revalidate identity, encounter, account and environment immediately before write.
  const existing = await remote.list(note);
  if (existing.some(row => matchesNote(row, note))) throw new Error("note_already_exists");
  if (!await store.claim(op.id, actor, op.digest, new Date().toISOString())) throw new Error("operation_claimed_or_expired");
  // After claim, every failure is uncertain. No automatic POST retry, even on timeout or 401.
  try {
    const result = record(await remote.create(note));
    const created = result.medical_note === undefined ? result : record(result.medical_note);
    const id = positiveId(created.id);
    const rows = await remote.list(note);
    if (rows.filter(row => matchesNote(row, note, id)).length !== 1) throw new Error("write_not_verified");
    const at = new Date().toISOString();
    await store.finish(op.id, "verified", id, at);
    return { state: "verified" as const, remoteId: id, verifiedAt: at };
  } catch {
    await store.finish(op.id, "uncertain", null, null).catch(() => undefined);
    throw new Error("reconciliation_required");
  }
}
