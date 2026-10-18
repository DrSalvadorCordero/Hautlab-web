"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_COOKIE_NAME, parseConsentValue } from "@/lib/consent";

export const HAUTLAB_CONSENT_CHANGED = "hautlab:consent-changed";

// Consent is evaluated in the browser, never guessed from server side renders.
// Avoid mounting the Vercel analytics collector before an explicit opt-in.
export function ConsentedPublicTelemetry() {
  const [permitted, setPermitted] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      let stored = null;
      try {
        stored = parseConsentValue(window.localStorage.getItem(CONSENT_COOKIE_NAME));
      } catch {
        // Private-browsing storage may be disabled.
      }

      const cookieValue = document.cookie
        .split(";")
        .map(entry => entry.trim())
        .find(entry => entry.startsWith(CONSENT_COOKIE_NAME + "="))
        ?.split("=")[1];
      setPermitted((stored ?? parseConsentValue(cookieValue)) === "accepted");
    };

    syncConsent();
    window.addEventListener(HAUTLAB_CONSENT_CHANGED, syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener(HAUTLAB_CONSENT_CHANGED, syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  if (!permitted) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
