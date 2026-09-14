"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaItem } from "@/lib/media-types";

interface MediaLightboxProps {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Suppress the browser's own save/copy affordances on media. Scoped to the
 *  media element only — right-click still works everywhere else on the page. */
const blockContextMenu = (event: React.MouseEvent) => event.preventDefault();

export function MediaLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: MediaLightboxProps) {
  const isOpen = index !== null;
  const item = isOpen ? items[index] : undefined;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const goPrevious = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  // Keyboard: Escape closes, arrows move, Tab is trapped to the dialog.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, goPrevious, goNext]);

  // Lock background scroll while the overlay is up, and compensate for the
  // scrollbar so the page behind doesn't shift.
  useEffect(() => {
    if (!isOpen) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [isOpen]);

  // Move focus into the dialog on open, and hand it back on close.
  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
    } else {
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    }
  }, [isOpen]);

  // `document` is safe to touch here: the lightbox can only be open after a
  // click, which never happens during SSR.
  if (!isOpen || !item || typeof document === "undefined") return null;

  // Closing unmounts immediately rather than playing an exit animation. A
  // full-screen overlay that stalls mid-exit would leave an invisible,
  // click-blocking layer over the whole page — not worth a 250ms fade.
  //
  // Rendered through a portal to <body> — NOT in place. The gallery sits
  // inside `.animate-view-in`, whose keyframes apply a `transform`, and a
  // transformed ancestor makes `position: fixed` resolve against that
  // ancestor instead of the viewport. In place, the overlay became a
  // page-sized box that scrolled away with the content instead of covering
  // the screen. A portal puts it outside that subtree for good.
  return createPortal(
    <div
          className="animate-overlay-in fixed inset-0 z-[90] flex items-center justify-center bg-wine-950/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title}. Item ${index + 1} of ${items.length}.`}
          onClick={onClose}
        >
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
            <p className="text-sm text-wine-300 tabular-nums">
              {index + 1} / {items.length}
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-full border border-wine-100/15 bg-wine-100/10 text-wine-100 transition-colors duration-200 hover:bg-wine-100/20"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrevious();
                }}
                className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full border border-wine-100/15 bg-wine-100/10 text-wine-100 transition-colors duration-200 hover:bg-wine-100/20 sm:left-6"
                aria-label="Previous item"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full border border-wine-100/15 bg-wine-100/10 text-wine-100 transition-colors duration-200 hover:bg-wine-100/20 sm:right-6"
                aria-label="Next item"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <figure
            key={item.id}
            className="animate-figure-in relative flex max-h-[82vh] w-full max-w-5xl flex-col items-center px-14 sm:px-20"
            onClick={(event) => event.stopPropagation()}
          >
            {item.type === "video" ? (
              <video
                key={item.src}
                src={item.src}
                poster={item.poster}
                // Intrinsic size up front. Without it a <video> defaults to
                // 300x150 until metadata arrives, and the browser stretches
                // the 9:16 poster into that box — a visible squash on load.
                width={item.width}
                height={item.height}
                controls
                autoPlay
                playsInline
                preload="metadata"
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={blockContextMenu}
                // `object-contain` guarantees the poster and the video are
                // letterboxed rather than distorted if their ratios ever
                // diverge; default `object-fit` on a video is `fill`.
                className="media-guard max-h-[74vh] w-auto rounded-2xl bg-wine-950 object-contain shadow-premium"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.title}
                width={item.width}
                height={item.height}
                sizes="(min-width: 1024px) 70vw, 90vw"
                placeholder="blur"
                blurDataURL={item.blurDataURL}
                priority
                draggable={false}
                onContextMenu={blockContextMenu}
                className="media-guard max-h-[74vh] w-auto rounded-2xl object-contain"
              />
            )}

            <figcaption className="mt-4 text-center text-sm text-wine-300">
              {item.title}
            </figcaption>
          </figure>
    </div>,
    document.body,
  );
}
