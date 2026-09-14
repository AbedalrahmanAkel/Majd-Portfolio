# Deployment

The site is a normal Next.js app with one extra requirement: **the media
dashboard writes files at runtime, so the server needs a persistent, writable
disk.**

Everything else — no database, no S3, no external service — is by design.

---

## 1. The one hard constraint

| Host | Works? | Why |
| --- | --- | --- |
| VPS (Hetzner, DigitalOcean, Contabo, a home server…) | **Yes** | Ordinary filesystem |
| Docker / Coolify / Dokploy with a volume | **Yes** | Mount a volume at `/data` |
| Railway, Render, Fly.io **with a persistent disk attached** | **Yes** | Attach the disk, mount at `/data` |
| Vercel, Netlify, Cloudflare Workers | **No** | Read-only filesystem; only a per-request `/tmp` that is discarded |

On a serverless host the public site would render fine, but every upload would
vanish within minutes and deletions would silently come back. If you ever need
to deploy to Vercel, the only change required is swapping the file writes in
`src/lib/media-store.ts` for an object store (Vercel Blob, S3, R2) — that module
is the *only* place that touches the disk, deliberately.

---

## 2. Environment variables

Copy `.env.example` to `.env` (or set these in your host's dashboard).

| Variable | Required | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | **Yes** | The dashboard password. |
| `AUTH_SECRET` | **Yes** | Signs the session cookie. Changing it signs you out everywhere. |
| `MEDIA_DATA_DIR` | **Yes when hosted** | Absolute path to the persistent volume, e.g. `/data`. Defaults to `./data` locally. |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Recommended | Keeps Server Action ids valid across restarts and instances. |
| `RESEND_API_KEY` | Optional | Contact form. Without it the form validates but does not send. |

Generate the two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Until `ADMIN_PASSWORD` and `AUTH_SECRET` are both set, sign-in is disabled**
and the login page says so. It fails closed on purpose — an unset password
must never mean "no password".

---

## 3. Running it

```bash
npm ci && npm run build && npm start
```

The build produces `.next/standalone`, so a container only needs the Node
runtime plus `.next/static` and `public/`.

Example Dockerfile:

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production MEDIA_DATA_DIR=/data
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
```

Run it with a real volume — a bind mount or a named volume, not a container
layer:

```bash
docker run -p 3000:3000 -v portfolio-media:/data \
  -e ADMIN_PASSWORD=... -e AUTH_SECRET=... portfolio
```

`sharp` ships prebuilt binaries for linux/glibc, which `node:22-slim` provides.
On Alpine, install `vips` or use the glibc image instead.

---

## 4. How media is stored

Two locations, on purpose:

- **`public/media/`** — everything that shipped with the site. Committed,
  immutable, served straight off the static path.
- **`$MEDIA_DATA_DIR/uploads/`** — everything added through the dashboard.
  Served by the `/uploads/[...path]` route handler.

`$MEDIA_DATA_DIR/media-manifest.json` is the live index of both. On first run
it is seeded from the copy bundled at `src/lib/media-manifest.json`, so a fresh
deploy starts with all the original media and costs no copying.

Consequences worth knowing:

- **Deleting a shipped item** removes it from the manifest; the file stays in
  `public/media` unreferenced. Deleting an *uploaded* item removes the file too.
- **Replacing a section image** writes a new content-hashed file and deletes the
  previous upload, so replacements do not accumulate.
- **Back up the volume, not the repo.** Everything added after launch lives
  only there.

---

## 5. Images and video

Images are processed with **sharp** on upload:

- EXIF orientation is applied, so phone photos are stored upright.
- Resized to fit inside 2000px (gallery) or 1600px (section images), never
  upscaled, aspect ratio always preserved.
- Encoded as progressive JPEG — or **WebP when the image actually uses
  transparency**, so a cut-out subject is not flattened onto black.
- Dimensions are read back off the encoded file, so the manifest can never
  disagree with what the browser loads.

**Video is not re-encoded.** sharp is an image library; there is no video
encoder on the server any more. So:

- Upload video already compressed. The cap is **64 MB per file** (raise
  `MAX_VIDEO_BYTES` in `src/app/dashboard/actions.ts` and `bodySizeLimit` in
  `next.config.ts` together if you need more).
- The **poster frame is captured in your browser** when you pick the file, then
  compressed server-side by sharp. That is also where the duration and true
  pixel dimensions come from.
- HandBrake or `ffmpeg -crf 26 -preset slow -vf scale=-2:1280` are good enough
  presets to prepare a file before uploading.

---

## 6. Using the dashboard

The **©** in the site footer links to `/dashboard`.

- **Section images** — every fixed image on the public page, labelled with the
  section it appears in. Each shows current → new, cropped exactly as the live
  section crops it, before you save.
- **Add images / Add a video** — per gallery, into an existing category or a new
  one you name.
- **Use as thumbnail** — promotes an item to be the Photography or Videography
  card image.
- **Delete** — two-step; the file is removed if the dashboard wrote it.

Changes appear on the public site immediately (each action revalidates it).

---

## 7. Checklist

- [ ] `ADMIN_PASSWORD` and `AUTH_SECRET` set
- [ ] `MEDIA_DATA_DIR` points at a mounted volume
- [ ] The volume survives a redeploy — verify by uploading, redeploying, and
      confirming the upload is still there
- [ ] HTTPS in front (the session cookie is `Secure` in production and will not
      be stored over plain HTTP)
- [ ] `siteConfig.url` in `src/lib/site-config.ts` set to the real domain
