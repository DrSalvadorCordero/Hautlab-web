import { CONSENT_COOKIE_NAME } from "@/lib/consent";
import { isPublicAnalyticsPath } from "@/lib/analytics-config";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!isPublicAnalyticsPath(window.location.pathname)) return;
  try {
    if (window.localStorage.getItem(CONSENT_COOKIE_NAME) !== "accepted") return;
  } catch {
    return;
  }

  if (window.fbq) {
    window.fbq("trackCustom", eventName, params || {});
  }

  if (window.gtag) {
    window.gtag("event", eventName, params || {});
  }
}
