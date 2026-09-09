"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLeadAttribution } from "@/lib/lead-attribution";

type GtagFunction = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { gtag?: GtagFunction };

export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    getLeadAttribution();

    const trackAttributedOutbound = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      const isWhatsApp = url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com");
      if (!isWhatsApp) return;

      const attribution = getLeadAttribution();
      const gtag = (window as AnalyticsWindow).gtag;
      if (!gtag) return;

      gtag("event", "whatsapp_attributed_click", {
        page_path: pathname ?? window.location.pathname,
        lead_source: attribution.utm_source ?? attribution.referrer_source ?? "direct_or_unknown",
        lead_medium: attribution.utm_medium ?? (attribution.referrer_source ? "referral" : "unknown"),
        lead_campaign: attribution.utm_campaign ?? "",
        referrer_host: attribution.referrer_host ?? "",
        landing_path: attribution.landing_path ?? ""
      });
    };

    document.addEventListener("click", trackAttributedOutbound, true);
    return () => document.removeEventListener("click", trackAttributedOutbound, true);
  }, [pathname]);

  return null;
}
