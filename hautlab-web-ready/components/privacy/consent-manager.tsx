"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { analyticsConfig, generalTrackingPaths } from "@/lib/analytics-config";

type ConsentValue = "accepted" | "rejected";
type GoogleConsentValue = "granted" | "denied";
type GtagFunction = (...args: unknown[]) => void;
type MetaPixelFunction = (...args: unknown[]) => void;
type QueuedMetaPixel = MetaPixelFunction & {
  callMethod?: MetaPixelFunction;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: MetaPixelFunction;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const STORAGE_KEY = "hautlab_cookie_consent_v1";
const OPEN_EVENT = "hautlab:open-consent";
const GOOGLE_SCRIPT_ID = "hautlab-google-tag";
const META_SCRIPT_ID = "hautlab-meta-pixel";

function getStoredConsent(): ConsentValue | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function expireCookies(prefixes: string[]) {
  const host = window.location.hostname.replace(/^www\./, "");
  const domains = ["", window.location.hostname, `.${host}`];
  const names = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name))
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)));

  for (const name of names) {
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
    }
  }
}

function ensureGoogleLayer(): GtagFunction {
  window.dataLayer = window.dataLayer ?? [];

  if (!window.gtag) {
    window.gtag = function (..._args: unknown[]) {
      window.dataLayer?.push(arguments);
    } as GtagFunction;
  }

  const root = document.documentElement;
  if (root.dataset.hautlabGoogleConsentDefault !== "true") {
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
    root.dataset.hautlabGoogleConsentDefault = "true";
  }

  return window.gtag;
}

function setGoogleConsent(value: GoogleConsentValue) {
  const gtag = ensureGoogleLayer();
  gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value
  });
}

function ensureGoogleTag(): GtagFunction {
  const gtag = ensureGoogleLayer();

  if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsConfig.ga4MeasurementId)}`;
    document.head.appendChild(script);
  }

  const root = document.documentElement;
  if (root.dataset.hautlabGoogleConfigured !== "true") {
    gtag("js", new Date());
    gtag("config", analyticsConfig.ga4MeasurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    gtag("config", analyticsConfig.googleAdsId, {
      allow_ad_personalization_signals: false
    });
    root.dataset.hautlabGoogleConfigured = "true";
  }

  return gtag;
}

function ensureMetaPixel(): MetaPixelFunction {
  if (window.fbq) return window.fbq;

  const queuedPixel = ((...args: unknown[]) => {
    if (queuedPixel.callMethod) {
      queuedPixel.callMethod(...args);
      return;
    }

    if (!queuedPixel.queue) queuedPixel.queue = [];
    queuedPixel.queue.push(args);
  }) as QueuedMetaPixel;

  queuedPixel.queue = [];
  queuedPixel.loaded = true;
  queuedPixel.version = "2.0";
  queuedPixel.push = (...args: unknown[]) => queuedPixel(...args);

  window.fbq = queuedPixel;
  window._fbq = queuedPixel;

  if (!document.getElementById(META_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = META_SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  queuedPixel("set", "autoConfig", false, analyticsConfig.metaPixelId);
  queuedPixel("consent", "grant");
  queuedPixel("init", analyticsConfig.metaPixelId);

  return queuedPixel;
}

function normalizeEventName(value: string | undefined) {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 40);
  return normalized || null;
}

function isPaymentUrl(url: URL) {
  return ["buy.stripe.com", "mpago.la", "mercadopago.com", "www.mercadopago.com"].some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
}

export function ConsentManager() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const lastTrackedPath = useRef<string | null>(null);
  const trackedScrollPaths = useRef(new Set<string>());
  const trackedEngagementPaths = useRef(new Set<string>());
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setGoogleConsent("denied");
    const stored = getStoredConsent();
    setConsent(stored);
    setOpen(stored === null);
    setReady(true);
  }, []);

  useEffect(() => {
    const openPreferences = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const isGeneralPage = generalTrackingPaths.has(currentPath);

    if (consent !== "accepted" || !isGeneralPage) {
      setGoogleConsent("denied");
      window.fbq?.("consent", "revoke");
      lastTrackedPath.current = null;
      return;
    }

    const gtag = ensureGoogleTag();
    const fbq = ensureMetaPixel();
    setGoogleConsent("granted");
    fbq("consent", "grant");

    const sendGoogleEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
      gtag("event", eventName, {
        page_path: currentPath,
        ...parameters
      });
    };

    if (lastTrackedPath.current !== currentPath) {
      sendGoogleEvent("page_view", {
        page_title: document.title,
        page_location: window.location.href
      });
      fbq("track", "PageView");
      lastTrackedPath.current = currentPath;
    }

    const sendLeadConversion = (method: "whatsapp" | "phone" | "form") => {
      sendGoogleEvent("generate_lead", { method });
      gtag("event", "conversion", {
        send_to: `${analyticsConfig.googleAdsId}/${analyticsConfig.googleAdsLeadLabel}`
      });
    };

    const trackClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const customEvent = normalizeEventName(anchor.dataset.event);
      if (customEvent) sendGoogleEvent(customEvent, { event_category: "engagement" });

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com")) {
        sendGoogleEvent("whatsapp_click", { link_type: "whatsapp" });
        sendLeadConversion("whatsapp");
        fbq("track", "Lead");
        fbq("trackCustom", "WhatsAppClick");
        return;
      }

      if (url.protocol === "tel:") {
        sendGoogleEvent("phone_click", { link_type: "phone" });
        sendLeadConversion("phone");
        fbq("track", "Contact");
        return;
      }

      if (url.hostname === "maps.app.goo.gl" || url.pathname.includes("/maps")) {
        sendGoogleEvent("maps_click", { link_type: "maps" });
        fbq("trackCustom", "MapClick");
        return;
      }

      if (isPaymentUrl(url)) {
        sendGoogleEvent("payment_click", { payment_provider: url.hostname });
        sendGoogleEvent("begin_checkout", { payment_provider: url.hostname });
        fbq("track", "InitiateCheckout");
        return;
      }

      if (url.hostname.endsWith("instagram.com")) {
        sendGoogleEvent("instagram_click", { link_type: "social" });
      }

      if (url.protocol === "mailto:") {
        sendGoogleEvent("email_click", { link_type: "email" });
      }
    };

    const trackValidatedLead = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail =
        event.detail && typeof event.detail === "object"
          ? (event.detail as Record<string, unknown>)
          : {};
      const safeDetail = Object.fromEntries(
        ["form_id", "pathway", "city", "source", "medium", "campaign"]
          .map((key) => [key, typeof detail[key] === "string" ? detail[key] : undefined] as const)
          .filter((entry) => Boolean(entry[1]))
      );

      sendGoogleEvent("form_submit", safeDetail);
      sendLeadConversion("form");
      fbq("track", "Lead");
    };

    const trackScroll = () => {
      if (trackedScrollPaths.current.has(currentPath)) return;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const progress = (window.scrollY / scrollableHeight) * 100;
      if (progress < 75) return;

      trackedScrollPaths.current.add(currentPath);
      sendGoogleEvent("scroll_75", { percent_scrolled: 75 });
      fbq("trackCustom", "Scroll75");
      window.removeEventListener("scroll", trackScroll);
    };

    const engagementTimer = window.setTimeout(() => {
      if (trackedEngagementPaths.current.has(currentPath)) return;
      trackedEngagementPaths.current.add(currentPath);
      sendGoogleEvent("engaged_45_seconds", { engagement_time_msec: 45000 });
      fbq("trackCustom", "Engaged45Seconds");
    }, 45000);

    document.addEventListener("click", trackClick, true);
    window.addEventListener("hautlab:validated-lead", trackValidatedLead);
    window.addEventListener("scroll", trackScroll, { passive: true });
    trackScroll();

    return () => {
      document.removeEventListener("click", trackClick, true);
      window.removeEventListener("hautlab:validated-lead", trackValidatedLead);
      window.removeEventListener("scroll", trackScroll);
      window.clearTimeout(engagementTimer);
    };
  }, [consent, currentPath, ready]);

  function saveConsent(value: ConsentValue) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // The preference still applies for the current session.
    }

    if (value === "rejected") {
      setGoogleConsent("denied");
      window.fbq?.("consent", "revoke");
      expireCookies(["_ga", "_gid", "_gat", "_gcl_", "_fbp", "_fbc"]);
    }

    setConsent(value);
    setOpen(false);
  }

  if (!ready || (!open && consent !== null)) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <div className="rounded-[1.75rem] border border-line bg-[#0b0a09]/95 p-5 shadow-calm backdrop-blur-2xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/[0.04] text-champagne">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p id="cookie-title" className="text-base font-medium text-bone">Privacidad y analítica</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              HAUTLAB usa Google Analytics, Google Ads y Meta Pixel de forma opcional para medir visitas generales, solicitudes por WhatsApp, llamadas, ubicación y clics de pago. No se activa en páginas de condiciones o procedimientos específicos y no enviamos nombres, mensajes, diagnósticos ni datos clínicos.
            </p>
            <p className="mt-2 text-xs leading-5 text-quiet">
              Puedes cambiar tu decisión después desde el footer. Consulta el <Link href="/aviso-de-privacidad" className="text-bone underline decoration-line underline-offset-4">aviso de privacidad</Link>.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => saveConsent("rejected")}>Rechazar analítica</Button>
          <Button type="button" onClick={() => saveConsent("accepted")}>Aceptar analítica</Button>
        </div>
      </div>
    </div>
  );
}
