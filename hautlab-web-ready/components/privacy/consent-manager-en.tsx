"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { analyticsConfig } from "@/lib/analytics-config";
import { CONSENT_COOKIE_NAME, parseConsentValue, type ConsentValue } from "@/lib/consent";

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

const OPEN_EVENT = "hautlab:open-consent";
const GOOGLE_SCRIPT_ID = "hautlab-google-tag";
const META_SCRIPT_ID = "hautlab-meta-pixel";

function getStoredConsent(): ConsentValue | null {
  try {
    return parseConsentValue(window.localStorage.getItem(CONSENT_COOKIE_NAME));
  } catch {
    return null;
  }
}

function persistConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_COOKIE_NAME, value);
  } catch {
    // The cookie still preserves the preference.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
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

function ensureGoogleLayer() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    (function (..._args: unknown[]) {
      window.dataLayer?.push(arguments);
    } as GtagFunction);

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

function enableGoogle() {
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
    gtag("config", analyticsConfig.googleAdsId, { allow_ad_personalization_signals: false });
    root.dataset.hautlabGoogleConfigured = "true";
  }

  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted"
  });

  return gtag;
}

function enableMeta() {
  if (window.fbq) {
    window.fbq("consent", "grant");
    return window.fbq;
  }

  const queuedPixel = ((...args: unknown[]) => {
    if (queuedPixel.callMethod) {
      queuedPixel.callMethod(...args);
      return;
    }
    queuedPixel.queue = queuedPixel.queue ?? [];
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

function disableTracking() {
  ensureGoogleLayer()("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.fbq?.("consent", "revoke");
}

export function ConsentManagerEn({ initialConsent }: { initialConsent: ConsentValue | null }) {
  const [consent, setConsent] = useState<ConsentValue | null>(initialConsent);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(initialConsent === null);
  const tracked = useRef(false);

  useEffect(() => {
    disableTracking();
    const stored = getStoredConsent() ?? initialConsent;
    setConsent(stored);
    setOpen(stored === null);
    setReady(true);
  }, [initialConsent]);

  useEffect(() => {
    const openPreferences = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    if (!ready || consent !== "accepted") return;

    const gtag = enableGoogle();
    const fbq = enableMeta();

    if (!tracked.current) {
      gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_title: document.title,
        page_location: window.location.href,
        page_language: "en"
      });
      fbq("track", "PageView");
      tracked.current = true;
    }

    const trackClick = (event: MouseEvent) => {
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

      if (url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com")) {
        gtag("event", "whatsapp_click", { page_language: "en", link_type: "whatsapp" });
        gtag("event", "generate_lead", { method: "whatsapp", page_language: "en" });
        gtag("event", "conversion", {
          send_to: `${analyticsConfig.googleAdsId}/${analyticsConfig.googleAdsLeadLabel}`
        });
        fbq("track", "Lead");
        fbq("trackCustom", "WhatsAppClick", { language: "en" });
      }
    };

    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, [consent, ready]);

  function saveConsent(value: ConsentValue) {
    persistConsent(value);

    if (value === "rejected") {
      disableTracking();
      expireCookies(["_ga", "_gid", "_gat", "_gcl_", "_fbp", "_fbc"]);
    }

    setConsent(value);
    setOpen(false);
  }

  if (!open && consent !== null) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl" role="dialog" aria-labelledby="cookie-title-en" aria-live="polite">
      <div className="rounded-[1.75rem] border border-line bg-[#0b0a09]/95 p-5 shadow-calm backdrop-blur-2xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/[0.04] text-champagne">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p id="cookie-title-en" className="text-base font-medium text-bone">Privacy and analytics</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              HAUTLAB optionally uses Google Analytics, Google Ads and Meta Pixel to measure general visits and appointment actions. Names, messages, diagnoses and clinical information are not sent through these analytics tools.
            </p>
            <p className="mt-2 text-xs leading-5 text-quiet">
              You can change this choice later from the footer. Read the <Link href="/aviso-de-privacidad" className="text-bone underline decoration-line underline-offset-4">privacy notice</Link>.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => saveConsent("rejected")}>Reject analytics</Button>
          <Button type="button" onClick={() => saveConsent("accepted")}>Accept analytics</Button>
        </div>
      </div>
    </div>
  );
}
