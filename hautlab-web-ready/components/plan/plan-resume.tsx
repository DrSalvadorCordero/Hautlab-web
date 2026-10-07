"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const STORAGE_KEY = "hautlab_plan_v1";

export function PlanResume() {
  const [plan, setPlan] = useState<{ code: string; portalUrl: string } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { code?: string; portalUrl?: string };
      if (
        parsed.code &&
        /^HLP-[A-Z0-9]{8}$/.test(parsed.code) &&
        parsed.portalUrl &&
        parsed.portalUrl.startsWith(window.location.origin)
      ) {
        setPlan({ code: parsed.code, portalUrl: parsed.portalUrl });
      }
    } catch {
      // Personalization should never block the page.
    }
  }, []);

  if (!plan) return null;

  return (
    <a
      href={plan.portalUrl}
      className="mt-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone"
      data-event="hautlab_plan_resume"
    >
      Continuar tu plan {plan.code} <ArrowRight className="h-3.5 w-3.5" />
    </a>
  );
}
