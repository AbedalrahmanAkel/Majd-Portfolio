import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * A stamped tag, not a chip pill: square-ish corners, hairline border,
 * tracked small caps — the same "rubber stamp" mark editorial layouts use
 * for status/category labels, in place of the previous filled pill.
 */
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-accent-text/50 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-accent-text uppercase",
        className,
      )}
      {...props}
    />
  );
}
