import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Flatter and squarer than the previous pass on purpose: a hairline border
 * plus a two-point accent rule along the top edge reads as "printed card,"
 * where a heavy drop shadow reads as "SaaS panel." Elevation on hover is a
 * per-consumer choice (see expertise.tsx), not a default here.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line border-t-2 border-t-accent/40 bg-canvas-raised p-8 transition-colors duration-300",
        className,
      )}
      {...props}
    />
  );
}
