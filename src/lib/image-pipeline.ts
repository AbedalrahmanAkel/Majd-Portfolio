import sharp from "sharp";

/**
 * Image derivation, powered by sharp.
 *
 * This replaces the ffmpeg-based build script the site used to ship with.
 * Two things improve as a result:
 *
 *  1. `.rotate()` with no argument applies the EXIF orientation tag, so a
 *     portrait photo straight off a phone is stored upright. ffmpeg's JPEG
 *     decoder ignored that tag entirely.
 *  2. The encoder reports the dimensions it actually wrote (`info`), so the
 *     manifest is never a prediction. Only one edge is constrained and the
 *     other is derived, which is what makes stretching impossible.
 *
 * sharp is native and must stay out of the client bundle — this module is
 * imported only from Server Actions and Server Components.
 */

/** Gallery photos. Past ~2000px there is nothing more to see in a lightbox. */
export const PHOTO_MAX_EDGE = 2000;
/** Section/card artwork renders at most ~700px wide; 1600 covers 2x screens. */
export const CARD_MAX_EDGE = 1600;
/** Video poster frames, shown at tile size and as the LCP image. */
export const POSTER_MAX_EDGE = 900;

const JPEG_QUALITY = 82;
/** WebP at 80 is comparable to JPEG 82 and keeps the alpha channel. */
const WEBP_QUALITY = 80;
/** 16px wide costs ~400 bytes and is all `placeholder="blur"` needs. */
const BLUR_EDGE = 16;

export interface DerivedImage {
  data: Buffer;
  width: number;
  height: number;
  blurDataURL: string;
  /** File extension to store this under: "jpg", or "webp" when the source
   *  actually uses its alpha channel. */
  format: "jpg" | "webp";
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/gif",
] as const;

export function isAcceptedImage(type: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Resize to fit inside a square box and re-encode as progressive JPEG.
 *
 * `fit: "inside"` preserves the aspect ratio and `withoutEnlargement` refuses
 * to upscale, so a small source is left at its own size rather than blown up.
 */
export async function deriveImage(
  input: Buffer,
  maxEdge: number,
): Promise<DerivedImage> {
  // `failOn: "none"` keeps a slightly truncated but otherwise usable upload
  // from throwing; sharp still refuses genuinely corrupt data.
  const base = sharp(input, { failOn: "none" }).rotate();

  // JPEG cannot carry alpha and silently composites it onto black, which turns
  // a cut-out subject into a black rectangle. `isOpaque` distinguishes a real
  // cut-out from the many PNGs that merely carry an unused alpha channel, so
  // only images that actually need it pay for WebP.
  const { isOpaque } = await base.clone().stats();

  const resized = base.clone().resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await (isOpaque
    ? resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
    : resized.webp({ quality: WEBP_QUALITY })
  ).toBuffer({ resolveWithObject: true });

  // The blur placeholder sits behind the real image, so it has to keep the
  // transparency too — an opaque blur would show as a dark box around a
  // cut-out while the full image loads.
  const blurPipeline = base.clone().resize({ width: BLUR_EDGE, fit: "inside" });
  const blur = await (isOpaque
    ? blurPipeline.jpeg({ quality: 50 })
    : blurPipeline.webp({ quality: 50 })
  ).toBuffer();

  const mime = isOpaque ? "image/jpeg" : "image/webp";

  return {
    data,
    width: info.width,
    height: info.height,
    blurDataURL: `data:${mime};base64,${blur.toString("base64")}`,
    format: isOpaque ? "jpg" : "webp",
  };
}
