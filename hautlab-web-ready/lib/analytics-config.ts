export const analyticsConfig = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-GJ8ZHDB9YM",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-11350888428",
  googleAdsLeadLabel:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_LEAD ?? "n96KCOX8_PQZEOyfw6Qq",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "849809287547294"
} as const;

// Opt-in tracking is restricted to public, nonclinical marketing content.
// Private Care, physician administration, patient-code URLs and payment results
// must never reach marketing analytics (including URL query strings).
const publicPages = new Set([
  "/", "/en", "/merida", "/merida/dermatologia", "/dermatologia-clinica",
  "/dr-salvador-cordero", "/publicaciones", "/journal",
  "/procedimientos", "/agenda", "/contacto", "/pagos",
  "/gracias", "/cabina", "/cabina/karen-cruz", "/experiencia",
  "/aviso-de-privacidad", "/botox", "/rinomodelacion", "/tratamientos"
]);

const publicPrefixes = [
  "/journal/",
  "/procedimientos/",
  "/merida/"
] as const;

export function isPublicAnalyticsPath(pathname: string): boolean {
  if (!pathname || !pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) return false;
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return publicPages.has(path) || publicPrefixes.some(prefix => path.startsWith(prefix));
}

// Event page_location must NEVER include query parameters, hashes, invitation
// tokens, appointment identifiers or form answers, even on marketing pages.
export function publicAnalyticsLocation(origin: string, pathname: string): string | null {
  if (!isPublicAnalyticsPath(pathname)) return null;
  try {
    const url = new URL(origin);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    return url.origin + pathname;
  } catch {
    return null;
  }
}
