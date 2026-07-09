import { CtaSection } from "@/components/sections/cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { MethodSection } from "@/components/sections/method-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { TreatmentsSection } from "@/components/sections/treatments-section";
import { TrustBand } from "@/components/sections/trust-band";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBand />
      <MethodSection />
      <TreatmentsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
