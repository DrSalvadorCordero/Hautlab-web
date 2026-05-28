"use client";

import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/tracking";

export function WhatsAppCTA() {
  return (
    <a
      className="float-whatsapp"
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_cta" })}
    >
      Agendar por WhatsApp
    </a>
  );
}
