import { getAdminAccess } from "@/lib/admin-access";
import { ClinicalNoteForm } from "@/components/admin/clinical-note-form";
export default async function ClinicalNotesPage() {
  const access = await getAdminAccess();
  if (!access.allowed || !access.isOwner) return <p>Acceso exclusivo del médico propietario.</p>;
  if (process.env.NIMBO_NOTES_ENABLED !== "true") return <p>Notas clínicas pendientes de validación en Nimbo. Escritura desactivada.</p>;
  return <ClinicalNoteForm writesEnabled={process.env.NIMBO_NOTES_WRITES_ENABLED === "true"} />;
}
