import { WhatsAppPromptEditor } from "@/components/admin/whatsapp-prompt-editor";

export default function WhatsAppAdminPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">
          WhatsApp IA
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Prompt operativo</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Aquí puedes consultar y ajustar la voz, criterios comerciales, precios autorizados y forma de responder del asistente de WhatsApp. Los cambios guardados se leen directamente en las nuevas conversaciones.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Canal</p>
          <p className="mt-3 font-medium">WhatsApp Cloud API</p>
          <p className="mt-2 text-sm leading-6 text-muted">El webhook de producción enruta los mensajes al orquestador interno.</p>
        </article>
        <article className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Prompt</p>
          <p className="mt-3 font-medium">Editable y centralizado</p>
          <p className="mt-2 text-sm leading-6 text-muted">La versión guardada en configuración tiene prioridad sobre la versión base.</p>
        </article>
        <article className="rounded-[1.5rem] border border-line bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Seguridad</p>
          <p className="mt-3 font-medium">Capa clínica protegida</p>
          <p className="mt-2 text-sm leading-6 text-muted">Síntomas, prescripciones, complicaciones y candidaturas médicas siguen escalando al Dr. Salvador.</p>
        </article>
      </section>

      <WhatsAppPromptEditor />
    </div>
  );
}
