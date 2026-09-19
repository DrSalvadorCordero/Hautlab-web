"use client";

type AttributionSnapshot = {
  landingUrl: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
};

const STORAGE_KEY = "hautlab_growth_attribution_v1";
const REF_PATTERN = /\n?\s*Ref:\s*HL-[A-Z0-9]{12}\s*$/i;

function campaignValue(url: URL, key: string) {
  const value = url.searchParams.get(key)?.trim();
  return value ? value.slice(0, 500) : null;
}

function readSnapshot(): AttributionSnapshot {
  const url = new URL(window.location.href);
  return {
    landingUrl: url.toString(),
    referrer: document.referrer?.trim() ? document.referrer.slice(0, 2048) : null,
    utmSource: campaignValue(url, "utm_source"),
    utmMedium: campaignValue(url, "utm_medium"),
    utmCampaign: campaignValue(url, "utm_campaign"),
    utmContent: campaignValue(url, "utm_content"),
    utmTerm: campaignValue(url, "utm_term"),
    gclid: campaignValue(url, "gclid"),
    fbclid: campaignValue(url, "fbclid"),
    msclkid: campaignValue(url, "msclkid"),
  };
}

function hasCampaign(snapshot: AttributionSnapshot) {
  return Boolean(
    snapshot.utmSource ||
      snapshot.utmMedium ||
      snapshot.utmCampaign ||
      snapshot.utmContent ||
      snapshot.utmTerm ||
      snapshot.gclid ||
      snapshot.fbclid ||
      snapshot.msclkid,
  );
}

function readStored(): AttributionSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AttributionSnapshot;
    return parsed && typeof parsed.landingUrl === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function rememberGrowthAttribution() {
  const current = readSnapshot();
  const stored = readStored();

  // Keep the first meaningful campaign touch during this browser session.
  if (!stored || (!hasCampaign(stored) && hasCampaign(current))) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Attribution must never block navigation.
    }
  }
}

function baseWhatsAppText(url: URL, language: "es" | "en") {
  const existing = url.searchParams.get("text")?.replace(REF_PATTERN, "").trim();
  if (existing) return existing;
  return language === "en"
    ? "Hello, I'd like information about HAUTLAB."
    : "Hola, quisiera información sobre HAUTLAB.";
}

export async function buildAttributedWhatsAppUrl(
  href: string,
  language: "es" | "en",
): Promise<string> {
  rememberGrowthAttribution();
  const snapshot = readStored() ?? readSnapshot();

  let response: Response;
  try {
    response = await fetch("/api/growth/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...snapshot,
        currentUrl: window.location.href,
        language,
      }),
      cache: "no-store",
    });
  } catch {
    return href;
  }

  if (!response.ok) return href;

  const payload = (await response.json().catch(() => null)) as
    | { code?: string }
    | null;
  const code = payload?.code;
  if (!code || !/^HL-[A-Z0-9]{12}$/.test(code)) return href;

  try {
    const url = new URL(href, window.location.origin);
    url.searchParams.set("text", `${baseWhatsAppText(url, language)}\nRef: ${code}`);
    return url.toString();
  } catch {
    return href;
  }
}
