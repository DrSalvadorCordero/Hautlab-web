"use client";

export function CookieSettingsButton({
  label = "Preferencias de cookies",
  className = ""
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("hautlab:open-consent"))}
    >
      {label}
    </button>
  );
}
