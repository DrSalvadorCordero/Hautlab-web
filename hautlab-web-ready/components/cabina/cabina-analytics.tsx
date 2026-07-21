"use client";

import { useEffect } from "react";
import { trackHautlabEvent } from "@/lib/client-analytics";

export function CabinaAnalytics({ profile = false }: { profile?: boolean }) {
  useEffect(() => {
    trackHautlabEvent(profile ? "cabina_karen_profile_view" : "cabina_page_view");

    if (typeof window === "undefined") return;
    const referrer = document.referrer.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    if (referrer.includes("google.")) {
      trackHautlabEvent("cabina_google_visit", { referrer: "google" });
    }

    if (["utm_source", "utm_medium", "utm_campaign"].some((key) => params.has(key))) {
      trackHautlabEvent("cabina_campaign_visit", {
        campaign: params.get("utm_campaign") ?? "unspecified"
      });
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      trackHautlabEvent("cabina_mobile_visit");
    }
  }, [profile]);

  return null;
}
