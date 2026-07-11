import { CtaSection } from "@/components/sections/cta-section";
import { FeaturedTreatmentsSection } from "@/components/sections/featured-treatments-section";
import { HeroSection } from "@/components/sections/hero-section";
import { MethodSection } from "@/components/sections/method-section";
import { PhilosophySection } from "@/components/sections/philosophy-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { TreatmentsSection } from "@/components/sections/treatments-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PhilosophySection />
      <TreatmentsSection />
      <MethodSection />
      <FeaturedTreatmentsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
