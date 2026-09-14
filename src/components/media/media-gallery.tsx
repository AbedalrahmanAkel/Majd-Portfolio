"use client";

import { useMemo, useState } from "react";
import type { MediaCategory } from "@/lib/media-types";
import { cn } from "@/lib/utils";
import { MediaTile } from "./media-tile";
import { MediaLightbox } from "./media-lightbox";

interface MediaGalleryProps {
  categories: MediaCategory[];
}

const ALL = "all";

/**
 * Grid + filter + lightbox. Shared by both disciplines so Photography and
 * Videography are the same experience, and adding a category is just another
 * folder in `src/Assets`.
 */
export function MediaGallery({ categories }: MediaGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filters = useMemo(
    () => [
      { slug: ALL, label: "All", count: categories.reduce((n, c) => n + c.items.length, 0) },
      ...categories.map((c) => ({ slug: c.slug, label: c.label, count: c.items.length })),
    ],
    [categories],
  );

  const items = useMemo(() => {
    if (activeCategory === ALL) return categories.flatMap((c) => c.items);
    return categories.find((c) => c.slug === activeCategory)?.items ?? [];
  }, [categories, activeCategory]);

  function selectCategory(slug: string) {
    setActiveCategory(slug);
    // Indices are relative to the visible set, so a stale one would point at
    // the wrong item after filtering.
    setLightboxIndex(null);
  }

  return (
    <div>
      {filters.length > 2 ? (
        <div
          className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line"
          role="group"
          aria-label="Filter by category"
        >
          {filters.map((filter) => {
            const isActive = filter.slug === activeCategory;
            return (
              <button
                key={filter.slug}
                type="button"
                onClick={() => selectCategory(filter.slug)}
                aria-pressed={isActive}
                className={cn(
                  "border-b-2 pb-3 text-xs font-semibold tracking-[0.1em] uppercase transition-colors duration-200",
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-soft hover:border-line hover:text-ink",
                )}
              >
                {filter.label}
                <span className="ml-1.5 text-[0.65rem] opacity-60 tabular-nums">
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="animate-view-in"
            style={{
              // Stagger only the first screenful; later tiles appear
              // immediately so filtering never feels laggy.
              animationDelay: `${Math.min(index, 8) * 40}ms`,
            }}
          >
            <MediaTile item={item} index={index} onOpen={setLightboxIndex} />
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted">Nothing here yet.</p>
      ) : null}

      <MediaLightbox
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
