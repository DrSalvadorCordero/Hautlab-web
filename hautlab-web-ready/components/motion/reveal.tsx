"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.unobserve(node);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = {
    "--reveal-delay": `${Math.max(0, delay)}s`
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      data-reveal-state={visible ? "visible" : "hidden"}
      className={cn(
        "motion-safe:transform-gpu motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:[transition-delay:var(--reveal-delay)]",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "motion-safe:opacity-0 motion-safe:translate-y-5 motion-safe:scale-[0.995]",
        className
      )}
    >
      {children}
    </div>
  );
}
