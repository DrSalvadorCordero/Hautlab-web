type GtagFunction = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { gtag?: GtagFunction };

const CONSENT_STORAGE_KEY = "hautlab_cookie_consent_v1";
const GENERAL_TRACKING_PATHS = new Set(["/", "/pagos", "/contacto", "/gracias"]);

export type HautlabAnalyticsEventName =
  | "ai_assistant_open"
  | "ai_assistant_message"
  | "ai_assistant_handoff";

export function trackHautlabEvent(name: HautlabAnalyticsEventName) {
  if (typeof window === "undefined") return;
  if (!GENERAL_TRACKING_PATHS.has(window.location.pathname)) return;

  try {
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== "accepted") return;
  } catch {
    return;
  }

  const gtag = (window as AnalyticsWindow).gtag;
  if (!gtag) return;

  gtag("event", name, {
    page_path: window.location.pathname,
    event_category: "engagement"
  });
}
