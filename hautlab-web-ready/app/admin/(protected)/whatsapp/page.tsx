import { WhatsAppCommandConsole } from "@/components/admin/whatsapp-command-console";
import { WhatsAppLiveInbox } from "@/components/admin/whatsapp-live-inbox";

export default function WhatsAppAdminPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">
          HAUTLAB · WhatsApp
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
          Command Center
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Operación de conversaciones, control humano, alertas clínicas y configuración
          del asistente en una sola consola protegida.
        </p>
      </section>

      <WhatsAppLiveInbox />

      <section className="border-t border-line pt-9">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">
            Configuración avanzada
          </p>
          <h2 className="mt-2 font-serif text-2xl text-bone sm:text-3xl">
            Cerebro del asistente
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Prompt, memoria por conversación, conocimiento operativo, catálogo autorizado
            y modo global. Las reglas clínicas críticas permanecen protegidas fuera del
            prompt editable.
          </p>
        </div>
        <WhatsAppCommandConsole />
      </section>
    </div>
  );
}
