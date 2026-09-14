"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Star, Trash2 } from "lucide-react";
import { deleteItemAction, setCoverAction } from "./actions";

/** Submit button that reports the enclosing form's pending state. */
function SubmitIcon({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Two-step delete. The first click arms it, the second commits — an inline
 * guard rather than a native `confirm()` dialog, and it disarms itself after a
 * few seconds so a stray armed button cannot be hit much later by accident.
 */
export function DeleteItemButton({
  discipline,
  id,
  title,
}: {
  discipline: string;
  id: string;
  title: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <form action={deleteItemAction} className="contents">
      <input type="hidden" name="discipline" value={discipline} />
      <input type="hidden" name="id" value={id} />

      {armed ? (
        <SubmitIcon
          label="Confirm"
          pendingLabel="Deleting…"
          className="rounded-full bg-error px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.1em] text-canvas uppercase"
        />
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          aria-label={`Delete ${title}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.1em] text-ink-soft uppercase transition-colors hover:border-error hover:text-error"
        >
          <Trash2 className="size-3" aria-hidden="true" />
          Delete
        </button>
      )}
    </form>
  );
}

/** Promote a gallery item to be its discipline's card thumbnail. */
export function SetCoverButton({
  discipline,
  id,
  isCover,
  title,
}: {
  discipline: string;
  id: string;
  isCover: boolean;
  title: string;
}) {
  if (isCover) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-text/50 px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.1em] text-accent-text uppercase">
        <Star className="size-3 fill-current" aria-hidden="true" />
        Thumbnail
      </span>
    );
  }

  return (
    <form action={setCoverAction} className="contents">
      <input type="hidden" name="discipline" value={discipline} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Use ${title} as the gallery thumbnail`}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.1em] text-ink-soft uppercase transition-colors hover:border-accent-text hover:text-accent-text"
      >
        <Star className="size-3" aria-hidden="true" />
        Use as thumbnail
      </button>
    </form>
  );
}
