"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { formatDuration, type MediaItem } from "@/lib/media-types";
import { cn } from "@/lib/utils";

interface MediaTileProps {
  item: MediaItem;
  index: number;
  onOpen: (index: number) => void;
}

/**
 * One cell of the gallery grid. Photos and videos share an identical tile so
 * both disciplines read as one system; the only difference is the play
 * affordance and duration chip on video.
 *
 * Tiles are uniformly 4:5 and cropped with object-cover — the lightbox shows
 * every item at its true aspect ratio, so nothing is lost.
 */
export function MediaTile({ item, index, onOpen }: MediaTileProps) {
  const thumbnail = item.type === "video" ? item.poster : item.src;

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn(
        "surface-card group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl",
        "transition-transform duration-500 ease-premium hover:-translate-y-1",
      )}
      aria-label={
        item.type === "video"
          ? `Play video: ${item.title}`
          : `View photo: ${item.title}`
      }
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          aria-hidden="true"
          fill
          // Grid is 2 cols on mobile, 3 on tablet, 4 on desktop.
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          placeholder="blur"
          blurDataURL={item.blurDataURL}
          draggable={false}
          className="media-guard pointer-events-none object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-950/80 via-wine-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      {item.type === "video" ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-wine-100/25 bg-wine-950/40 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-wine-950/60">
              <Play className="size-4 translate-x-px fill-wine-100 text-wine-100" />
            </span>
          </span>

          {item.duration ? (
            <span
              className="pointer-events-none absolute top-3 right-3 rounded-full bg-wine-950/60 px-2 py-0.5 text-[0.7rem] font-medium text-wine-100 tabular-nums backdrop-blur-sm"
              aria-hidden="true"
            >
              {formatDuration(item.duration)}
            </span>
          ) : null}
        </>
      ) : null}
    </button>
  );
}
