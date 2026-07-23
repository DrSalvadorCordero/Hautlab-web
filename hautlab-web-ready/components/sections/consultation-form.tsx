"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  attributionForWhatsApp,
  dispatchValidatedLead,
  getLeadAttribution
} from "@/lib/lead-attribution";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pathwayLabels = {
  dermatologia: "Consulta de piel, cabello o uñas",
  estetica: "Medicina estética y diseño facial",
  cabina: "Cabina Dermatocosmética",
  internacional: "Atención para paciente visitante o internacional"
} as const;

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  city: z.string().trim().min(2, "Selecciona tu ciudad o región.").max(80),
  pathway: z.enum(["dermatologia", "estetica", "cabina", "internacional"]),
  interest: z.string().trim().max(180).optional(),
  message: z.string().trim().max(500).optional(),
  consent: z
    .boolean()
    .refine((value) => value, "Confirma que leíste el aviso de privacidad.")
});

type FormValues = z.infer<typeof schema>;

const selectClass =
  "min-h-12 w-full rounded-2xl border border-line bg-white/[0.035] px-4 py-3 text-sm text-bone outline-none transition focus:border-champagne/55 focus:ring-2 focus:ring-champagne/20";

export function ConsultationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      city: "Mérida",
      pathway: "dermatologia",
      interest: "",
      message: "",
      consent: false
    }
  });

  function onSubmit(values: FormValues) {
    const attribution = getLeadAttribution();
    const sourceNote = attributionForWhatsApp(attribution);
    const text = [
      "Hola, quiero solicitar una valoración en HAUTLAB.",
      `Nombre: ${values.name}.`,
      `Ciudad o región: ${values.city}.`,
      `Tipo de atención: ${pathwayLabels[values.pathway]}.`,
      values.interest && `Motivo principal: ${values.interest}.`,
      values.message && `Comentario: ${values.message}.`,
      sourceNote
    ]
      .filter(Boolean)
      .join("\n");

    dispatchValidatedLead(
      {
        formId: "contacto-hautlab",
        pathway: values.pathway,
        city: values.city
      },
      attribution
    );

    window.location.href = buildWhatsAppLink(text);
  }

  return (
    <form
      id="contacto-hautlab"
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 rounded-[2rem] border border-line bg-white/[0.035] p-5 shadow-calm sm:p-7"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted">
          Nombre
          <Input autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <span className="text-xs text-champagne">{form.formState.errors.name.message}</span>
          )}
        </label>

        <label className="grid gap-2 text-sm text-muted">
          Ciudad o región
          <select className={selectClass} {...form.register("city")}>
            <option>Mérida</option>
            <option>Campeche</option>
            <option>Quintana Roo</option>
            <option>CDMX</option>
            <option>Otra ciudad</option>
          </select>
          {form.formState.errors.city && (
            <span className="text-xs text-champagne">{form.formState.errors.city.message}</span>
          )}
        </label>
      </div>

      <label className="grid gap-2 text-sm text-muted">
        Tipo de atención
        <select className={selectClass} {...form.register("pathway")}>
          {Object.entries(pathwayLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm text-muted">
        Motivo principal
        <Input
          placeholder="Ej. acné, caída de cabello, valoración facial o cuidado de piel"
          {...form.register("interest")}
        />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        Comentario opcional
        <Textarea
          placeholder="Describe brevemente qué deseas revisar. Evita compartir fotografías o información clínica sensible aquí."
          {...form.register("message")}
        />
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-line bg-background/45 p-4 text-xs leading-5 text-muted">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-current"
          {...form.register("consent")}
        />
        <span>
          Autorizo que HAUTLAB me contacte para dar seguimiento y confirmo que leí el{" "}
          <Link
            href="/aviso-de-privacidad"
            className="text-bone underline decoration-line underline-offset-4"
          >
            aviso de privacidad
          </Link>
          .
        </span>
      </label>
      {form.formState.errors.consent && (
        <span className="text-xs text-champagne">{form.formState.errors.consent.message}</span>
      )}

      <Button type="submit" className="w-full sm:w-fit">
        Preparar solicitud en WhatsApp <Send className="h-4 w-4" />
      </Button>

      <p className="flex items-start gap-2 text-xs leading-5 text-quiet">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
        El sitio no almacena este formulario. WhatsApp se abrirá con el mensaje para que puedas
        revisarlo antes de enviarlo. La solicitud no confirma cita ni candidatura.
      </p>
    </form>
  );
}
