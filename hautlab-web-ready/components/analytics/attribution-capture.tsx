"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLeadAttribution } from "@/lib/lead-attribution";

export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    getLeadAttribution();
  }, [pathname]);

  return null;
}
