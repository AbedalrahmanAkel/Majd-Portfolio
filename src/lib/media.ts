import { getManifest, type MediaManifest } from "./media-store";
import type {
  CardImage,
  Discipline,
  DisciplineSlug,
  MediaCategory,
  MediaItem,
} from "./media-types";

/**
 * Read model for the public site.
 *
 * This used to be a synchronous layer over a JSON import. It now reads the
 * live manifest, because the dashboard can change it at runtime — so every
 * accessor is async and Server Components await them. Client components are
 * handed the result as props rather than importing this, which keeps the
 * filesystem access on the server where it belongs.
 */

export type {
  CardImage,
  Discipline,
  DisciplineSlug,
  MediaCategory,
  MediaItem,
} from "./media-types";
export { formatDuration } from "./media-types";

/**
 * Display-name overrides for asset folders. The folder name stays the source
 * of truth for slugs and ordering; this only corrects presentation
 * (ampersands, spelling) so folder names can stay as the author filed them.
 */
const CATEGORY_LABELS: Record<string, string> = {
  "contracting-and-realstate": "Contracting & Real Estate",
};

/**
 * ─── EDIT ME: filter-chip order ───────────────────────────────────────────
 * Order the category chips appear in, after the leading "All" chip.
 * Any category not listed here is appended at the end, so a category added
 * from the dashboard never breaks the build — it just lands last until you
 * add it here.
 */
const CATEGORY_ORDER: Record<DisciplineSlug, string[]> = {
  photography: ["sports"],
  videography: ["sports", "contracting-and-realstate", "modeling", "others"],
};

/**
 * Fallback thumbnails, used until one is chosen in the dashboard
 * (Dashboard → Section images → Gallery thumbnails). The manifest's `covers`
 * field wins when set.
 */
const DISCIPLINE_COVERS: Record<DisciplineSlug, string> = {
  photography: "sports-dsc02560",
  videography: "sports-fc-saida-1",
};

/**
 * ─── EDIT ME: which slice of the cover survives the crop ──────────────────
 * Cover art is cropped to fill the card, never stretched, so this chooses
 * which part stays visible. It is a CSS `object-position`; the second value
 * is the vertical anchor.
 *
 *   "50% 50%"  dead centre (the default)
 *   "50% 30%"  biased upward — keeps more of the top of the image
 *   "50% 0%"   pinned to the very top edge
 */
const DISCIPLINE_COVER_POSITION: Record<DisciplineSlug, string> = {
  photography: "50% 50%",
  videography: "50% 30%",
};

const DISCIPLINE_META: Record<DisciplineSlug, { label: string; description: string }> = {
  photography: {
    label: "Photography",
    description:
      "Match-day and event photography — shot, selected, and edited end to end.",
  },
  videography: {
    label: "Videography",
    description:
      "Short-form video across sport, brand, and hospitality — directed, shot, and cut for the feed.",
  },
};

function toCategories(
  raw: MediaCategory[],
  discipline: DisciplineSlug,
): MediaCategory[] {
  const order = CATEGORY_ORDER[discipline];
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  return raw
    .map((category) => ({
      slug: category.slug,
      label: CATEGORY_LABELS[category.slug] ?? category.label,
      items: category.items as MediaItem[],
    }))
    .sort((a, b) => rank(a.slug) - rank(b.slug));
}

function resolveCover(
  categories: MediaCategory[],
  discipline: DisciplineSlug,
  chosen: string | undefined,
): MediaItem | undefined {
  const all = categories.flatMap((category) => category.items);
  // Falls through to the built-in default and then to whatever exists, so a
  // deleted cover degrades to another image instead of an empty card.
  return (
    all.find((item) => item.id === chosen) ??
    all.find((item) => item.id === DISCIPLINE_COVERS[discipline]) ??
    all[0]
  );
}

function buildDiscipline(
  manifest: MediaManifest,
  slug: DisciplineSlug,
): Discipline {
  const categories = toCategories(manifest[slug], slug);
  return {
    slug,
    ...DISCIPLINE_META[slug],
    categories,
    itemCount: categories.reduce((total, c) => total + c.items.length, 0),
    cover: resolveCover(categories, slug, manifest.covers?.[slug]),
    coverPosition: DISCIPLINE_COVER_POSITION[slug],
  };
}

/** Both disciplines, ready to render. */
export async function getDisciplines(): Promise<Discipline[]> {
  const manifest = await getManifest();
  return [buildDiscipline(manifest, "photography"), buildDiscipline(manifest, "videography")];
}

export async function getCardImage(key: string): Promise<CardImage | undefined> {
  const manifest = await getManifest();
  return manifest.cards[key];
}

/** Every fixed section image at once — one manifest read instead of five. */
export async function getCardImages(): Promise<Record<string, CardImage>> {
  const manifest = await getManifest();
  return manifest.cards;
}
