import { WhatsAppCommandConsole } from "@/components/admin/whatsapp-command-console";

export default function WhatsAppAdminPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">
          WhatsApp IA
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
          Consola del asistente
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Control central del prompt, memoria por conversación, conocimiento operativo,
          catálogo autorizado y modo del bot. Las reglas clínicas críticas permanecen
          protegidas fuera del prompt editable.
        </p>
      </section>

      <WhatsAppCommandConsole />
    </div>
  );
}
