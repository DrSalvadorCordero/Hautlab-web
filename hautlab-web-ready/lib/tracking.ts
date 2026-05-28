declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  if (window.fbq) {
    window.fbq("trackCustom", eventName, params || {});
  }

  if (window.gtag) {
    window.gtag("event", eventName, params || {});
  }
}
