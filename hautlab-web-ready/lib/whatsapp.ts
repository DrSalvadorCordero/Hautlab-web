import { siteConfig } from "./siteConfig";

export function buildWhatsAppLink(message?: string) {
  const cleanNumber = siteConfig.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(
    message || "Hola, quiero agendar una valoración con el Dr. Salvador Cordero."
  );

  return `https://wa.me/${cleanNumber}?text=${text}`;
}
