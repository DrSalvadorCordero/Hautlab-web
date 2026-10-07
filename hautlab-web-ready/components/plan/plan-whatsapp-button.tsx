"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAttributedWhatsAppUrl } from "@/lib/client/growth-attribution";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function PlanWhatsAppButton({ code }: { code: string }) {
  async function continuePlan() {
    const base = buildWhatsAppLink(
      `Hola, quiero continuar mi plan HAUTLAB y agendar una valoración.\nPlan: ${code}`,
    );
    const attributed = await buildAttributedWhatsAppUrl(base, "es");
    window.location.assign(attributed);
  }

  return (
    <Button type="button" size="lg" onClick={continuePlan}>
      Continuar por WhatsApp <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
