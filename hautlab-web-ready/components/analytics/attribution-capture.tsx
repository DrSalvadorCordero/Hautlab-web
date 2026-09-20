"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLeadAttribution } from "@/lib/lead-attribution";

export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    // Preserve the first meaningful acquisition touch during this browser session.
    // Analytics events themselves are emitted only by the consent managers.
    getLeadAttribution();
  }, [pathname]);

  return null;
}
