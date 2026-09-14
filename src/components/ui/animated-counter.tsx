"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  /** e.g. "50+", "500K+", "2+", "60" — leading number is animated, the rest
   * of the string (suffix like "+" or "K+") is preserved as-is. */
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-64px" });
  const shouldReduceMotion = useReducedMotion();

  const match = value.match(/^(\d+(?:\.\d+)?)/);
  const numeric = match ? parseFloat(match[1]) : null;
  const suffix = match ? value.slice(match[1].length) : "";
  const canAnimate = numeric !== null && !shouldReduceMotion;

  // Only ever written to asynchronously, from inside the rAF callback below
  // — never synchronously in the effect body — so it starts (and stays)
  // null whenever the counter isn't actively animating.
  const [tickValue, setTickValue] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView || !canAnimate) {
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const isInteger = Number.isInteger(numeric);
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (numeric as number) * eased;
      setTickValue(
        `${isInteger ? Math.round(current) : current.toFixed(1)}${suffix}`,
      );
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, canAnimate, numeric, suffix]);

  const initialDisplay = numeric !== null ? `0${suffix}` : value;
  // Not yet animating (before scroll, or reduced-motion/non-numeric): show
  // the resting value instead of a stuck "0". Mid-/post-animation, the
  // ticking value from state takes over.
  const display = tickValue ?? (isInView && !canAnimate ? value : initialDisplay);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {display}
    </span>
  );
}
