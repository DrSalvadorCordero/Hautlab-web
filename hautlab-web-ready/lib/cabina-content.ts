import core from "@/data/cabina-content.json";
import faq from "@/data/cabina-faq.json";
import services from "@/data/cabina-services.json";

export type CabinaService = (typeof services)[number];
export type CabinaFaqItem = (typeof faq)[number];
export type CabinaContent = typeof core & {
  services: CabinaService[];
  faq: CabinaFaqItem[];
};

export const cabinaContent: CabinaContent = {
  ...core,
  services,
  faq
};

export const visibleCabinaServices = services.filter((service) => service.visible);
