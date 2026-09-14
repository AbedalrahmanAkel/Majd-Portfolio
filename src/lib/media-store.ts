import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import seedManifest from "./media-manifest.json";
import type { CardImage, DisciplineSlug, MediaCategory, MediaItem } from "./media-types";

/**
 * The single place on the server that touches media on disk.
 *
 * ── Why two locations ────────────────────────────────────────────────────
 * The media that shipped with the site lives in `public/media` and is part of
 * the build: committed, immutable, served straight off the static path.
 * Anything added through the dashboard lives in a *writable data directory*
 * that is deliberately outside the build output, and is served by the
 * `/uploads` route handler.
 *
 * That split is what makes the dashboard survive a redeploy. A build replaces
 * everything inside the project directory, so writing uploads into `public/`
 * would work locally and then silently lose every upload the next time the
 * site is deployed. Point `MEDIA_DATA_DIR` at a mounted volume and uploads
 * outlive the container that wrote them.
 *
 * ── Requirement this implies ─────────────────────────────────────────────
 * The host must give the Node process a persistent, writable disk. That rules
 * out serverless targets (Vercel, Netlify functions), whose filesystems are
 * read-only apart from a per-invocation `/tmp`. See docs/DEPLOYMENT.md.
 */

export type StoredMediaItem = MediaItem;
export type StoredCategory = MediaCategory;
export type StoredCard = CardImage;
export type { DisciplineSlug };

export interface MediaManifest {
  version: number;
  generatedAt: string;
  cards: Record<string, StoredCard>;
  photography: StoredCategory[];
  videography: StoredCategory[];
  /** Which gallery item is used as each discipline's card thumbnail. */
  covers: Partial<Record<DisciplineSlug, string>>;
}

/** URL prefix for anything the dashboard wrote. Also the marker that tells
 *  a delete it owns the underlying file and may remove it. */
export const UPLOAD_URL_PREFIX = "/uploads";

const MANIFEST_FILE = "media-manifest.json";
const UPLOADS_DIR = "uploads";

/**
 * Root of the writable data directory. Absolute paths are used as-is so a
 * volume can be mounted anywhere (`/data` on most hosts); a relative value is
 * resolved against the project root for local development.
 */
export function dataDir(): string {
  const configured = process.env.MEDIA_DATA_DIR?.trim();
  if (!configured) return join(process.cwd(), "data");
  // The tracer cannot follow a path that is only known at runtime, which is
  // the whole point of this one: it names a volume outside the build output.
  return isAbsolute(configured)
    ? configured
    : resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function uploadsDir(): string {
  return join(dataDir(), UPLOADS_DIR);
}

function manifestPath(): string {
  return join(dataDir(), MANIFEST_FILE);
}

/** `/uploads/photos/sports/x.jpg` -> `photos/sports/x.jpg`, else null. */
export function uploadRelPath(src: string): string | null {
  if (!src.startsWith(`${UPLOAD_URL_PREFIX}/`)) return null;
  return src.slice(UPLOAD_URL_PREFIX.length + 1);
}

export function uploadUrl(relPath: string): string {
  return `${UPLOAD_URL_PREFIX}/${relPath.split(/[\\/]/).join("/")}`;
}

/**
 * Resolve a caller-supplied relative path inside the uploads directory,
 * refusing anything that escapes it. Both the `/uploads` route handler and
 * deletes run user-influenced strings through here, so `../` traversal and
 * absolute paths have exactly one place to be stopped.
 */
export function resolveUploadPath(relPath: string): string | null {
  if (!relPath || relPath.includes("\0")) return null;
  const root = uploadsDir();
  const target = resolve(/* turbopackIgnore: true */ root, relPath);
  // `relative` is the reliable containment test: anything that climbs out of
  // the root produces a path starting with "..", and a different drive on
  // Windows produces an absolute one.
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null;
  return target;
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/**
 * Normalise anything read off disk (or the bundled seed, which predates the
 * `covers` field) into the current shape. Written defensively because this
 * file is hand-editable and a malformed one should degrade, not crash.
 */
function normalise(raw: unknown): MediaManifest {
  const input = (raw ?? {}) as Partial<MediaManifest>;
  const categories = (value: unknown): StoredCategory[] =>
    Array.isArray(value)
      ? value
          .filter((c): c is StoredCategory => Boolean(c) && typeof c === "object")
          .map((c) => ({
            slug: String(c.slug ?? ""),
            label: String(c.label ?? c.slug ?? ""),
            items: Array.isArray(c.items) ? c.items.filter(Boolean) : [],
          }))
          .filter((c) => c.slug)
      : [];

  return {
    version: 2,
    generatedAt: String(input.generatedAt ?? new Date().toISOString()),
    cards: (input.cards ?? {}) as Record<string, StoredCard>,
    photography: categories(input.photography),
    videography: categories(input.videography),
    covers: (input.covers ?? {}) as MediaManifest["covers"],
  };
}

let writeQueue: Promise<unknown> = Promise.resolve();

/** Serialise writes. Read-modify-write on a JSON file is not atomic, and two
 *  overlapping uploads would otherwise drop one of the two changes. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

/**
 * Read the live manifest, seeding the data directory from the bundled one the
 * first time. Seeding copies only the manifest — the files it points at stay
 * in `public/media`, so a fresh deploy costs nothing and the shipped media
 * keeps being served statically.
 */
export async function getManifest(): Promise<MediaManifest> {
  const file = manifestPath();
  if (existsSync(file)) {
    try {
      return normalise(JSON.parse(await readFile(file, "utf8")));
    } catch {
      // Unreadable manifest: fall through to the seed rather than 500 the
      // whole site. The bad file is left in place to be inspected.
    }
  }
  return normalise(seedManifest);
}

async function writeManifest(manifest: MediaManifest): Promise<void> {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  const file = manifestPath();
  // Write-then-rename: a crash mid-write leaves the previous manifest intact
  // instead of a truncated file that would take the gallery down.
  const tmp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(tmp, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rename(tmp, file);
}

/** Read → mutate → persist, one writer at a time. */
export function updateManifest<T>(
  mutate: (manifest: MediaManifest) => T | Promise<T>,
): Promise<T> {
  return enqueue(async () => {
    const manifest = await getManifest();
    const result = await mutate(manifest);
    manifest.generatedAt = new Date().toISOString();
    await writeManifest(manifest);
    return result;
  });
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** Write a derived file into the uploads tree and return its public URL. */
export async function writeUpload(relPath: string, data: Buffer): Promise<string> {
  const target = resolveUploadPath(relPath);
  if (!target) throw new Error("Refusing to write outside the uploads directory");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
  return uploadUrl(relPath);
}

/**
 * Delete the file behind a URL, but only if the dashboard owns it. Seeded
 * media lives in the read-only build output, so removing such an entry just
 * drops it from the manifest and leaves the file unreferenced.
 */
export async function deleteBySrc(src: string | undefined): Promise<void> {
  if (!src) return;
  const rel = uploadRelPath(src);
  if (!rel) return;
  const target = resolveUploadPath(rel);
  if (!target) return;
  await rm(target, { force: true });
}

// ---------------------------------------------------------------------------
// Ids and slugs
// ---------------------------------------------------------------------------

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

/** "chicken cury.mp4" -> "Chicken Cury" */
export function titleize(fileName: string): string {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Untitled"
  );
}

/** Stable, collision-free id within a discipline. */
export function uniqueId(taken: Set<string>, base: string): string {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}

export function allItemIds(manifest: MediaManifest, discipline: DisciplineSlug): Set<string> {
  return new Set(manifest[discipline].flatMap((c) => c.items.map((i) => i.id)));
}
