import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { resolveUploadPath } from "@/lib/media-store";

/**
 * Serves media the dashboard wrote.
 *
 * Files uploaded at runtime cannot live in `public/` — that directory is part
 * of the build output and is replaced on every deploy — so they are written to
 * the data volume and streamed from here instead.
 *
 * The one thing this must not get wrong is **range requests**. `next start`
 * serves `public/` with ranges handled for us; a custom handler does not get
 * that for free, and without it a `<video>` cannot seek (and Safari refuses to
 * play at all). Hence the explicit 206 path below.
 */

// Reads a mutable directory, so it must never be cached as a static route.
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
};

/** Upload filenames carry a content hash, so a given URL never changes body. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function parseRange(header: string | null, size: number) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  // "bytes=-500" means the last 500 bytes, not "from 0 to 500".
  let start = rawStart ? Number(rawStart) : size - Number(rawEnd);
  let end = rawStart ? (rawEnd ? Number(rawEnd) : size - 1) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  if (start > end) return null;

  return { start, end };
}

function bodyFrom(path: string, range?: { start: number; end: number }) {
  const stream = createReadStream(path, range);
  // Node stream -> Web stream. `as` because Node's DOM lib types the two
  // ReadableStream shapes separately even though they are interchangeable here.
  return Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/uploads/[...path]">,
) {
  const { path } = await context.params;
  // `resolveUploadPath` is the single traversal guard; a crafted `..` segment
  // is rejected there rather than being trusted because it came from a route.
  const filePath = resolveUploadPath(path.join("/"));
  if (!filePath) return new Response("Not found", { status: 404 });

  let size: number;
  let mtime: number;
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) return new Response("Not found", { status: 404 });
    size = stats.size;
    mtime = stats.mtimeMs;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  const etag = `"${size.toString(16)}-${Math.trunc(mtime).toString(16)}"`;

  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": CACHE_CONTROL,
    "Accept-Ranges": "bytes",
    ETag: etag,
    // Matches the `media-guard` treatment on the public site: discourage the
    // browser's own "save as" affordance without pretending it is protection.
    "X-Content-Type-Options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const range = parseRange(request.headers.get("range"), size);
  if (range) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
    headers.set("Content-Length", String(range.end - range.start + 1));
    return new Response(bodyFrom(filePath, range), { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  return new Response(bodyFrom(filePath), { status: 200, headers });
}

/** Some players probe with HEAD before requesting ranges. */
export async function HEAD(
  request: NextRequest,
  context: RouteContext<"/uploads/[...path]">,
) {
  const response = await GET(request, context);
  return new Response(null, { status: response.status, headers: response.headers });
}
