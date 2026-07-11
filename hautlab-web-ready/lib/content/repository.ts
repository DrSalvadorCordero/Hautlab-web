import type { TreatmentContent } from "./types";

export interface TreatmentRepository {
  getAllPublished(): Promise<TreatmentContent[]>;
  getBySlug(slug: string): Promise<TreatmentContent | null>;
  getRelated(slugs: string[]): Promise<TreatmentContent[]>;
}

export class LocalTreatmentRepository implements TreatmentRepository {
  constructor(private readonly items: TreatmentContent[]) {}

  async getAllPublished() {
    return this.items.filter((item) => item.governance.status === "published");
  }

  async getBySlug(slug: string) {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async getRelated(slugs: string[]) {
    const order = new Map(slugs.map((slug, index) => [slug, index]));
    return this.items
      .filter((item) => order.has(item.slug))
      .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }
}

/*
Phase 2: SanityTreatmentRepository will implement the same interface.
Page components must depend on TreatmentRepository, never directly on a CMS SDK.
*/
