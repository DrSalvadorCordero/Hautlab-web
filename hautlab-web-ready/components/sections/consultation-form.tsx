"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const schema = z.object({
  name: z.string().min(2, "Escribe tu nombre."),
  phone: z.string().min(8, "Escribe un teléfono válido."),
  interest: z.string().min(3, "Escribe qué te interesa."),
  message: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function ConsultationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", interest: "", message: "" }
  });

  function onSubmit(values: FormValues) {
    const text = `Hola, quiero agendar una valoración en HAUTLAB.%0A%0ANombre: ${values.name}%0ATeléfono: ${values.phone}%0AInterés: ${values.interest}%0AMensaje: ${values.message || "Sin mensaje adicional"}`;
    window.open(buildWhatsAppLink(decodeURIComponent(text)), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 rounded-[2rem] border border-line bg-white/[0.035] p-5 shadow-hairline">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input placeholder="Nombre" {...form.register("name")} aria-label="Nombre" />
          {form.formState.errors.name && <p className="mt-1 text-xs text-champagne">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Input placeholder="WhatsApp" {...form.register("phone")} aria-label="WhatsApp" />
          {form.formState.errors.phone && <p className="mt-1 text-xs text-champagne">{form.formState.errors.phone.message}</p>}
        </div>
      </div>
      <Input placeholder="¿Qué te interesa?" {...form.register("interest")} aria-label="Interés" />
      {form.formState.errors.interest && <p className="mt-1 text-xs text-champagne">{form.formState.errors.interest.message}</p>}
      <Textarea placeholder="Cuéntanos brevemente qué buscas mejorar o revisar." {...form.register("message")} aria-label="Mensaje" />
      <Button type="submit" className="w-full sm:w-fit">
        Enviar por WhatsApp <Send className="h-4 w-4" />
      </Button>
      <p className="text-xs leading-5 text-quiet">No se envía a servidor. El formulario prepara un mensaje de WhatsApp para proteger datos sensibles.</p>
    </form>
  );
}
