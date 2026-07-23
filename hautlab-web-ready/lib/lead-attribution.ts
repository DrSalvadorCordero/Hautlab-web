const STORAGE_KEY = "hautlab_lead_attribution_v1";
const allowedKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid"
] as const;

export type LeadAttribution = Partial<Record<(typeof allowedKeys)[number], string>>;

function clean(value: string | null) {
  return value?.replace(/[^\p{L}\p{N}._:/ -]/gu, "").trim().slice(0, 120) || undefined;
}

function fromCurrentUrl(): LeadAttribution {
  const parameters = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, clean(parameters.get(key))] as const)
      .filter((entry): entry is readonly [(typeof allowedKeys)[number], string] => Boolean(entry[1]))
  );
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

  const attribution = { ...fromSession(), ...fromCurrentUrl() };
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
  const source = attribution.utm_source;
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
  window.dispatchEvent(
    new CustomEvent("hautlab:validated-lead", {
      detail: {
        form_id: detail.formId.slice(0, 60),
        pathway: detail.pathway,
        city: clean(detail.city ?? null),
        source: clean(attribution.utm_source ?? null),
        medium: clean(attribution.utm_medium ?? null),
        campaign: clean(attribution.utm_campaign ?? null)
      }
    })
  );
}

