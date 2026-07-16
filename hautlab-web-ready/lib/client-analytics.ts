export const HAUTLAB_ANALYTICS_EVENT = "hautlab:analytics-event";

export type HautlabAnalyticsEventDetail = {
  name: "ai_assistant_open" | "ai_assistant_message" | "ai_assistant_handoff";
};

export function trackHautlabEvent(name: HautlabAnalyticsEventDetail["name"]) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<HautlabAnalyticsEventDetail>(HAUTLAB_ANALYTICS_EVENT, {
      detail: { name }
    })
  );
}
