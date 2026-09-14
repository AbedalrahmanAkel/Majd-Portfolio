"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <header
      className={cn(
        // A hairline rule marks the masthead edge from the very first frame
        // — only its weight and the backdrop behind it change on scroll,
        // rather than the rule appearing out of nowhere.
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-canvas/85 backdrop-blur-md"
          : "border-line/40 bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <a
          href="#"
          className="font-display text-base font-semibold tracking-[0.08em] text-ink uppercase"
        >
          {siteConfig.name}
        </a>

        <nav
          className="hidden items-center divide-x divide-line lg:flex"
          aria-label="Primary"
        >
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-underline px-4 text-xs font-medium tracking-[0.12em] text-ink-soft uppercase transition-colors duration-200 first:pl-0 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle />
          <Button href="#contact" variant="primary" className="px-5 py-3 text-[0.65rem]">
            Let&apos;s Talk
          </Button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full border border-line text-ink"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-line bg-canvas lg:hidden"
          >
            <Container className="flex flex-col divide-y divide-line py-2">
              {siteConfig.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <Button
                href="#contact"
                variant="primary"
                className="mt-4 mb-2 w-full"
                onClick={() => setMobileOpen(false)}
              >
                Let&apos;s Talk
              </Button>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
