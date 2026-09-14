"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { ArrowRight, Upload } from "lucide-react";
import type { CardSlot } from "@/lib/card-slots";
import type { CardImage } from "@/lib/media-types";
import { replaceCardAction, type ActionState } from "./actions";
import { FormMessage, fieldLabel, selectClasses } from "./form-parts";

interface CardReplaceFormProps {
  slot: CardSlot;
  current?: CardImage;
}

const initial: ActionState = {};

/**
 * Replace one fixed image on the public site.
 *
 * Shown as current → new so the editor can see exactly what they are about to
 * overwrite, and both are rendered inside a frame with the same aspect ratio
 * and `object-cover` the live section uses — so the preview shows the real
 * crop, not the whole picture.
 */
export function CardReplaceForm({ slot, current }: CardReplaceFormProps) {
  const [state, formAction, pending] = useActionState(replaceCardAction, initial);
  const [preview, setPreview] = useState<string | null>(null);
  /** Bumping this remounts the file input, which is the only way to clear it. */
  const [inputKey, setInputKey] = useState(0);
  const [lastToken, setLastToken] = useState<string | undefined>(undefined);

  // Adjusted during render rather than in an effect, so the committed frame
  // never shows the old preview next to a "saved" message.
  if (state.token && state.token !== lastToken) {
    setLastToken(state.token);
    setPreview(null);
    setInputKey((key) => key + 1);
  }

  // Runs when `preview` is replaced or cleared, and on unmount.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-line border-t-2 border-t-accent/40 bg-canvas-raised p-6"
    >
      <input type="hidden" name="key" value={slot.key} />

      <p className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
        {slot.section}
      </p>
      <h3 className="mt-2 font-display text-xl font-medium text-ink">{slot.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{slot.note}</p>

      <div className="mt-5 flex items-center gap-4">
        <figure className="w-28 shrink-0">
          <div
            className="relative overflow-hidden rounded-lg border border-line bg-wine-950"
            style={{ aspectRatio: slot.aspect }}
          >
            {current ? (
              <Image
                src={current.src}
                alt=""
                aria-hidden="true"
                fill
                sizes="112px"
                className="object-cover object-top"
              />
            ) : null}
          </div>
          <figcaption className="mt-2 text-[0.65rem] tracking-[0.12em] text-muted uppercase">
            Current
          </figcaption>
        </figure>

        <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" />

        <figure className="w-28 shrink-0">
          <div
            className="relative overflow-hidden rounded-lg border border-dashed border-line bg-canvas"
            style={{ aspectRatio: slot.aspect }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="New image preview" className="size-full object-cover object-top" />
            ) : (
              <span className="flex size-full items-center justify-center text-[0.65rem] text-muted">
                None
              </span>
            )}
          </div>
          <figcaption className="mt-2 text-[0.65rem] tracking-[0.12em] text-muted uppercase">
            New
          </figcaption>
        </figure>
      </div>

      <label htmlFor={`file-${slot.key}`} className={`${fieldLabel} mt-6 block`}>
        Replacement image
      </label>
      <input
        key={inputKey}
        id={`file-${slot.key}`}
        name="file"
        type="file"
        accept="image/*"
        required
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
        className={selectClasses}
      />

      <FormMessage state={state} />

      <button
        type="submit"
        disabled={pending || !preview}
        className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3 text-[0.7rem] font-semibold tracking-[0.14em] text-ink uppercase transition-colors duration-300 hover:border-accent-text hover:text-accent-text disabled:pointer-events-none disabled:opacity-40"
      >
        <Upload className="size-3.5" aria-hidden="true" />
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
