"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import type { CabinaContent, CabinaFaqItem, CabinaService } from "@/lib/cabina-content";

const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white/[0.035] px-3 py-2 text-sm text-bone outline-none transition placeholder:text-quiet focus:border-champagne/55 focus:ring-2 focus:ring-champagne/15";

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label className="grid gap-2 text-xs uppercase tracking-[0.13em] text-muted">
      {label}
      {textarea ? (
        <textarea className={`${inputClass} min-h-24 resize-y normal-case tracking-normal`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={`${inputClass} normal-case tracking-normal`} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export function CabinaContentEditor({ initialContent, publishingConfigured }: { initialContent: CabinaContent; publishingConfigured: boolean }) {
  const { services: initialServices, faq: initialFaq, ...initialCore } = initialContent;
  const [core, setCore] = useState(initialCore);
  const [services, setServices] = useState<CabinaService[]>(initialServices);
  const [faq, setFaq] = useState<CabinaFaqItem[]>(initialFaq);
  const [status, setStatus] = useState<string>(publishingConfigured ? "Listo para publicar" : "Modo lectura: falta configurar el token privado de publicación");
  const [saving, setSaving] = useState(false);

  function updateCoordinator(key: "name" | "role" | "description" | "medicalBoundary" | "photo", value: string | null) {
    setCore((current) => ({ ...current, coordinator: { ...current.coordinator, [key]: value } }));
  }

  function updateService(index: number, key: keyof CabinaService, value: string | boolean) {
    setServices((current) => current.map((service, itemIndex) => (itemIndex === index ? { ...service, [key]: value } : service)));
  }

  function addService() {
    setServices((current) => [
      ...current,
      {
        id: `servicio-${Date.now()}`,
        name: "Nuevo servicio",
        description: "Descripción pendiente.",
        duration: "Duración por confirmar",
        indications: "Indicaciones pendientes de revisión.",
        price: "Cotización individual",
        visible: false
      }
    ]);
  }

  function updateFaq(index: number, key: keyof CabinaFaqItem, value: string) {
    setFaq((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function save() {
    setSaving(true);
    setStatus("Publicando cambios...");

    try {
      const response = await fetch("/api/admin/cabina-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ core, services, faq })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; branch?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "No fue posible publicar");
      setStatus(`Cambios enviados a ${payload.branch}. Vercel iniciará un nuevo despliegue.`);
    } catch (error) {
      setStatus(error instanceof Error ? `No se publicó: ${error.message}` : "No fue posible publicar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Publicación controlada</p>
            <h2 className="mt-3 text-2xl font-medium">Contenido de la Cabina Dermatocosmética</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">Los cambios se guardan en el repositorio y generan un despliegue trazable. No se modifican diagnósticos ni se publican promesas de resultados.</p>
          </div>
          <button disabled={saving || !publishingConfigured} onClick={save} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-champagne px-5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-45">
            <Save className="h-4 w-4" /> {saving ? "Guardando" : "Guardar y publicar"}
          </button>
        </div>
        <p className="mt-5 rounded-xl border border-line bg-background/45 px-4 py-3 text-xs leading-5 text-muted">{status}</p>
      </section>

      <section className="grid gap-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Portada y posicionamiento</p></div>
        <Field label="Título principal" value={core.hero.title} onChange={(value) => setCore((current) => ({ ...current, hero: { ...current.hero, title: value } }))} />
        <Field label="Subtítulo" value={core.hero.subtitle} onChange={(value) => setCore((current) => ({ ...current, hero: { ...current.hero, subtitle: value } }))} textarea />
        <div className="sm:col-span-2"><Field label="Descripción complementaria" value={core.hero.description} onChange={(value) => setCore((current) => ({ ...current, hero: { ...current.hero, description: value } }))} textarea /></div>
        <Field label="Título de posicionamiento" value={core.positioning.title} onChange={(value) => setCore((current) => ({ ...current, positioning: { ...current.positioning, title: value } }))} />
        <div className="grid gap-4">
          {core.positioning.paragraphs.map((paragraph, index) => (
            <Field key={index} label={`Párrafo ${index + 1}`} value={paragraph} onChange={(value) => setCore((current) => ({ ...current, positioning: { ...current.positioning, paragraphs: current.positioning.paragraphs.map((item, itemIndex) => (itemIndex === index ? value : item)) } }))} textarea />
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Perfil de Karen</p></div>
        <Field label="Nombre" value={core.coordinator.name} onChange={(value) => updateCoordinator("name", value)} />
        <Field label="Cargo" value={core.coordinator.role} onChange={(value) => updateCoordinator("role", value)} />
        <div className="sm:col-span-2"><Field label="Descripción" value={core.coordinator.description} onChange={(value) => updateCoordinator("description", value)} textarea /></div>
        <div className="sm:col-span-2"><Field label="Límite médico visible" value={core.coordinator.medicalBoundary} onChange={(value) => updateCoordinator("medicalBoundary", value)} textarea /></div>
        <div className="sm:col-span-2"><Field label="Ruta de fotografía aprobada" value={core.coordinator.photo ?? ""} onChange={(value) => updateCoordinator("photo", value || null)} /></div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Servicios</p><h2 className="mt-2 text-xl font-medium">{services.length} protocolos configurados</h2></div>
          <button onClick={addService} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs text-bone"><Plus className="h-4 w-4" /> Agregar</button>
        </div>
        <div className="grid gap-4">
          {services.map((service, index) => (
            <article key={service.id} className="rounded-2xl border border-line bg-background/45 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Servicio {index + 1}</p>
                <div className="flex gap-2">
                  <button onClick={() => updateService(index, "visible", !service.visible)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label={service.visible ? "Ocultar servicio" : "Mostrar servicio"}>{service.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => setServices((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label="Eliminar servicio"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" value={service.name} onChange={(value) => updateService(index, "name", value)} />
                <Field label="Identificador URL/evento" value={service.id} onChange={(value) => updateService(index, "id", value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                <div className="sm:col-span-2"><Field label="Descripción" value={service.description} onChange={(value) => updateService(index, "description", value)} textarea /></div>
                <Field label="Duración" value={service.duration} onChange={(value) => updateService(index, "duration", value)} />
                <Field label="Precio" value={service.price} onChange={(value) => updateService(index, "price", value)} />
                <div className="sm:col-span-2"><Field label="Indicaciones" value={service.indications} onChange={(value) => updateService(index, "indications", value)} textarea /></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p><h2 className="mt-2 text-xl font-medium">Contenido visible y schema FAQ</h2></div>
          <button onClick={() => setFaq((current) => [...current, { question: "Nueva pregunta", answer: "Respuesta pendiente." }])} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs text-bone"><Plus className="h-4 w-4" /> Agregar</button>
        </div>
        <div className="grid gap-4">
          {faq.map((item, index) => (
            <article key={`${item.question}-${index}`} className="rounded-2xl border border-line bg-background/45 p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
                <Field label="Pregunta" value={item.question} onChange={(value) => updateFaq(index, "question", value)} textarea />
                <Field label="Respuesta" value={item.answer} onChange={(value) => updateFaq(index, "answer", value)} textarea />
                <button onClick={() => setFaq((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mb-1 grid h-10 w-10 place-items-center rounded-full border border-line text-muted" aria-label="Eliminar pregunta"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Horarios y reseñas</p></div>
        {core.hours.map((hour, index) => <Field key={index} label={`Línea de horario ${index + 1}`} value={hour} onChange={(value) => setCore((current) => ({ ...current, hours: current.hours.map((item, itemIndex) => (itemIndex === index ? value : item)) }))} />)}
        <div className="sm:col-span-2"><Field label="Texto temporal de reseñas" value={core.reviewsPlaceholder} onChange={(value) => setCore((current) => ({ ...current, reviewsPlaceholder: value }))} textarea /></div>
      </section>
    </div>
  );
}
