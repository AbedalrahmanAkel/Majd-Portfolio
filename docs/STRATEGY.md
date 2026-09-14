# Brand & Site Strategy

Reference documentation for the portfolio in this repository. Written after
the build, so every path, token, and component name below is real — not
aspirational.

---

## 1. UX Strategy

**Objective:** a visitor (founder, CEO, agency, athlete, or creator) should
be able to answer four questions without scrolling past the fold, and be one
click from Contact at every point after:

| Question | Where it's answered |
|---|---|
| Who is this? | Hero — name + role |
| What do they do? | Hero headline + subheadline |
| Why should I trust them? | Hero trust strip (50+ / 2+ / 500K+), reinforced by Numbers, Success Stories, Timeline |
| How do I reach them? | Sticky header CTA (always visible), Footer CTA band, Contact section |

**Narrative arc (top to bottom):** identity → credibility story (About) →
capability (Expertise) → proof of progression (Timeline) → proof of outcomes
(Success Stories) → proof at scale (Numbers) → third-party validation slot
(Testimonials) → conversion (Contact). Each section answers "so what?" for
the one before it — Expertise claims capabilities, Timeline proves they were
earned, Success Stories prove they work on real people/brands, Numbers
quantifies it, Contact converts the resulting trust.

**Single-page scroll** was chosen over multi-page (see decision log below)
specifically because the audience list is broad (CEOs, founders, athletes,
agencies) and each has a different "hot button" section — a scrolling
narrative lets every visitor pass through all the proof points regardless of
which one made them click through, rather than forcing them to pick a nav
item and potentially miss the sections that would have convinced them.

## 2. Information Architecture

```
/ (single route, anchor-navigated)
├── #hero          Name, role, headline, CTAs, trust strip
├── #about          Narrative — operations roots → marketing leadership
├── #expertise       8 strategic capability cards
├── #experience      Chronological timeline (4 roles)
├── #work            Featured Success Stories (Omar Antar, Omar Aboud, Workshops)
├── #visual-work     Photography & Videography — two category cards
│   ├── #photography   Gallery view (in-place swap, history-aware)
│   └── #videography   Gallery view (in-place swap, history-aware)
├── (Numbers)         Track record stats — intentionally no nav item, it's
│                     reinforcement, not a destination
├── #testimonials    Reserved placeholder cards
└── #contact          Form + direct contact channels
```

Header nav intentionally omits the Numbers band — it has no independent
identity a visitor would search for, it exists to punctuate the page.
`Work` is used as the nav label (not "Success Stories") to read naturally
in a sentence — "About / Expertise / Experience / Work / Testimonials /
Contact" — and to signal "portfolio evidence" the way a visitor expects.

## 3. Brand Identity Direction

The brand sits deliberately between **management consulting** (trust,
rigor) and **athlete/creator management** (energy, personal stakes) — the
two worlds this person actually operates in. Visual language:

- **Charcoal, not navy or black** — navy reads "corporate/finance,"
  pure black reads "luxury fashion." Warm charcoal (slightly brown-black,
  not blue-black) reads *authoritative but human*.
- **Bronze, not gold or blue** — gold reads "luxury/award show," electric
  blue reads "generic SaaS." Bronze/copper is warm, earned, metallic
  without being flashy — closer to "trophy" than "startup gradient."
- **Serif display type for headlines** — signals editorial authority and
  slows the reader down at the moments that matter (name, headline,
  thesis statement), a deliberate contrast to the fast, sans-only rhythm
  of SaaS landing pages.
- **Restraint as the tell of premium** — no autoplay video, no parallax
  gimmicks, no more than one accent color. The brief explicitly asked to
  avoid "flashy," and in this category (consulting/personal authority)
  restraint itself is the credibility signal.

**Decision log** (confirmed with the site owner before build):
palette = *Charcoal & Bronze*, structure = *single-page scroll*, contact
form = *Next.js API route + Resend*, imagery = *placeholder art now, real
photos later*.

## 4. Color Palette

Defined in [`src/app/globals.css`](../src/app/globals.css) as semantic
tokens that flip between light/dark — components consume `bg-canvas`,
`text-ink`, etc., never raw hex.

**Vintage dark red + warm cream.** Red is the dominant primary; cream is the
secondary/contrast colour. Reds are muted and wine-derived rather than bright
or saturated, and pure white is never used — the lightest value on the site
is a warm cream.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F7F0E6` | `#150A0D` | Page background |
| `canvas-raised` | `#FCF7EF` | `#1F1014` | Card/surface background |
| `ink` | `#1A0E10` | `#F3E5D6` | Primary text / primary button fill |
| `ink-soft` | `#4A2E32` | `#DCC7B8` | Body copy |
| `muted` | `#6B4B4E` | `#AC8B86` | Captions, labels |
| `line` | `#E3D2C2` | `#33181D` | Hairline borders |
| `accent` | `#A33443` | `#C4626C` | Claret — icons, borders, large text |
| `accent-text` | `#87202F` | `#DD8E8B` | Claret for **small text** (AA-safe) |
| `accent-soft` | `#F6E2DC` | `#2E1319` | Tinted badge backgrounds |
| `error` | `#A8341F` | `#E0897A` | Form validation only — deliberately warmer/oranger than `accent` so an error still reads as an alert rather than as brand colour |

Two fixed scales (not theme-flipped) back the surfaces that stay dark in
both themes — the footer band, the stats band, and media cards sitting over
photography:

- **`wine-950…100`** (`#120709` → `#F3E5D6`) — deep burgundy-black up to warm
  cream. Carries both those surfaces and the text on them.
- **`claret-700…50`** (`#6B1524` → `#FBEDE8`) — the saturated accent ramp.

**Gradients** are centralised as three utilities in `globals.css`, never
inline: `.surface-deep` (footer + stats band), `.surface-card` (media and
story cards), `.surface-hero` (the hero wash). Each is a low-contrast,
atmospheric shift within the wine ramp — depth, not decoration. `.surface-card`
and the hero placeholder also declare a solid `background-color` beneath the
gradient so cream text keeps a dark backdrop even if the gradient fails to
paint.

Deliberately excluded: pure white (`#FFF` appears nowhere — cream `#F3E5D6`
is the lightest value), blue, and any neon/high-saturation red.

**Verification.** 35 palette-level contrast pairs are checked against WCAG AA
before the palette is applied, and a live DOM audit then walks every rendered
text node in both themes across the overview, both galleries, and the
lightbox — compositing translucent ancestors to find each element's true
effective background. Both currently report zero failures. Two real defects
were found and fixed this way: footer meta text at 3.3:1 and the testimonial
role placeholder at 3.4:1.

## 5. Typography

| Role | Font | Notes |
|---|---|---|
| Display / headlines | **Fraunces** (variable, `opsz` axis) | Warm high-contrast serif — editorial authority, not wedding-invite Playfair |
| Body / UI | **Inter** | Neutral, exceptional legibility at small sizes |

Both loaded via `next/font/google` in [`layout.tsx`](../src/app/layout.tsx)
— self-hosted automatically, zero external font requests, `display: swap`
so text never blocks on font load. Mapped to Tailwind as `font-display` /
`font-sans` via CSS variables in `globals.css`.

Scale is fluid via Tailwind responsive classes rather than a fixed type
scale (e.g. hero headline `text-5xl sm:text-6xl lg:text-[4.75rem]`) —
deliberately hand-tuned per breakpoint rather than a rigid `clamp()` formula,
since the hero headline is the single highest-craft element on the page.

## 6. Wireframe Rationale, Section by Section

- **Hero** — asymmetric 1.15fr/0.85fr split, not centered. A centered hero
  reads as a generic template; an asymmetric one with a portrait-placeholder
  block on the right reads as "designed." Name is a modest h1 above the
  headline (not the loudest element) — the *value proposition* is what
  should dominate visually, the name anchors identity/SEO without
  competing with it. Trust strip sits below the CTAs, not above — it
  supports the ask, it doesn't precede it.
- **About** — single-column, wide reading measure (`max-w-3xl`), drop-cap
  on the first paragraph, thesis statement pulled out as a bordered
  blockquote. Editorial magazine treatment, not a resume "About Me" block.
- **Expertise** — 4-column card grid (2/3/4 responsive). Cards, not a list
  — each capability gets equal visual weight, scannable in under 5 seconds.
- **Experience** — vertical timeline, left-aligned (not zig-zag). Zig-zag
  timelines look impressive but are harder to read on mobile and with
  variable-length copy; left-aligned with a connecting line stays legible
  at every viewport and content length.
- **Success Stories** — 3-column cards with conditional content blocks
  (achievements list for Omar Antar, stat callout for Omar Aboud) — same
  card shape, different proof format per story, because the underlying
  facts genuinely differ.
- **Numbers** — full-bleed dark band, deliberately breaking the light
  rhythm of the rest of the page. A stats section that looks like every
  other section gets skimmed past; a tonal break forces a beat.
- **Testimonials** — dashed borders + explicit "coming soon" copy. The
  brief required placeholders with no invented quotes — the dashed border
  makes the *reserved* state a design choice rather than an oversight.
- **Contact** — 0.85fr/1.15fr split, direct channels on the left (lower
  friction, for visitors who don't want to fill a form), form on the right
  (higher intent capture, with qualification via the "reason" field).

## 7. UI Design Rationale

- **Cards over tables/lists** almost everywhere — cards scan well on
  mobile, carry shadow/border for hierarchy, and give room for icons.
- **One accent color, used surgically** — bronze appears in icons,
  borders, kickers, and large numerals, but primary buttons are
  `ink`/`canvas` (near-black on light, near-white on dark) for
  contrast-safety and because a bronze-filled button at this size fails
  AA text contrast in light mode (see §14) — a real constraint that shaped
  the design, not an afterthought.
- **`rounded-3xl` cards, `rounded-full` buttons/badges** — soft geometry
  throughout avoids the "corporate template" look of sharp 4px radii while
  staying short of "friendly startup" pill-everything.
- **Grain texture + radial glow on Hero** (`.bg-grain` utility) — a static,
  near-invisible (3.5% opacity) noise layer that keeps large flat dark
  surfaces from looking like a flat SaaS gradient, at zero performance or
  motion cost.

## 8. Responsive Behavior

Mobile-first Tailwind breakpoints throughout (`sm`, `lg` used most; `md`
skipped where a section only needs a 2-step change). Verified at 375px
(mobile), 768px (tablet), and native desktop:

- Header collapses to a hamburger menu below `lg`; the mobile panel is a
  height-animated `AnimatePresence` drawer, not a full-screen takeover.
- Hero's two-column grid (`lg:grid-cols-[1.15fr_0.85fr]`) collapses to a
  single stacked column below `lg`.
- Expertise grid: 2 columns (mobile) → 3 (`sm`) → 4 (`lg`).
- Timeline stays single-column at all sizes (a zig-zag layout was
  rejected specifically because it degrades on mobile — see §6).
- Numbers grid: 2 columns (mobile) → 3 (`sm`) → 5 (`lg`).
- Verified no horizontal overflow at 375px viewport width
  (`document.body.scrollWidth === window.innerWidth`).

## 9. Animation Plan

Framer Motion, used with intent rather than decoration — every animated
element either **orients** the visitor (staggered hero entrance signals
reading order) or **rewards scrolling** (`whileInView` reveals). Nothing
loops indefinitely except one thing: the hero portrait's slow float.

| Element | Trigger | Motion | Why |
|---|---|---|---|
| Hero content | Mount | Staggered fade + rise (`staggerChildren: 0.09`) | Establishes reading order on first paint |
| Hero portrait | Mount | Fade + scale | Secondary to the text, arrives slightly after |
| Hero portrait | Continuous | Slow 7s float, ±10px | The one ambient loop — gated off under reduced-motion |
| All section headings/cards | Scroll into view, once | Fade + 24px rise, `[0.16, 1, 0.3, 1]` ease | "Premium" easing curve (shared with CSS via `--ease-premium`), not a bounce/spring — signals restraint |
| Stat numbers | Scroll into view, once | Count-up (`AnimatedCounter`) | Numbers are the section's whole point — motion earns attention here |
| Header | Scroll | Background/blur fade in past 24px | Keeps nav legible over the hero without a hard visual seam at y=0 |
| Buttons | Hover | 2px lift + shadow, arrow icon translate | Standard affordance, no color-shift gimmicks |
| Mobile menu | Open/close | Height + opacity | Simple, not gated behind reduced-motion (user-initiated, not ambient) |

**`prefers-reduced-motion` is respected at two levels:** a global CSS
override collapses all animation/transition durations to near-zero, and
every Framer Motion component additionally calls `useReducedMotion()` to
skip transform offsets and the hero's infinite float specifically (a CSS
duration override alone wouldn't stop a JS-driven infinite loop cleanly).

## 10. Component Hierarchy

```
RootLayout (fonts, theme-init script, skip link, Header, Footer)
└── Home (page.tsx)
    ├── PersonJsonLd
    ├── Hero               [client — staggered entrance]
    ├── About
    ├── Expertise
    ├── ExperienceTimeline
    ├── SuccessStories
    ├── Numbers
    ├── Testimonials
    └── Contact
        └── ContactForm     [client — form state]

components/
├── layout/   Header [client], Footer, ThemeToggle [client]
├── sections/ one file per page section (above)
└── ui/       Container, SectionHeading, Reveal [client], Button, Card,
              Badge, AnimatedCounter [client], PlaceholderArt
```

Client/server boundaries are deliberately narrow — only components that
need interactivity or browser APIs (`Header`, `ThemeToggle`, `Reveal`,
`AnimatedCounter`, `Hero`, `ContactForm`) are Client Components; every
section wrapper and all data mapping stays server-rendered.

## 11. Folder Structure

```
portfolio/
├── docs/STRATEGY.md
├── src/
│   ├── app/
│   │   ├── api/contact/route.ts     Resend-backed form handler
│   │   ├── layout.tsx               Fonts, metadata, theme script
│   │   ├── page.tsx                 Section assembly + JSON-LD
│   │   ├── globals.css              Tailwind v4 theme tokens
│   │   ├── sitemap.ts / robots.ts / manifest.ts
│   │   └── opengraph-image.tsx      Dynamic OG card
│   ├── components/{layout,sections,ui}/
│   ├── lib/
│   │   ├── site-config.ts           Identity/contact — single source of truth
│   │   ├── content.ts               All section copy/data
│   │   ├── icons.tsx                kebab-case string → lucide-react component
│   │   ├── motion.ts                Shared easing constant
│   │   └── utils.ts                 `cn()` helper
│   └── types/index.ts
├── .env.example
└── package.json
```

## 12. Implementation Plan (as executed)

1. Scaffold (Next.js 16 / React 19 / Tailwind v4 / TypeScript, via
   `create-next-app`).
2. Theme layer — palette, fonts, dark-mode variant, base CSS.
3. Content layer — `site-config.ts` + `content.ts`, sourced only from the
   supplied profile content.
4. UI primitives, then layout chrome (Header/Footer/ThemeToggle), then
   sections in page order, then the Contact API route.
5. SEO (metadata, sitemap, robots, manifest, OG image, JSON-LD).
6. Accessibility + performance pass.
7. Browser verification (content, console, contrast, responsive,
   API behavior).

## 13. SEO Strategy

- `metadataBase` + title template (`%s — {Name}`) in `layout.tsx` so every
  future route inherits correct absolute OG/canonical URLs.
- Person `JSON-LD` on the homepage (`sameAs` auto-filters out unset social
  placeholders so it never emits a broken link).
- Dynamic OG image (`opengraph-image.tsx`) generated from brand tokens —
  no static asset to forget to update when the headline changes.
- `sitemap.ts` / `robots.ts` generated from `siteConfig.url`, not
  hand-duplicated strings.
- Semantic heading order: one `h1` (name), one `h2` per section
  (`SectionHeading`), `h3` for cards — verified no skipped levels.
- Single-page architecture means all authority consolidates on one URL —
  correct call for a personal-brand site optimizing for name-search and
  direct/referral traffic over long-tail content SEO.

**Follow-ups once real content exists:** register Google Search Console,
submit the sitemap, and add `alt` text the moment real photos replace
`PlaceholderArt`.

## 14. Accessibility Checklist

- [x] Skip-to-content link, visible on focus
- [x] Landmarks: `header`, `nav[aria-label]` ×2, `main#main`, `footer`
- [x] One `h1`; no skipped heading levels
- [x] Global `:focus-visible` outline (2px, accent, 3px offset)
- [x] `prefers-reduced-motion` honored globally (CSS) and per-component
      (Framer Motion `useReducedMotion`, including the one infinite loop)
- [x] All form fields have associated `<label htmlFor>`; errors use
      `role="alert"`
- [x] Every interactive icon-only control has `aria-label`
      (theme toggle, menu button)
- [x] Decorative elements (`PlaceholderArt`, dividers) are `aria-hidden`
- [x] External links get `target="_blank"` + `rel="noreferrer noopener"`
- [x] **Manual contrast pass**, not assumed — this caught two real bugs
      during the build:
  - `muted` was `#7A7060` on light canvas (4.40:1, fails AA) → darkened to
    `#6F6656` (5.11:1)
  - plain `accent` bronze on canvas is only ~3.5:1 (fine for large
    text/icons, fails AA for small text) → added a dedicated
    `accent-text` token (4.93:1 light / 7.08:1 dark) for all small bronze
    text; `error` got the same light/dark-specific treatment
    (4.63:1 / 6.46:1)
- [ ] **Outstanding, needs a real screen reader pass**: this was verified
      programmatically (DOM structure, ARIA attributes, contrast ratios)
      but not with an actual VoiceOver/NVDA run — recommended before
      launch.

## 15. Performance Optimization Strategy

- **Media is preprocessed, not shipped raw.** See §17 — this is the single
  biggest performance decision on the site.
- **Fonts**: two families, both self-hosted via `next/font`, Latin subset
  only, `display: swap` — no external font requests, no layout-shift
  penalty.
- **Client JS kept narrow**: only 6 components are Client Components; all
  content mapping and static sections render on the server.
- **No animation libraries beyond Framer Motion**; no jQuery-era
  scroll-listener libraries — the one scroll listener (header blur) uses
  Framer's `useMotionValueEvent`, which is passive and rAF-batched.
- **Static generation**: the route has no per-request data dependency, so
  it prerenders fully at build time; only `/api/contact` is dynamic.

**Before deploying**, run `npm run build` and a Lighthouse pass — the
architecture is set up to score well, but that's the number to verify
against, not this document.

## 16. Conversion Optimization Recommendations

Implemented:
- CTA present in the sticky header (always reachable), the Hero, the
  Footer, and the Contact section itself — a visitor is never more than
  one scroll from an ask.
- Hero trust strip puts proof (50+ clients / 4+ years / 2M+ audience)
  directly under the primary CTA, addressing objections before they form.
- Contact form's "Reason for reaching out" field pre-qualifies leads
  (consulting vs. speaking vs. partnership vs. mentorship) — makes the
  first reply faster and more targeted, which itself improves conversion
  from inquiry to booked call.
- Direct channels (email, LinkedIn) sit beside the form, not instead of
  it — some visitors convert faster via a channel they already trust.

Recommended next (content-dependent, not implemented — would require real
data the brief said not to fabricate):
- Replace `PlaceholderArt` with a real portrait — trust jumps measurably
  with a real face on a personal-brand site.
- Fill the three Testimonials slots — currently the one section that's
  honest-but-incomplete; it's also usually the highest-leverage section
  for conversion on a consulting/personal-brand site.
- Once real domain/email are set (see `site-config.ts` TODOs), consider a
  simple analytics setup (e.g. Vercel Analytics or Plausible) to see which
  section people actually stop scrolling at — the current section order is
  a hypothesis, not a measured result.

---

## 17. Media System (Photography & Videography)

### The problem

The supplied assets in `src/Assets/` total **2.1 GB**: 23 photos at
6000x4000, and 22 vertical (1080x1920) reels exported at **~20 Mbps** —
roughly 10x what the web needs. Individual video files ran up to 217 MB.
Shipping any of that directly was never viable.

### The pipeline

`npm run media` ([`scripts/optimize-media.mjs`](../scripts/optimize-media.mjs))
derives web-grade media using `ffmpeg-static` (a dev dependency — nothing
ships to the client):

| Asset | Treatment |
|---|---|
| Gallery photos | Long edge capped at 2000px, JPEG q4 |
| Video | 720x1280 H.264, CRF 26, `preset slow`, `+faststart` |
| Video posters | Frame pulled at 10% in (frame 0 is often a fade), 900px |
| Card backgrounds | Long edge 1600px |
| Every item | 16px-wide base64 `blurDataURL` for `placeholder="blur"` |

Originals are never modified. Output lands in `public/media/`, and the
script writes [`src/lib/media-manifest.json`](../src/lib/media-manifest.json)
with dimensions, durations, and blur data — consumed through the typed
accessor in [`src/lib/media.ts`](../src/lib/media.ts).

**CRF over fixed bitrate** was deliberate: it targets *quality* and spends
bits only where the footage needs them, so a static talking-head clip
compresses far harder than a fast-panning fight sequence at identical
perceived quality.

### Why the layered loading actually matters

Even optimized, the video set is the heaviest thing here. The load path is
staged so a visitor never pays for what they don't watch:

1. Section overview shows **two cover images** (~50 KB each).
2. Opening a gallery loads **poster images only**, lazily, via `next/image`.
3. A video file is fetched **only when its tile is clicked** — `preload` is
   left at `metadata`, and `+faststart` means playback begins before the
   file finishes arriving.

So the gallery is image-weight, not video-weight, and a visitor who watches
two clips downloads ~20 MB rather than the full set.

### Categorisation

Folder structure is the source of truth. Categories and their order come
from the filesystem — ordered by **birth time**, which is the only sequence
signal the folders carry, giving Videography: *Sports → Contracting & Real
Estate → Others → Modeling*. Adding work later means dropping files into the
matching folder and re-running `npm run media`; no code changes.

One display-only override exists, in `CATEGORY_LABELS`: the folder
`Contracting and Realstate` renders as **"Contracting & Real Estate"**. The
folder name stays untouched as the source of truth for slug and ordering —
only the label is corrected, since a visible spelling error would undercut
the credibility the rest of the site is built on.

### Navigation

Galleries open as an **in-place view swap**, not a separate route — §1
established the single-page scroll as a deliberate conversion decision, and
routing away from it would break that narrative. To keep browser behaviour
intuitive anyway, the active view is pushed onto the history stack and
mirrored into the URL hash (`#photography` / `#videography`), so:

- the browser/Android back button closes the gallery,
- gallery views are deep-linkable and shareable,
- the in-UI Back button delegates to `history.back()` when it owns the
  entry, and falls back to `replaceState` when the visitor deep-linked
  straight in (nothing to go back to).

### Media protection

Casual saving is discouraged, subtly and silently — no blocking messages,
alerts, or "downloading disabled" UI anywhere:

- context menu suppressed **on media elements only** (the rest of the page
  keeps normal right-click),
- native image drag disabled via `draggable={false}` and
  `-webkit-user-drag: none` (`.media-guard`),
- grid thumbnails are `pointer-events-none` beneath their button, so they
  cannot be targeted directly,
- video renders with `controlsList="nodownload noplaybackrate"` and
  `disablePictureInPicture`; no download affordance is exposed anywhere.

**This is friction, not protection.** Anything a browser can render can
ultimately be captured — screen recording, DevTools, and the network tab all
remain available. The measures above stop the one-click save, nothing more.
Genuine control would require DRM-backed streaming, which is disproportionate
for a portfolio.

### Accessibility of the gallery

- Every tile is a real `<button>` with a descriptive label
  ("Play video: …" / "View photo: …").
- Lightbox is `role="dialog"` + `aria-modal`, labelled with the item title
  and position ("Item 4 of 23").
- Escape closes; Left/Right arrows navigate; focus moves to the close button
  on open and is **restored to the triggering tile** on close.
- Background scroll is locked while open, with scrollbar-width compensation
  so the page behind doesn't shift.
- Success-story and gallery hover reveals use `.reveal-target`, which is
  visible by default and only collapses inside
  `@media (hover: hover) and (pointer: fine)` — so touch devices and screen
  readers always get the full content, and `:focus-within` keeps it
  keyboard-reachable.

### Two implementation gotchas worth knowing

**1. A media query nested inside `@layer utilities` is silently dropped.**
The hover-reveal rules originally lived inside `@layer utilities` in
`globals.css`. Tailwind v4's pipeline emitted the CSS text — it was visible in
the compiled stylesheet — but the browser never applied it, so the cards
showed their expanded state permanently on desktop. Unconditional rules in
the same layer (`.media-guard`) applied fine; only the `@media`-wrapped ones
failed. The fix was to move that block out of the layer entirely. If a custom
rule in `globals.css` mysteriously does nothing, check whether it is wrapped
in a media query inside a `@layer`.

**2. View swapping uses a keyed remount, not `AnimatePresence`.**
Both the gallery view swap and the lightbox mount/unmount without exit
animations. For the lightbox this is a deliberate robustness choice: a
full-screen overlay whose exit animation stalls would leave an invisible,
`pointer-events: auto` layer covering the entire page and silently swallowing
every click. Instant unmount removes that failure mode, and a 250ms fade-out
was never worth the risk. Entrances are CSS keyframes (`.animate-view-in`,
`.animate-overlay-in`, `.animate-figure-in`), which also means the global
`prefers-reduced-motion` rule neutralises them automatically.
