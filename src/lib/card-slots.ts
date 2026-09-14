import { successStories } from "./content";

/**
 * Every fixed image on the public site that the dashboard can replace, and
 * where it appears.
 *
 * The dashboard's "Replace" tab is generated from this list, so the labels
 * here are what tells the editor which picture they are about to swap. The
 * three success-story slots are derived from `content.ts` rather than typed
 * out, so a new story automatically shows up as a replaceable slot instead of
 * quietly having an unmanaged image.
 */

export interface CardSlot {
  /** Key into the manifest's `cards` map. */
  key: string;
  /** Which part of the public page this appears in. */
  section: string;
  /** What the image is within that section. */
  label: string;
  /** How it is displayed, so the editor can judge the crop. */
  note: string;
  /** Aspect ratio of the frame it is cropped into, as a CSS value. */
  aspect: string;
}

const FIXED_SLOTS: CardSlot[] = [
  {
    key: "composite",
    section: "Hero",
    label: "Hero portrait",
    note: "Portrait beside the headline, cropped to a 3:4 frame. Top-anchored.",
    aspect: "3 / 4",
  },
  {
    key: "composite2",
    section: "Experience",
    label: "Experience plate",
    note: "Tall photo left of the career ledger. Height matches the list, so the crop gets narrower as the list grows.",
    aspect: "3 / 4",
  },
];

const STORY_SLOTS: CardSlot[] = successStories.map((story) => ({
  key: story.imageKey,
  section: "Featured Success Stories",
  label: `${story.name} card`,
  note: "Full-bleed card background behind the story copy, cropped to 3:4.",
  aspect: "3 / 4",
}));

export const cardSlots: CardSlot[] = [...FIXED_SLOTS, ...STORY_SLOTS];

/** Guards the replace action: only these keys may be written. */
export function isKnownCardSlot(key: string): boolean {
  return cardSlots.some((slot) => slot.key === key);
}
