"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AccentText } from "@/components/ui/accent-text";
import { siteConfig } from "@/lib/site-config";
import { stats } from "@/lib/content";
import type { CardImage } from "@/lib/media-types";
import { EASE_PREMIUM } from "@/lib/motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_PREMIUM } },
};

const trustStats = stats.slice(0, 3);

interface HeroProps {
  /** Passed from the page: this is a Client Component, so it cannot read
   *  the media manifest off disk itself. */
  portrait?: CardImage;
}

export function Hero({ portrait }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="bg-grain relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-32"
    >
      {/* Wash lives in `.surface-hero` so every gradient on the site is
          defined in one place (globals.css) rather than inline here. */}
      <div className="surface-hero pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <motion.div initial="hidden" animate="visible" variants={container}>
          {/* Eyebrow shares the SectionHeading kicker treatment (rule +
              tracked caps) so the hero reads as the same system as every
              section below it, not a one-off banner. */}
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase"
          >
            <span className="h-px w-6 bg-accent-text" aria-hidden="true" />
            {siteConfig.role}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
          >
            {siteConfig.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="text-balance mt-5 max-w-2xl font-display text-5xl leading-[1.05] font-medium text-ink sm:text-6xl lg:text-[4.75rem]"
          >
            <AccentText>{siteConfig.headline}</AccentText>
          </motion.p>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            {siteConfig.subheadline}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="#contact" variant="primary" icon>
              Let&apos;s Work Together
            </Button>
            <Button href="#experience" variant="secondary">
              View My Experience
            </Button>
          </motion.div>

          <motion.dl variants={item} className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
            {trustStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                {i > 0 ? (
                  <span className="hidden h-9 w-px bg-line sm:block" aria-hidden="true" />
                ) : null}
                <div>
                  <dt className="text-[0.65rem] font-medium tracking-[0.14em] text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-medium text-ink sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Left border acts as the magazine-page gutter rule between the
            copy column and the portrait column on wide screens. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE_PREMIUM, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none lg:border-l lg:border-line lg:pl-12"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Fixed 3:4 frame with object-cover: the frame decides the shape
                and the photo is cropped to fill it, so the portrait can never
                be distorted no matter what the source aspect is. */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-wine-950">
              {portrait ? (
                <Image
                  src={portrait.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  // Above the fold, so it is the LCP candidate.
                  priority
                  sizes="(min-width: 1024px) 38vw, (min-width: 640px) 24rem, 100vw"
                  placeholder="blur"
                  blurDataURL={portrait.blurDataURL}
                  draggable={false}
                  className="media-guard pointer-events-none object-cover object-top select-none"
                />
              ) : null}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl border border-wine-100/10"
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* Photo-credit line — a small print-editorial flourish under the
              figure, purely typographic (no data dependency). */}
          <p className="mt-4 flex items-center gap-2 text-xs tracking-[0.15em] text-muted uppercase">
            <span className="h-px w-4 bg-line" aria-hidden="true" />
            Fig. 01 — {siteConfig.role}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
