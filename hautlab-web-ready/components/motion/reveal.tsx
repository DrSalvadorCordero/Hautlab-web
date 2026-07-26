import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  void delay;
  return <div className={cn(className)}>{children}</div>;
}
