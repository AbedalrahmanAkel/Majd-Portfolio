import { ArrowUpRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const socialLinks = [
  { label: "LinkedIn", href: siteConfig.social.linkedin },
  { label: "Instagram", href: siteConfig.social.instagram }
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-deep text-wine-100">
      <Container className="py-20">
        <div className="flex flex-col justify-between gap-12 border-b border-wine-100/10 pb-16 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <p className="font-display text-3xl leading-tight font-medium text-wine-100 sm:text-4xl">
              Have a brand, team, or business worth growing?
            </p>
            <p className="mt-4 text-wine-300">
              Let&apos;s talk about what strategy and execution could look like
              together.
            </p>
          </div>
          <Button
            href="#contact"
            variant="primary"
            icon
            className="bg-claret-600 text-wine-100 hover:bg-claret-500 hover:shadow-none"
          >
            Start a Conversation
          </Button>
        </div>

        {/* Divided like a classifieds column rather than a plain grid — each
            block gets a hairline rule instead of relying on gap alone. */}
        <div className="grid grid-cols-2 divide-y divide-wine-100/10 py-4 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          <div className="col-span-2 py-8 pr-0 sm:col-span-1 sm:py-12 sm:pr-8">
            <p className="font-display text-lg text-wine-100">{siteConfig.name}</p>
            <p className="mt-2 text-sm text-wine-400">{siteConfig.role}</p>
          </div>

          <nav aria-label="Footer navigation" className="py-8 sm:py-12 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-wine-400 uppercase">
              Navigate
            </p>
            <ul className="mt-4 space-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="link-underline text-sm text-wine-300 transition-colors hover:text-claret-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="py-8 sm:py-12 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-wine-400 uppercase">
              Connect
            </p>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline inline-flex items-center gap-1 text-sm text-wine-300 transition-colors hover:text-claret-300"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="py-8 pl-0 sm:py-12 sm:pl-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-wine-400 uppercase">
              Contact
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="link-underline inline-flex items-center gap-1.5 text-sm text-wine-300 transition-colors hover:text-claret-300"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* wine-400, not wine-500: at 12px on the deep gradient the 500 step
            measures 3.3:1 and fails AA. 400 clears it at 5.5:1. */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-wine-100/10 pt-8 text-xs text-wine-400 sm:flex-row">
          <p>
            {/* The copyright mark doubles as the way in to the media
                dashboard. Deliberately unobtrusive: it keeps the inherited
                colour and weight so the footer reads exactly as before, and
                the accessible name explains where it goes for anyone who
                reaches it with a keyboard or screen reader. */}
            <a
              href="/dashboard"
              aria-label="Media dashboard"
              title="Media dashboard"
              className="cursor-pointer transition-colors hover:text-claret-300"
            >
              ©
            </a>{" "}
            {year} {siteConfig.name}. All rights reserved.
          </p>
          <a href="#" className="link-underline transition-colors hover:text-claret-300">
            Back to top ↑
          </a>
        </div>
      </Container>
    </footer>
  );
}
