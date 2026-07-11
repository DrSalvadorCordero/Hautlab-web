"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ConsentValue = "accepted" | "rejected";
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
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const STORAGE_KEY = "hautlab_cookie_consent_v1";
const OPEN_EVENT = "hautlab:open-consent";
const PIXEL_ID = "1377800767233124";
const GENERAL_TRACKING_PATHS = new Set<string>(["/", "/pagos"]);

function getStoredConsent(): ConsentValue | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function expireMetaCookies() {
  const host = window.location.hostname.replace(/^www\./, "");
  const domains = ["", window.location.hostname, `.${host}`];

  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
    }
  }
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

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  queuedPixel("set", "autoConfig", false, PIXEL_ID);
  queuedPixel("consent", "grant");
  queuedPixel("init", PIXEL_ID);

  return queuedPixel;
}

export function ConsentManager() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const lastTrackedPath = useRef<string | null>(null);
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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

    const isGeneralPage = GENERAL_TRACKING_PATHS.has(currentPath);

    if (consent !== "accepted" || !isGeneralPage) {
      window.fbq?.("consent", "revoke");
      lastTrackedPath.current = null;
      return;
    }

    const fbq = ensureMetaPixel();
    fbq("consent", "grant");

    if (lastTrackedPath.current !== currentPath) {
      fbq("track", "PageView");
      lastTrackedPath.current = currentPath;
    }

    const trackClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (href.includes("wa.me/")) fbq("track", "Lead");
      if (href.includes("buy.stripe.com") || href.includes("mpago.la")) fbq("track", "InitiateCheckout");
    };

    const trackSubmit = (event: Event) => {
      if (event.target instanceof HTMLFormElement) fbq("track", "Lead");
    };

    document.addEventListener("click", trackClick, true);
    document.addEventListener("submit", trackSubmit, true);

    return () => {
      document.removeEventListener("click", trackClick, true);
      document.removeEventListener("submit", trackSubmit, true);
    };
  }, [consent, currentPath, ready]);

  function saveConsent(value: ConsentValue) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // The preference still applies for the current session.
    }

    if (value === "rejected") {
      window.fbq?.("consent", "revoke");
      expireMetaCookies();
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
              HAUTLAB usa analítica publicitaria opcional para medir visitas generales, solicitudes por WhatsApp y clics de pago. No se activa en páginas de condiciones o procedimientos específicos y no enviamos nombres, mensajes, diagnósticos ni datos clínicos.
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
