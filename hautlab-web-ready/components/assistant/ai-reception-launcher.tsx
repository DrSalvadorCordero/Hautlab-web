"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const launcherClassName =
  "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[90] inline-flex min-h-12 items-center gap-3 rounded-full border border-bone/15 bg-[#11100e]/95 px-4 py-3 text-sm font-medium text-bone shadow-calm backdrop-blur-xl transition hover:border-champagne/45 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/50 sm:bottom-6 sm:right-6";

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function LauncherContent({ loading = false }: { loading?: boolean }) {
  return (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-background">
        <MessageIcon />
      </span>
      <span className="hidden sm:inline">{loading ? "Abriendo…" : "Pregunta a HAUTLAB"}</span>
    </>
  );
}

const AIReceptionAssistant = dynamic(
  () => import("@/components/assistant/ai-reception-assistant").then((module) => module.AIReceptionAssistant),
  {
    ssr: false,
    loading: () => (
      <div className={launcherClassName} role="status" aria-live="polite">
        <LauncherContent loading />
      </div>
    )
  }
);

export function AIReceptionLauncher() {
  const [activated, setActivated] = useState(false);

  if (activated) return <AIReceptionAssistant initialOpen />;

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className={launcherClassName}
      aria-label="Abrir asistente virtual de HAUTLAB"
    >
      <LauncherContent />
    </button>
  );
}
