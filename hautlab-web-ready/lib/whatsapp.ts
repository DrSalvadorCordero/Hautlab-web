import { siteConfig } from "./siteConfig";

export function buildWhatsAppLink(message?: string) {
  const cleanNumber = siteConfig.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(
    message || "Hola, quiero agendar una valoración en HAUTLAB con el Dr. Salvador Cordero."
  );

  return `https://wa.me/${cleanNumber}?text=${text}`;
}

export function whatsappForTreatment(treatment: string) {
  return buildWhatsAppLink(`Hola, quiero agendar una valoración para ${treatment} en HAUTLAB.`);
}
