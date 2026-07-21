export const analyticsConfig = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-GJ8ZHDB9YM",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-11350888428",
  googleAdsLeadLabel:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_LEAD ?? "stReCN_8_PQZEOyfw6Qq",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "849809287547294"
} as const;

export const generalTrackingPaths = new Set(["/", "/pagos", "/contacto", "/gracias", "/cabina", "/cabina/karen-cruz"]);
