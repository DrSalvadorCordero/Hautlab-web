"use client";

import { useState } from "react";
import { Eye, EyeOff, ImageUp, Plus, Save, Trash2 } from "lucide-react";
import type { CabinaContent, CabinaPromotion, CabinaReview } from "@/lib/cabina-content";

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

export function CabinaMediaEditor({ initialContent, publishingConfigured }: { initialContent: CabinaContent; publishingConfigured: boolean }) {
  const { services, faq, ...initialCore } = initialContent;
  const [core, setCore] = useState(initialCore);
  const [status, setStatus] = useState(publishingConfigured ? "Listo para publicar" : "Modo lectura: falta configurar el token privado de publicación");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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

  async function upload(slot: string, file: File, applyPath: (path: string) => void) {
    setUploading(slot);
    setStatus(`Subiendo ${file.name}...`);
    try {
      const formData = new FormData();
      formData.set("slot", slot);
      formData.set("file", file);
      const response = await fetch("/api/admin/cabina-media", { method: "POST", body: formData });
      const payload = (await response.json()) as { ok?: boolean; path?: string; error?: string };
      if (!response.ok || !payload.ok || !payload.path) throw new Error(payload.error ?? "No fue posible subir la imagen");
      applyPath(payload.path);
      setStatus("Imagen cargada. Presiona Guardar y publicar para vincularla al contenido.");
    } catch (error) {
      setStatus(error instanceof Error ? `No se subió: ${error.message}` : "No fue posible subir la imagen");
    } finally {
      setUploading(null);
    }
  }

  function updatePromotion(index: number, key: keyof CabinaPromotion, value: string | boolean) {
    setCore((current) => ({
      ...current,
      promotions: current.promotions.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    }));
  }

  function updateReview(index: number, key: keyof CabinaReview, value: string | boolean) {
    setCore((current) => ({
      ...current,
      reviews: current.reviews.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Medios y conversión</p>
            <h2 className="mt-3 text-2xl font-medium">Fotografías, promociones, reseñas y reservación</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">Las imágenes se publican como activos propios de HAUTLAB. No subas fotografías de pacientes sin autorización documentada.</p>
          </div>
          <button disabled={saving || !publishingConfigured} onClick={save} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-champagne px-5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-45">
            <Save className="h-4 w-4" /> {saving ? "Guardando" : "Guardar y publicar"}
          </button>
        </div>
        <p className="mt-5 rounded-xl border border-line bg-background/45 px-4 py-3 text-xs leading-5 text-muted">{status}</p>
      </section>

      <section className="grid gap-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Botones y mensajes de reservación</p></div>
        <Field label="Etiqueta principal" value={core.booking.primaryLabel} onChange={(value) => setCore((current) => ({ ...current, booking: { ...current.booking, primaryLabel: value } }))} />
        <Field label="Etiqueta para servicios" value={core.booking.servicesLabel} onChange={(value) => setCore((current) => ({ ...current, booking: { ...current.booking, servicesLabel: value } }))} />
        <div className="sm:col-span-2"><Field label="Mensaje general de WhatsApp" value={core.booking.generalMessage} onChange={(value) => setCore((current) => ({ ...current, booking: { ...current.booking, generalMessage: value } }))} textarea /></div>
        <div className="sm:col-span-2"><Field label="Mensaje de información" value={core.booking.informationMessage} onChange={(value) => setCore((current) => ({ ...current, booking: { ...current.booking, informationMessage: value } }))} textarea /></div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Fotografía de Karen</p><h2 className="mt-2 text-xl font-medium">Retrato profesional principal</h2></div>
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Ruta publicada" value={core.coordinator.photo ?? ""} onChange={(value) => setCore((current) => ({ ...current, coordinator: { ...current.coordinator, photo: value || null } }))} />
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line px-5 text-sm text-bone">
            <ImageUp className="h-4 w-4" /> {uploading === "karen-portrait" ? "Subiendo" : "Subir retrato"}
            <input
              className="sr-only"
              type="file"
              accept="image/webp,image/avif,image/jpeg,image/png"
              disabled={!publishingConfigured || uploading !== null}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload("karen-portrait", file, (path) => setCore((current) => ({ ...current, coordinator: { ...current.coordinator, photo: path } })));
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Galería</p><h2 className="mt-2 text-xl font-medium">Ocho espacios editoriales preparados</h2></div>
        <div className="grid gap-4 md:grid-cols-2">
          {core.gallery.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-line bg-background/45 p-5">
              <Field label="Descripción del espacio" value={item.label} onChange={(value) => setCore((current) => ({ ...current, gallery: current.gallery.map((galleryItem, itemIndex) => (itemIndex === index ? { ...galleryItem, label: value } : galleryItem)) }))} />
              <div className="mt-4"><Field label="Ruta de imagen" value={item.path ?? ""} onChange={(value) => setCore((current) => ({ ...current, gallery: current.gallery.map((galleryItem, itemIndex) => (itemIndex === index ? { ...galleryItem, path: value || null } : galleryItem)) }))} /></div>
              <label className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-xs text-bone">
                <ImageUp className="h-4 w-4" /> {uploading === item.id ? "Subiendo" : "Subir imagen"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/webp,image/avif,image/jpeg,image/png"
                  disabled={!publishingConfigured || uploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) upload(item.id, file, (path) => setCore((current) => ({ ...current, gallery: current.gallery.map((galleryItem, itemIndex) => (itemIndex === index ? { ...galleryItem, path } : galleryItem)) })));
                  }}
                />
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Promociones</p><h2 className="mt-2 text-xl font-medium">Ninguna se publica sin activarla</h2></div>
          <button onClick={() => setCore((current) => ({ ...current, promotions: [...current.promotions, { id: `promocion-${Date.now()}`, title: "Nueva promoción", description: "Descripción pendiente.", validUntil: "", visible: false }] }))} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs text-bone"><Plus className="h-4 w-4" /> Agregar</button>
        </div>
        {core.promotions.length === 0 && <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">No hay promociones configuradas.</p>}
        <div className="grid gap-4">
          {core.promotions.map((promotion, index) => (
            <article key={promotion.id} className="rounded-2xl border border-line bg-background/45 p-5">
              <div className="mb-5 flex justify-end gap-2">
                <button onClick={() => updatePromotion(index, "visible", !promotion.visible)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label={promotion.visible ? "Ocultar promoción" : "Mostrar promoción"}>{promotion.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <button onClick={() => setCore((current) => ({ ...current, promotions: current.promotions.filter((_, itemIndex) => itemIndex !== index) }))} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label="Eliminar promoción"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Título" value={promotion.title} onChange={(value) => updatePromotion(index, "title", value)} />
                <Field label="Vigencia" value={promotion.validUntil} onChange={(value) => updatePromotion(index, "validUntil", value)} />
                <div className="sm:col-span-2"><Field label="Descripción" value={promotion.description} onChange={(value) => updatePromotion(index, "description", value)} textarea /></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Reseñas verificadas</p><h2 className="mt-2 text-xl font-medium">Solo testimonios específicos y comprobables</h2></div>
          <button onClick={() => setCore((current) => ({ ...current, reviews: [...current.reviews, { id: `resena-${Date.now()}`, initials: "", quote: "", service: "", date: "", sourceUrl: "", visible: false }] }))} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs text-bone"><Plus className="h-4 w-4" /> Agregar</button>
        </div>
        {core.reviews.length === 0 && <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">No hay reseñas específicas de la cabina. El sitio mostrará el texto temporal aprobado.</p>}
        <div className="grid gap-4">
          {core.reviews.map((review, index) => (
            <article key={review.id} className="rounded-2xl border border-line bg-background/45 p-5">
              <div className="mb-5 flex justify-end gap-2">
                <button onClick={() => updateReview(index, "visible", !review.visible)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label={review.visible ? "Ocultar reseña" : "Mostrar reseña"}>{review.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <button onClick={() => setCore((current) => ({ ...current, reviews: current.reviews.filter((_, itemIndex) => itemIndex !== index) }))} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted" aria-label="Eliminar reseña"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Iniciales" value={review.initials} onChange={(value) => updateReview(index, "initials", value)} />
                <Field label="Servicio" value={review.service} onChange={(value) => updateReview(index, "service", value)} />
                <Field label="Fecha" value={review.date} onChange={(value) => updateReview(index, "date", value)} />
                <Field label="URL de fuente verificable" value={review.sourceUrl} onChange={(value) => updateReview(index, "sourceUrl", value)} />
                <div className="sm:col-span-2"><Field label="Testimonio" value={review.quote} onChange={(value) => updateReview(index, "quote", value)} textarea /></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
