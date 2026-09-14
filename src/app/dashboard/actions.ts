"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAuth, startSession, verifyPassword } from "@/lib/auth";
import { isKnownCardSlot } from "@/lib/card-slots";
import {
  CARD_MAX_EDGE,
  PHOTO_MAX_EDGE,
  POSTER_MAX_EDGE,
  deriveImage,
  isAcceptedImage,
} from "@/lib/image-pipeline";
import {
  allItemIds,
  deleteBySrc,
  slugify,
  titleize,
  uniqueId,
  updateManifest,
  writeUpload,
  type DisciplineSlug,
  type MediaManifest,
} from "@/lib/media-store";

/**
 * Every mutation the dashboard can perform.
 *
 * Two rules hold throughout:
 *
 *  1. **Each action authenticates itself.** A Server Action compiles to a
 *     public POST endpoint; the fact that its form is only rendered behind a
 *     login page is not a security boundary.
 *  2. **Nothing is trusted from the client** beyond an identifier and the
 *     file bytes. Titles, dimensions and paths are all derived server-side.
 */

export interface ActionState {
  ok?: boolean;
  message?: string;
  /** Fresh on every successful result. The forms use it to tell a new success
   *  apart from the previous one, so they know when to clear the staged
   *  selection without watching the message text. */
  token?: string;
}

/** Per-file ceilings. The request as a whole is capped by
 *  `experimental.serverActions.bodySizeLimit` in next.config.ts. */
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
/** Only these extensions are ever written for a video upload. */
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mp4",
  "video/x-m4v": "mp4",
};

const DISCIPLINES: DisciplineSlug[] = ["photography", "videography"];

function isDiscipline(value: unknown): value is DisciplineSlug {
  return typeof value === "string" && DISCIPLINES.includes(value as DisciplineSlug);
}

/** Short content hash, so a replaced file gets a new URL and caches bust. */
function contentHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 10);
}

function mb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

/** Refresh the public page and the dashboard's own view of the library. */
function refresh(): void {
  revalidatePath("/");
  revalidatePath("/dashboard");
}

function fail(message: string): ActionState {
  return { ok: false, message };
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return fail("Enter your password.");

  if (!verifyPassword(password)) {
    // Deliberately vague, and slow enough to make guessing tedious without
    // holding a request open long enough to be a denial-of-service lever.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fail("That password is not correct.");
  }

  await startSession();
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/dashboard/login");
}

// ---------------------------------------------------------------------------
// Gallery: add
// ---------------------------------------------------------------------------

function findOrCreateCategory(
  manifest: MediaManifest,
  discipline: DisciplineSlug,
  slug: string,
  label: string,
) {
  let category = manifest[discipline].find((c) => c.slug === slug);
  if (!category) {
    category = { slug, label, items: [] };
    manifest[discipline].push(category);
  }
  return category;
}

export async function addPhotosAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const discipline = formData.get("discipline");
  const categorySlug = slugify(String(formData.get("category") ?? ""));
  if (!isDiscipline(discipline)) return fail("Unknown gallery.");
  if (!categorySlug) return fail("Choose a category.");

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return fail("Choose at least one image.");

  const derived: {
    id: string;
    title: string;
    src: string;
    width: number;
    height: number;
    blurDataURL: string;
  }[] = [];

  // Compress everything before touching the manifest, so a bad file in the
  // middle of a batch fails the whole action instead of half-applying it.
  const seen = new Set<string>();
  for (const file of files) {
    if (!isAcceptedImage(file.type)) {
      return fail(`${file.name}: not an image Sharp can read (${file.type || "unknown type"}).`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail(`${file.name} is ${mb(file.size)}; the limit is ${mb(MAX_IMAGE_BYTES)}.`);
    }

    const input = Buffer.from(await file.arrayBuffer());
    let image;
    try {
      image = await deriveImage(input, PHOTO_MAX_EDGE);
    } catch {
      return fail(`${file.name} could not be decoded as an image.`);
    }

    const base = slugify(file.name.replace(/\.[^.]+$/, ""));
    const name = `${base}-${contentHash(image.data)}.${image.format}`;
    if (seen.has(name)) continue; // the same file picked twice
    seen.add(name);

    derived.push({
      id: `${categorySlug}-${base}`,
      title: titleize(file.name),
      src: await writeUpload(`photos/${categorySlug}/${name}`, image.data),
      width: image.width,
      height: image.height,
      blurDataURL: image.blurDataURL,
    });
  }

  await updateManifest((manifest) => {
    const taken = allItemIds(manifest, discipline);
    const label = String(formData.get("categoryLabel") ?? "") || titleize(categorySlug);
    const category = findOrCreateCategory(manifest, discipline, categorySlug, label);
    for (const item of derived) {
      category.items.push({ ...item, id: uniqueId(taken, item.id), type: "photo" });
      taken.add(item.id);
    }
  });

  refresh();
  return {
    ok: true,
    token: randomUUID(),
    message: `Added ${derived.length} image${derived.length === 1 ? "" : "s"}.`,
  };
}

export async function addVideoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const discipline = formData.get("discipline");
  const categorySlug = slugify(String(formData.get("category") ?? ""));
  if (!isDiscipline(discipline)) return fail("Unknown gallery.");
  if (!categorySlug) return fail("Choose a category.");

  const video = formData.get("video");
  const poster = formData.get("poster");
  if (!(video instanceof File) || video.size === 0) return fail("Choose a video file.");
  if (!ACCEPTED_VIDEO_TYPES.includes(video.type)) {
    return fail(`${video.name}: unsupported video type (${video.type || "unknown"}).`);
  }
  if (video.size > MAX_VIDEO_BYTES) {
    return fail(
      `${video.name} is ${mb(video.size)}. The limit is ${mb(MAX_VIDEO_BYTES)} — compress it before uploading.`,
    );
  }
  // The poster is a frame the browser grabbed from the video before upload.
  // Without it there is nothing to show in the grid, since there is no
  // server-side video decoder any more.
  if (!(poster instanceof File) || poster.size === 0) {
    return fail("The preview frame could not be captured from this video. Try a different file.");
  }

  const posterImage = await deriveImage(Buffer.from(await poster.arrayBuffer()), POSTER_MAX_EDGE);
  const videoBytes = Buffer.from(await video.arrayBuffer());

  const base = slugify(video.name.replace(/\.[^.]+$/, ""));
  const hash = contentHash(videoBytes);
  const extension = VIDEO_EXTENSIONS[video.type] ?? "mp4";

  const src = await writeUpload(`video/${categorySlug}/${base}-${hash}.${extension}`, videoBytes);
  const posterSrc = await writeUpload(
    `video/${categorySlug}/${base}-${hash}.${posterImage.format}`,
    posterImage.data,
  );

  const rawDuration = Number(formData.get("duration"));
  const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : undefined;

  await updateManifest((manifest) => {
    const taken = allItemIds(manifest, discipline);
    const label = String(formData.get("categoryLabel") ?? "") || titleize(categorySlug);
    const category = findOrCreateCategory(manifest, discipline, categorySlug, label);
    category.items.push({
      id: uniqueId(taken, `${categorySlug}-${base}`),
      type: "video",
      title: titleize(video.name),
      src,
      poster: posterSrc,
      // Taken from the poster frame, which is the real decoded video geometry —
      // the same "measure the output, never predict it" rule the images follow.
      width: posterImage.width,
      height: posterImage.height,
      blurDataURL: posterImage.blurDataURL,
      duration,
    });
  });

  refresh();
  return { ok: true, token: randomUUID(), message: `Added “${titleize(video.name)}”.` };
}

// ---------------------------------------------------------------------------
// Gallery: remove
// ---------------------------------------------------------------------------

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireAuth();

  const discipline = formData.get("discipline");
  const id = String(formData.get("id") ?? "");
  if (!isDiscipline(discipline) || !id) return;

  const removed = await updateManifest((manifest) => {
    for (const category of manifest[discipline]) {
      const index = category.items.findIndex((item) => item.id === id);
      if (index === -1) continue;
      const [item] = category.items.splice(index, 1);
      // Drop a category once its last item goes, so the filter bar does not
      // grow empty tabs over time.
      if (category.items.length === 0) {
        manifest[discipline] = manifest[discipline].filter((c) => c.slug !== category.slug);
      }
      return item;
    }
    return undefined;
  });

  // Only files the dashboard wrote are unlinked; seeded media lives in the
  // read-only build output and is simply no longer referenced.
  await deleteBySrc(removed?.src);
  await deleteBySrc(removed?.poster);

  refresh();
}

// ---------------------------------------------------------------------------
// Section images
// ---------------------------------------------------------------------------

export async function replaceCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const key = String(formData.get("key") ?? "");
  // Allow-list rather than free-form: otherwise this action could write
  // arbitrary new entries into the cards map.
  if (!isKnownCardSlot(key)) return fail("Unknown image slot.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image.");
  if (!isAcceptedImage(file.type)) return fail(`Not an image Sharp can read (${file.type || "unknown type"}).`);
  if (file.size > MAX_IMAGE_BYTES) {
    return fail(`That file is ${mb(file.size)}; the limit is ${mb(MAX_IMAGE_BYTES)}.`);
  }

  let image;
  try {
    image = await deriveImage(Buffer.from(await file.arrayBuffer()), CARD_MAX_EDGE);
  } catch {
    return fail("That file could not be decoded as an image.");
  }

  const src = await writeUpload(
    `cards/${key}-${contentHash(image.data)}.${image.format}`,
    image.data,
  );

  const previous = await updateManifest((manifest) => {
    const before = manifest.cards[key]?.src;
    manifest.cards[key] = {
      src,
      width: image.width,
      height: image.height,
      blurDataURL: image.blurDataURL,
    };
    return before;
  });

  // Remove the superseded upload so replacements do not pile up on the volume.
  if (previous !== src) await deleteBySrc(previous);

  refresh();
  return { ok: true, token: randomUUID(), message: `Updated. Now ${image.width}×${image.height}.` };
}

export async function setCoverAction(formData: FormData): Promise<void> {
  await requireAuth();

  const discipline = formData.get("discipline");
  const id = String(formData.get("id") ?? "");
  if (!isDiscipline(discipline) || !id) return;

  await updateManifest((manifest) => {
    const exists = manifest[discipline].some((c) => c.items.some((i) => i.id === id));
    if (exists) manifest.covers = { ...manifest.covers, [discipline]: id };
  });

  refresh();
}
