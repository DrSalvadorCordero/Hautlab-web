"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackHautlabEvent } from "@/lib/client-analytics";
import {
  attributionForWhatsApp,
  dispatchValidatedLead,
  getLeadAttribution
} from "@/lib/lead-attribution";

const inputClass =
  "min-h-12 w-full rounded-2xl border border-line bg-white/[0.035] px-4 py-3 text-sm text-bone outline-none transition placeholder:text-quiet focus:border-champagne/55 focus:ring-2 focus:ring-champagne/20";

export function CabinaIntakeForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const attribution = getLeadAttribution();
    const sourceNote = attributionForWhatsApp(attribution);

    const message = [
      "Hola, me gustaría agendar una valoración para la Cabina Dermatocosmética de HAUTLAB.",
      value("name") && `Nombre: ${value("name")}.`,
      value("age") && `Edad: ${value("age")}.`,
      value("phone") && `Teléfono: ${value("phone")}.`,
      value("email") && `Correo: ${value("email")}.`,
      value("reason") && `Motivo: ${value("reason")}.`,
      value("skinType") && `Tipo de piel percibido: ${value("skinType")}.`,
      value("currentTreatments") && `Tratamientos actuales: ${value("currentTreatments")}.`,
      value("medications") && `Medicamentos relevantes: ${value("medications")}.`,
      value("allergies") && `Alergias: ${value("allergies")}.`,
      value("pregnancy") && `Embarazo o lactancia: ${value("pregnancy")}.`,
      value("date") && `Fecha deseada: ${value("date")}.`,
      value("time") && `Horario preferido: ${value("time")}.`,
      sourceNote
    ]
      .filter(Boolean)
      .join(" ");

    trackHautlabEvent("cabina_form_submit", { form_id: "cabina-intake" });
    dispatchValidatedLead(
      {
        formId: "cabina-intake",
        pathway: "cabina",
        city: "Mérida"
      },
      attribution
    );
    setSubmitted(true);
    window.location.href = buildWhatsAppLink(message);
  }

  return (
    <form id="cabina-intake" onSubmit={handleSubmit} className="rounded-[2rem] border border-line bg-white/[0.025] p-6 shadow-calm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted">
          Nombre completo
          <input className={inputClass} name="name" autoComplete="name" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Edad
          <input className={inputClass} name="age" type="number" min="1" max="110" inputMode="numeric" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Teléfono
          <input className={inputClass} name="phone" type="tel" autoComplete="tel" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Correo electrónico
          <input className={inputClass} name="email" type="email" autoComplete="email" required />
        </label>
        <label className="grid gap-2 text-sm text-muted sm:col-span-2">
          Motivo de consulta
          <textarea className={`${inputClass} min-h-28 resize-y`} name="reason" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Tipo de piel percibido
          <select className={inputClass} name="skinType" defaultValue="No estoy seguro">
            <option>Normal</option>
            <option>Seca</option>
            <option>Grasa</option>
            <option>Mixta</option>
            <option>Sensible</option>
            <option>No estoy seguro</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Embarazo o lactancia
          <select className={inputClass} name="pregnancy" defaultValue="No aplica">
            <option>No aplica</option>
            <option>Embarazo</option>
            <option>Lactancia</option>
            <option>Prefiero comentarlo directamente</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted sm:col-span-2">
          Tratamientos actuales
          <textarea className={`${inputClass} min-h-24 resize-y`} name="currentTreatments" placeholder="Productos, faciales o procedimientos recientes." />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Medicamentos relevantes
          <textarea className={`${inputClass} min-h-24 resize-y`} name="medications" />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Alergias
          <textarea className={`${inputClass} min-h-24 resize-y`} name="allergies" />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Fecha deseada
          <input className={inputClass} name="date" type="date" />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Horario preferido
          <input className={inputClass} name="time" type="text" placeholder="Ej. entre 16:00 y 19:00" />
        </label>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-background/45 p-4 text-sm leading-6 text-muted">
        <input className="mt-1 h-4 w-4 accent-current" name="consent" type="checkbox" required />
        <span>
          Autorizo que HAUTLAB me contacte para dar seguimiento a esta solicitud y confirmo que leí el{" "}
          <Link href="/aviso-de-privacidad" className="text-bone underline decoration-champagne/45 underline-offset-4">aviso de privacidad</Link>.
        </span>
      </label>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-2xl items-start gap-2 text-xs leading-5 text-quiet">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
          El sitio no almacena esta información. Al enviar, se abrirá WhatsApp con el mensaje para que puedas revisarlo antes de compartirlo. El formulario no realiza diagnósticos ni promete resultados.
        </p>
        <button type="submit" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-champagne px-7 text-sm font-medium text-background transition hover:bg-bone focus:outline-none focus:ring-2 focus:ring-champagne/50">
          Continuar por WhatsApp <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {submitted && <p className="mt-4 text-sm text-bone">Abriendo WhatsApp para completar tu solicitud.</p>}
    </form>
  );
}
