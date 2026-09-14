"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { ActionState } from "./actions";

/** Shared field styling, so every dashboard form looks like one form. */
export const fieldLabel = "text-xs font-semibold tracking-[0.18em] text-muted uppercase";

export const selectClasses =
  "mt-3 w-full rounded-lg border border-line bg-canvas-raised px-3 py-2.5 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:tracking-[0.1em] file:text-accent-text file:uppercase focus:border-accent-text focus:outline-none";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;

  const ok = state.ok === true;
  const Icon = ok ? CheckCircle2 : TriangleAlert;

  return (
    <p
      // Errors are assertive so they interrupt; successes are polite so they
      // do not talk over whatever the editor is doing next.
      role={ok ? "status" : "alert"}
      className={`mt-5 flex items-start gap-2 text-sm ${ok ? "text-accent-text" : "text-error"}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {state.message}
    </p>
  );
}
