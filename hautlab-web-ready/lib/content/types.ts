import { z } from "zod";

export const contentStatusSchema = z.enum([
  "draft",
  "medical_review",
  "approved",
  "published",
  "archived"
]);

export const faqSchema = z.object({
  question: z.string().min(8),
  answer: z.string().min(20)
});

export const seoSchema = z.object({
  title: z.string().min(20).max(65),
  description: z.string().min(70).max(170),
  canonicalPath: z.string().startsWith("/"),
  noIndex: z.boolean().default(false),
  ogImage: z.string().optional()
});

export const governanceSchema = z.object({
  status: contentStatusSchema,
  medicalReview: z.enum(["pending", "approved", "not_required"]),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  lastUpdated: z.string().datetime(),
  sources: z.array(z.string()).default([]),
  disclaimer: z.string().optional()
});

export const treatmentSchema = z.object({
  id: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  eyebrow: z.string().min(3),
  publicArea: z.enum([
    "diseno-facial",
    "piel-y-textura",
    "condiciones-de-piel",
    "procedimientos-focales"
  ]),
  shortDescription: z.string().min(30),
  heroStatement: z.string().min(10),
  whatIsIt: z.array(z.string().min(30)).min(1),
  indicatedFor: z.array(z.string().min(3)).min(1),
  notIndicatedFor: z.array(z.string().min(3)).default([]),
  hautlabApproach: z.array(z.string().min(25)).min(1),
  expectations: z.object({
    sessionTime: z.string(),
    anesthesia: z.string(),
    recovery: z.string(),
    followUp: z.string(),
    duration: z.string()
  }),
  investment: z.object({
    label: z.string(),
    note: z.string()
  }),
  faq: z.array(faqSchema).min(2),
  relatedSlugs: z.array(z.string()).default([]),
  seo: seoSchema,
  governance: governanceSchema
});

export type TreatmentContent = z.infer<typeof treatmentSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
