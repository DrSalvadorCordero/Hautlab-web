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

export type CabinaPromotion = {
  id: string;
  title: string;
  description: string;
  validUntil: string;
  visible: boolean;
};

export type CabinaReview = {
  id: string;
  initials: string;
  quote: string;
  service: string;
  date: string;
  sourceUrl: string;
  visible: boolean;
};

export type CabinaGalleryItem = {
  id: string;
  label: string;
  path: string | null;
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
  booking: {
    generalMessage: string;
    informationMessage: string;
    primaryLabel: string;
    servicesLabel: string;
  };
  hours: string[];
  promotions: CabinaPromotion[];
  reviews: CabinaReview[];
  reviewsPlaceholder: string;
  gallery: CabinaGalleryItem[];
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
export const visibleCabinaPromotions = core.promotions.filter((promotion) => promotion.visible);
export const visibleCabinaReviews = core.reviews.filter((review) => review.visible);
