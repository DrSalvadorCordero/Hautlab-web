export const CONSENT_COOKIE_NAME = "hautlab_cookie_consent_v1";

export type ConsentValue = "accepted" | "rejected";

export function parseConsentValue(value: string | null | undefined): ConsentValue | null {
  return value === "accepted" || value === "rejected" ? value : null;
}
