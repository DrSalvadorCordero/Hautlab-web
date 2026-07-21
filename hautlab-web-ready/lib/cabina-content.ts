import coreData from "@/data/cabina-content.json";
import faqData from "@/data/cabina-faq.json";
import servicesData from "@/data/cabina-services.json";

export type CabinaService = {
  id: string;
  name: string;
  description: string;
  duration: string;
  indications: string;
  price: string;
  visible: boolean;
};

export type CabinaFaqItem = {
  question: string;
  answer: string;
};

export type CabinaCoreContent = {
  unitName: string;
  displayBrand: string;
  displayUnit: string;
  coordinator: {
    name: string;
    role: string;
    description: string;
    medicalBoundary: string;
    photo: string | null;
  };
  medicalDirection: {
    name: string;
    role: string;
    license: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  positioning: {
    title: string;
    paragraphs: string[];
  };
  hours: string[];
  reviewsPlaceholder: string;
  updatedAt: string;
};

export type CabinaContent = CabinaCoreContent & {
  services: CabinaService[];
  faq: CabinaFaqItem[];
};

const core = coreData as CabinaCoreContent;
const services = servicesData as CabinaService[];
const faq = faqData as CabinaFaqItem[];

export const cabinaContent: CabinaContent = {
  ...core,
  services,
  faq
};

export const visibleCabinaServices = services.filter((service) => service.visible);
