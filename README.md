# Portfolio

Personal brand site — Next.js 16, React 19, TypeScript, Tailwind CSS v4,
Framer Motion. See [`docs/STRATEGY.md`](docs/STRATEGY.md) for the full
design rationale, palette, and architecture writeup.

## Before you launch — required edits

Everything identity-related is centralized in one file:
[`src/lib/site-config.ts`](src/lib/site-config.ts). Open it and replace
every `TODO`:

- `name`, `initials` — your real name (`initials` drives the monogram mark)
- `url` — your production domain (used in metadata, sitemap, JSON-LD)
- `email` — the address the Contact section displays and the form sends to
- `social.linkedin` / `instagram` / `twitter` — real profile URLs (anything
  left as `"#"` still renders, it just won't link anywhere useful)
- `location` — optional, improves local relevance in metadata

All section copy (About, Expertise, Timeline, Success Stories, Numbers,
Testimonials) lives in [`src/lib/content.ts`](src/lib/content.ts) if you
want to adjust wording — every fact there is sourced from the original
profile content, nothing was invented.

**Photos**: the Success Story cards and the Photography & Videography
galleries all run on real assets from `src/Assets` (see below). The Hero
still uses `PlaceholderArt` (generated gradient + monogram) — swap it for a
real portrait when you have one.

## Media pipeline

Source assets live in `src/Assets/` and are **originals** — 6000x4000
photos and 20 Mbps video exports, ~2.1 GB in total. They are never served
directly and never modified.

```bash
npm run media
```

That derives web-grade copies into `public/media/` and regenerates
`src/lib/media-manifest.json` (dimensions, durations, blur placeholders).
It uses `ffmpeg` via the `ffmpeg-static` dev dependency — nothing ships to
the browser.

**To add or change media later**: drop files into the matching folder under
`src/Assets/` and re-run `npm run media`. Gallery categories are derived
from the folder names, so no code changes are needed.

```
src/Assets/
├── Photos/<Category>/      -> Photography gallery
├── Videos/<Category>/      -> Videography gallery
├── omarAboud.jpeg          -> Success Story card background
├── OmarAntar.jpeg          -> Success Story card background
└── majdhalimaCard.PNG      -> Success Story card background
```

Card backgrounds are matched by the `imageKey` field in
[`src/lib/content.ts`](src/lib/content.ts) (the lowercased filename, e.g.
`omaraboud`). Full rationale in [`docs/STRATEGY.md`](docs/STRATEGY.md) §17.

## Contact form setup (Resend)

The form posts to `src/app/api/contact/route.ts`, which sends mail via
[Resend](https://resend.com). Without an API key it fails gracefully (the
form shows "This form isn't fully configured yet") rather than silently
dropping messages.

1. Create a free Resend account and API key.
2. Copy `.env.example` to `.env.local`.
3. Set `RESEND_API_KEY`. Optionally set `CONTACT_FROM_EMAIL` once you've
   verified a sending domain on Resend (otherwise it falls back to
   Resend's shared test sender, which is fine for getting started).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build — run this before deploying
npm run lint
```

## Deployment

Any Next.js host works; [Vercel](https://vercel.com/new) requires zero
config. Wherever you deploy, set `RESEND_API_KEY` (and `CONTACT_FROM_EMAIL`
if used) as environment variables on the host — `.env.local` is git-ignored
and never deployed.
