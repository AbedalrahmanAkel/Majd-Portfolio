"use client";

import { useActionState, useEffect, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { addPhotosAction, type ActionState } from "./actions";
import { CategoryField } from "./category-field";
import { FormMessage, fieldLabel, selectClasses } from "./form-parts";

interface PhotoUploadFormProps {
  discipline: "photography" | "videography";
  categories: { slug: string; label: string }[];
}

const initial: ActionState = {};

interface Staged {
  file: File;
  url: string;
}

/**
 * Adds images to a gallery.
 *
 * Previews are local object URLs — nothing is uploaded until Save, which makes
 * this a review step rather than an undo step. Compression happens server-side
 * in `addPhotosAction` via sharp.
 */
export function PhotoUploadForm({ discipline, categories }: PhotoUploadFormProps) {
  const [state, formAction, pending] = useActionState(addPhotosAction, initial);
  const [staged, setStaged] = useState<Staged[]>([]);
  /** Bumping this remounts the file input, which is how it gets cleared —
   *  a file input's value cannot be set programmatically. */
  const [inputKey, setInputKey] = useState(0);
  const [lastToken, setLastToken] = useState<string | undefined>(undefined);

  // Adjusting state during render is React's recommended alternative to an
  // effect for "react to a value that changed". An effect here would commit a
  // render showing stale previews and then immediately re-render without them.
  if (state.token && state.token !== lastToken) {
    setLastToken(state.token);
    setStaged([]);
    setInputKey((key) => key + 1);
  }

  // One cleanup covers every path that drops a preview: it runs when
  // `staged` is replaced (new selection, or cleared after a save) and again
  // when the form unmounts. Revoking in the change handler as well would be
  // redundant.
  useEffect(() => () => staged.forEach((item) => URL.revokeObjectURL(item.url)), [staged]);

  function pick(list: FileList | null) {
    setStaged(
      Array.from(list ?? []).map((file) => ({ file, url: URL.createObjectURL(file) })),
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="discipline" value={discipline} />

      <div className="grid gap-5 sm:grid-cols-2">
        <CategoryField categories={categories} />

        <div>
          <label htmlFor={`${discipline}-photos`} className={fieldLabel}>
            Images
          </label>
          <input
            key={inputKey}
            id={`${discipline}-photos`}
            name="files"
            type="file"
            accept="image/*"
            multiple
            required
            onChange={(event) => pick(event.target.files)}
            className={selectClasses}
          />
          <p className="mt-2 text-xs text-muted">
            JPEG, PNG, WebP, AVIF, TIFF or GIF. Resized to 2000px and re-encoded with Sharp on save.
          </p>
        </div>
      </div>

      {staged.length > 0 ? (
        <div className="mt-6">
          <p className={fieldLabel}>
            Preview — {staged.length} image{staged.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            {staged.map((item) => (
              <li
                key={item.url}
                className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-canvas-raised"
              >
                {/* A local blob URL: next/image would have nothing to
                    optimise, so a plain img is the right element here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.file.name} className="size-full object-cover" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <ImagePlus className="size-4" aria-hidden="true" />
          Nothing selected yet.
        </p>
      )}

      <FormMessage state={state} />

      <button
        type="submit"
        disabled={pending || staged.length === 0}
        className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[0.7rem] font-semibold tracking-[0.14em] text-canvas uppercase transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
      >
        <Upload className="size-4" aria-hidden="true" />
        {pending
          ? "Compressing…"
          : `Save ${staged.length || ""} image${staged.length === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
