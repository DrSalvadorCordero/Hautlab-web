const STORAGE_KEY = "hautlab_lead_attribution_v2";
const allowedKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "referrer_source",
  "referrer_host",
  "landing_path"
] as const;

export type LeadAttribution = Partial<Record<(typeof allowedKeys)[number], string>>;

const aiReferrers: Array<[RegExp, string]> = [
  [/(^|\.)chatgpt\.com$/i, "chatgpt"],
  [/(^|\.)openai\.com$/i, "chatgpt"],
  [/(^|\.)perplexity\.ai$/i, "perplexity"],
  [/(^|\.)claude\.ai$/i, "claude"],
  [/(^|\.)gemini\.google\.com$/i, "gemini"],
  [/(^|\.)copilot\.microsoft\.com$/i, "copilot"],
  [/(^|\.)poe\.com$/i, "poe"],
  [/(^|\.)you\.com$/i, "you.com"]
];

function clean(value: string | null) {
  return value?.replace(/[^\p{L}\p{N}._:/ -]/gu, "").trim().slice(0, 120) || undefined;
}

function fromCurrentUrl(): LeadAttribution {
  const parameters = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    allowedKeys
      .filter((key) => key.startsWith("utm_") || key === "gclid" || key === "fbclid")
      .map((key) => [key, clean(parameters.get(key))] as const)
      .filter((entry): entry is readonly [(typeof allowedKeys)[number], string] => Boolean(entry[1]))
  );
}

function inferReferrer(): LeadAttribution {
  const landingPath = clean(`${window.location.pathname}${window.location.search}`);
  if (!document.referrer) return landingPath ? { landing_path: landingPath } : {};

  try {
    const url = new URL(document.referrer);
    const host = url.hostname.toLowerCase();
    if (host === window.location.hostname.toLowerCase()) {
      return landingPath ? { landing_path: landingPath } : {};
    }

    const aiMatch = aiReferrers.find(([pattern]) => pattern.test(host));
    const source = aiMatch?.[1]
      ?? (host.includes("google.") ? "google"
        : host.includes("bing.com") ? "bing"
        : host.includes("instagram.com") ? "instagram"
        : host.includes("facebook.com") ? "facebook"
        : host.includes("tiktok.com") ? "tiktok"
        : host.replace(/^www\./, ""));

    return {
      referrer_source: clean(source),
      referrer_host: clean(host),
      landing_path: landingPath
    };
  } catch {
    return landingPath ? { landing_path: landingPath } : {};
  }
}

function fromSession(): LeadAttribution {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}") as LeadAttribution;
    return Object.fromEntries(
      allowedKeys
        .map((key) => [key, clean(parsed[key] ?? null)] as const)
        .filter((entry): entry is readonly [(typeof allowedKeys)[number], string] => Boolean(entry[1]))
    );
  } catch {
    return {};
  }
}

export function getLeadAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};

  const stored = fromSession();
  const currentUrl = fromCurrentUrl();
  const inferred = Object.keys(stored).length ? {} : inferReferrer();
  const attribution = { ...inferred, ...stored, ...currentUrl };

  try {
    if (Object.keys(attribution).length) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    }
  } catch {
    // Attribution is optional; the lead flow must continue without storage.
  }

  return attribution;
}

export function attributionForWhatsApp(attribution: LeadAttribution) {
  const source = attribution.utm_source ?? attribution.referrer_source;
  const campaign = attribution.utm_campaign;
  if (!source && !campaign) return null;

  return [source && `Fuente: ${source}`, campaign && `Campaña: ${campaign}`]
    .filter(Boolean)
    .join(" · ");
}

export function dispatchValidatedLead(
  detail: {
    formId: string;
    pathway: "dermatologia" | "estetica" | "cabina" | "internacional";
    city?: string;
  },
  attribution: LeadAttribution
) {
  const source = attribution.utm_source ?? attribution.referrer_source;
  const medium = attribution.utm_medium ?? (attribution.referrer_source ? "referral" : undefined);

  window.dispatchEvent(
    new CustomEvent("hautlab:validated-lead", {
      detail: {
        form_id: detail.formId.slice(0, 60),
        pathway: detail.pathway,
        city: clean(detail.city ?? null),
        source: clean(source ?? null),
        medium: clean(medium ?? null),
        campaign: clean(attribution.utm_campaign ?? null)
      }
    })
  );
}
