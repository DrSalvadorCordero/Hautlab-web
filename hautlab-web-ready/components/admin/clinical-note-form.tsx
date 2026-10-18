"use client";
import { useState } from "react";
type Draft = { id: string; digest: string; expiresAt: string; note: { fullName: string; personId: number; consultationId: number; birthDate: string; comment: string } };
export function ClinicalNoteForm({ writesEnabled }: { writesEnabled: boolean }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  async function call(body: unknown) {
    const response = await fetch("/api/admin/nimbo/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "notes_request_failed");
    return data;
  }
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      setDraft(await call({ action: "prepare", personId: Number(form.get("personId")), consultationId: Number(form.get("consultationId")),
        fullName: form.get("fullName"), birthDate: form.get("birthDate"), phone: form.get("phone"), comment: form.get("comment") }));
      setConfirmed(false); setAttempted(false);
    } catch { setMessage("No se pudo preparar la nota. Comprueba los datos del paciente y la consulta; también puede existir una operación previa que requiere revisión."); }
    finally { setBusy(false); }
  }
  async function approve() {
    if (!draft || !confirmed) return;
    setBusy(true); setAttempted(true);
    try {
      const result = await call({ action: "approve", id: draft.id, digest: draft.digest, approved: true });
      setMessage(`Guardado verificado en Nimbo. Nota ${result.remoteId}. Verificación: ${result.verifiedAt}. Operación: ${draft.id}.`);
    } catch { setMessage(`No hay confirmación de guardado. No reenvíes la nota. Consulta el estado de la operación ${draft.id}.`); }
    finally { setBusy(false); }
  }
  return <section className="max-w-3xl space-y-6">
    <h1 className="font-serif text-3xl">Nota clínica · Nimbo</h1>
    <p>Usa los identificadores de paciente y consulta de Nimbo. El nombre, nacimiento y teléfono se cotejan con el expediente.</p>
    {!draft ? <form onSubmit={prepare} className="space-y-4" autoComplete="off">
      {[["personId", "ID del paciente", "number"], ["consultationId", "ID de la consulta", "number"], ["fullName", "Nombre completo", "text"], ["birthDate", "Fecha de nacimiento", "date"], ["phone", "Teléfono registrado", "tel"]].map(([name, label, type]) =>
        <label className="block" key={name}>{label}<input name={name} type={type} required className="mt-1 block w-full rounded border border-line bg-transparent p-3" /></label>)}
      <label className="block">Nota para revisión<textarea name="comment" required maxLength={32000} rows={12} className="mt-1 block w-full rounded border border-line bg-transparent p-3" /></label>
      <button disabled={busy} className="rounded border border-line p-3">Verificar identidad y revisar nota</button>
    </form> : <div className="space-y-4">
      <p><strong>{draft.note.fullName}</strong> · Nacimiento: {draft.note.birthDate}</p>
      <p>Paciente {draft.note.personId} · Consulta {draft.note.consultationId}</p>
      <pre className="whitespace-pre-wrap rounded border border-line p-4 font-sans">{draft.note.comment}</pre>
      <p>Revisión válida hasta {new Date(draft.expiresAt).toLocaleString("es-MX")}. Operación: {draft.id}</p>
      <label className="block"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={attempted} /> Confirmo paciente, consulta y texto. Autorizo guardar esta nota en Nimbo.</label>
      <button onClick={approve} disabled={busy || !confirmed || attempted || !writesEnabled} className="rounded border border-line p-3 disabled:opacity-40">Aprobar y guardar esta nota</button>
      {!writesEnabled && <p>La escritura está desactivada; este borrador no se ha enviado a Nimbo.</p>}
      {attempted && <button className="block rounded border border-line p-3" disabled={busy} onClick={async () => {
        setBusy(true);
        try { const r = await call({ action: "status", id: draft.id }); setMessage(r.state === "verified" ? `Guardado verificado. Nota ${r.remoteId}. Verificación: ${r.verifiedAt}.` : `Estado: ${r.state}. No reenviar; requiere revisión.`); }
        catch { setMessage("No se pudo consultar el estado. No reenviar."); } finally { setBusy(false); }
      }}>Consultar estado sin reenviar</button>}
    </div>}
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
