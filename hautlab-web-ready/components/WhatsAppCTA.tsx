"use client";

import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppCTA() {
  return (
    <a
      className="float-whatsapp"
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      data-event="whatsapp_floating_cta"
    >
      Agendar por WhatsApp
    </a>
  );
}
