/**
 * Shared media shapes and pure helpers.
 *
 * Deliberately free of Node imports: the gallery, tile, and lightbox are
 * Client Components, and importing anything from `media-store` (which touches
 * `node:fs`) would drag the filesystem into the browser bundle. Types alone
 * would be erased, but `formatDuration` is a real value, so it lives here.
 */

export type DisciplineSlug = "photography" | "videography";

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  title: string;
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  /** Videos only. */
  poster?: string;
  /** Videos only, in seconds. */
  duration?: number;
}

export interface MediaCategory {
  slug: string;
  label: string;
  items: MediaItem[];
}

export interface CardImage {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export interface Discipline {
  slug: DisciplineSlug;
  label: string;
  /** Shown on the category card and as the gallery view's subheading. */
  description: string;
  categories: MediaCategory[];
  itemCount: number;
  /** Artwork for the category card. */
  cover?: MediaItem;
  /** CSS `object-position` for that artwork. */
  coverPosition: string;
}

/** 95 -> "1:35" */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
