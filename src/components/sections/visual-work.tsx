"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Camera, Film } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { MediaGallery } from "@/components/media/media-gallery";
import type { Discipline, DisciplineSlug } from "@/lib/media-types";
import { siteConfig } from "@/lib/site-config";

const SECTION_ID = "visual-work";

const disciplineIcons = {
  photography: Camera,
  videography: Film,
} as const;

/**
 * The URL hash drives which view is showing.
 *
 * `popstate`/`hashchange` cover the browser's own back/forward, but
 * `pushState` fires neither, so navigations we initiate notify these
 * subscribers explicitly via `emit`.
 */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

const readHash = () =>
  typeof window === "undefined" ? "" : window.location.hash.replace("#", "");

/**
 * Photography & Videography.
 *
 * The site is a single-page, anchor-navigated experience (see docs/STRATEGY.md
 * §1), so galleries open as an in-place view swap rather than a separate
 * route — that keeps the scroll narrative intact. The view is still mirrored
 * into the URL hash and pushed onto the history stack, so the browser/Android
 * back button and deep links behave exactly as a visitor expects.
 */
interface VisualWorkProps {
  /** Read on the server and passed down: this view is interactive (hash
   *  routing, lightbox) so it stays a Client Component and cannot read the
   *  media manifest off disk itself. */
  disciplines: Discipline[];
}

export function VisualWork({ disciplines }: VisualWorkProps) {
  // Starts empty so server and client agree on first paint, then syncs to the
  // real URL immediately after hydration (see effect below).
  const [hash, setHash] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const shouldRestoreScroll = useRef(false);

  useEffect(() => {
    const sync = () => setHash(readHash());

    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    listeners.add(sync);

    // Deferred rather than called inline: the hash is unknowable during SSR,
    // so this first read has to happen after hydration. A timeout rather than
    // requestAnimationFrame, because rAF never fires in a backgrounded tab —
    // a deep link opened in a background tab would otherwise never resolve.
    const timer = setTimeout(sync, 0);

    return () => {
      clearTimeout(timer);
      listeners.delete(sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const active = disciplines.find((discipline) => discipline.slug === hash);

  // Bring the section into view when swapping views, so the visitor isn't
  // left staring at the middle of a gallery they just opened or closed.
  useEffect(() => {
    if (!shouldRestoreScroll.current) return;
    shouldRestoreScroll.current = false;
    sectionRef.current?.scrollIntoView({ block: "start" });
  }, [hash]);

  function openGallery(slug: DisciplineSlug) {
    shouldRestoreScroll.current = true;
    window.history.pushState({ galleryView: slug }, "", `#${slug}`);
    emit();
  }

  function closeGallery() {
    shouldRestoreScroll.current = true;
    if (window.history.state?.galleryView) {
      // Let the browser unwind its own entry so forward/back stay consistent;
      // `popstate` will notify subscribers for us.
      window.history.back();
    } else {
      // Deep-linked straight into a gallery: there is nothing to go back to.
      window.history.replaceState(null, "", `#${SECTION_ID}`);
      emit();
    }
  }

  return (
    <section
      id={SECTION_ID}
      ref={sectionRef}
      className="border-t border-line py-24 lg:py-32"
    >
      <Container>
        {/* A keyed remount plus a CSS entrance, rather than AnimatePresence:
            this is a hard swap between two views, not a crossfade, so keeping
            the outgoing view mounted for an exit animation buys nothing. The
            key change alone restarts the entrance. */}
        <div key={active ? active.slug : "overview"} className="animate-view-in">
          {active ? (
            <div>
              <button
                type="button"
                onClick={closeGallery}
                className="link-underline group inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase transition-colors duration-200 hover:text-ink"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Back to Photography &amp; Videography
              </button>

              <div className="mt-8 mb-10">
                <span className="text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
                  {siteConfig.name}
                </span>
                <h2 className="mt-3 font-display text-3xl leading-[1.1] font-medium sm:text-4xl lg:text-5xl">
                  {active.label}
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
                  {active.description}
                </p>
              </div>

              <MediaGallery categories={active.categories} />
            </div>
          ) : (
            <div>
              <SectionHeading
                index="04"
                kicker="Photography & Videography"
                title="Shot, Directed, and Cut *In-House*"
                description={`Beyond strategy, ${siteConfig.name} works behind the camera — producing the match-day photography and short-form video that brands and athletes actually publish.`}
              />

              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
                {disciplines.map((discipline, index) => {
                  const Icon = disciplineIcons[discipline.slug];
                  const cover = discipline.cover;
                  const thumbnail = cover
                    ? (cover.type === "video" ? cover.poster : cover.src)
                    : undefined;

                  return (
                    <Reveal key={discipline.slug} delay={0.08 * index}>
                      <button
                        type="button"
                        onClick={() => openGallery(discipline.slug)}
                        className="group relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-2xl surface-card text-left shadow-premium transition-transform duration-500 ease-premium hover:-translate-y-1 sm:aspect-[16/10]"
                        aria-label={`View ${discipline.label} — ${discipline.itemCount} items`}
                      >
                        {thumbnail && cover ? (
                          <Image
                            src={thumbnail}
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            placeholder="blur"
                            blurDataURL={cover.blurDataURL}
                            draggable={false}
                            // Which slice of the crop stays visible — tuned
                            // per discipline in lib/media.ts.
                            style={{ objectPosition: discipline.coverPosition }}
                            className="pointer-events-none object-cover transition-transform duration-700 ease-premium select-none group-hover:scale-105"
                          />
                        ) : null}

                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/70 to-wine-950/20"
                          aria-hidden="true"
                        />

                        <span
                          className="numeral-ghost absolute top-6 right-7 text-5xl sm:text-6xl"
                          style={{ WebkitTextStroke: "1px var(--color-wine-100)", opacity: 0.7 }}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="relative flex items-end justify-between gap-4 p-7">
                          <div>
                            <span className="flex size-11 items-center justify-center rounded-lg border border-wine-100/15 bg-wine-100/10 text-claret-200 backdrop-blur-sm">
                              <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 font-display text-2xl font-medium text-wine-100 sm:text-3xl">
                              {discipline.label}
                            </h3>
                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-wine-200">
                              {discipline.description}
                            </p>
                            <p className="mt-3 text-xs font-medium tracking-[0.15em] text-claret-200 uppercase">
                              {discipline.itemCount}{" "}
                              {discipline.slug === "photography" ? "Photographs" : "Films"}
                            </p>
                          </div>

                          <span
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-wine-100/20 bg-wine-100/10 text-wine-100 backdrop-blur-sm transition-all duration-300 group-hover:bg-wine-100 group-hover:text-wine-950"
                            aria-hidden="true"
                          >
                            <ArrowUpRight className="size-5" />
                          </span>
                        </div>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
