import coreData from "@/data/cabina-content.json";
import faqData from "@/data/cabina-faq.json";
import servicesData from "@/data/cabina-services.json";
import { z } from "zod";

const text = (min = 1, max = 600) => z.string().trim().min(min).max(max);
const internalImagePath = z
  .string()
  .regex(/^\/visuals\/[a-zA-Z0-9/_-]+\.(?:webp|avif|jpe?g|png)$/)
  .nullable();
const externalSource = z.union([z.literal(""), z.string().url().startsWith("https://")]);

export const cabinaServiceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/),
  name: text(3, 100),
  description: text(20, 700),
  duration: text(3, 80),
  indications: text(10, 500),
  price: text(3, 100),
  visible: z.boolean()
});

export const cabinaFaqSchema = z.object({
  question: text(8, 180),
  answer: text(20, 700)
});

export const cabinaCoreSchema = z.object({
  unitName: text(3, 120),
  displayBrand: text(2, 60),
  displayUnit: text(3, 100),
  coordinator: z.object({
    name: text(3, 100),
    role: text(5, 160),
    description: text(20, 900),
    medicalBoundary: text(20, 700),
    photo: internalImagePath
  }),
  medicalDirection: z.object({
    name: text(3, 100),
    role: text(5, 180),
    license: text(5, 100)
  }),
  hero: z.object({
    title: text(5, 160),
    subtitle: text(20, 500),
    description: text(20, 700)
  }),
  positioning: z.object({
    title: text(5, 160),
    paragraphs: z.array(text(20, 900)).min(1).max(6)
  }),
  booking: z.object({
    generalMessage: text(10, 600),
    informationMessage: text(10, 600),
    primaryLabel: text(3, 80),
    servicesLabel: text(3, 80)
  }),
  hours: z.array(text(3, 180)).min(1).max(12),
  promotions: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{2,60}$/),
        title: text(3, 120),
        description: text(10, 600),
        validUntil: z.string().trim().max(40),
        visible: z.boolean()
      })
    )
    .max(20),
  reviews: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{2,60}$/),
        initials: text(1, 12),
        quote: text(10, 800),
        service: z.string().trim().max(100),
        date: z.string().trim().max(40),
        sourceUrl: externalSource,
        visible: z.boolean()
      })
    )
    .max(40),
  reviewsPlaceholder: text(10, 500),
  gallery: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{2,60}$/),
        label: text(3, 160),
        path: internalImagePath
      })
    )
    .max(30),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const cabinaPayloadSchema = z.object({
  core: cabinaCoreSchema,
  services: z.array(cabinaServiceSchema).max(40),
  faq: z.array(cabinaFaqSchema).max(30)
});

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

const core = cabinaCoreSchema.parse(coreData) as CabinaCoreContent;
const services = z.array(cabinaServiceSchema).parse(servicesData) as CabinaService[];
const faq = z.array(cabinaFaqSchema).parse(faqData) as CabinaFaqItem[];

export const cabinaContent: CabinaContent = {
  ...core,
  services,
  faq
};

export const visibleCabinaServices = services.filter((service) => service.visible);
export const visibleCabinaPromotions = core.promotions.filter((promotion) => promotion.visible);
export const visibleCabinaReviews = core.reviews.filter((review) => review.visible);
