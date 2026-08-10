import { CONSENT_COOKIE_NAME } from "@/lib/consent";

type GtagFunction = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { gtag?: GtagFunction };

const GENERAL_TRACKING_PATHS = new Set(["/", "/pagos", "/pagos/resultado", "/contacto", "/gracias", "/cabina", "/cabina/karen-cruz"]);

export type HautlabAnalyticsEventName =
  | "ai_assistant_open"
  | "ai_assistant_message"
  | "ai_assistant_handoff"
  | "cabina_page_view"
  | "cabina_karen_profile_view"
  | "cabina_google_visit"
  | "cabina_campaign_visit"
  | "cabina_mobile_visit"
  | "cabina_form_submit"
  | "payment_begin_checkout"
  | "payment_checkout_redirect"
  | "payment_confirmed";

export function trackHautlabEvent(name: HautlabAnalyticsEventName, parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!GENERAL_TRACKING_PATHS.has(window.location.pathname)) return;

  try {
    if (window.localStorage.getItem(CONSENT_COOKIE_NAME) !== "accepted") return;
  } catch {
    return;
  }

  const gtag = (window as AnalyticsWindow).gtag;
  if (!gtag) return;

  gtag("event", name, {
    page_path: window.location.pathname,
    event_category: "engagement",
    ...parameters
  });
}
