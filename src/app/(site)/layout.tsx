import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Chrome for the public site.
 *
 * The header, footer, and skip link used to live in the root layout, which
 * meant every route inherited them — including the dashboard, where a
 * marketing nav and a "Start a Conversation" footer make no sense. Moving them
 * into a `(site)` route group leaves the public URLs untouched (`(site)` is
 * not part of the path) while letting `/dashboard` render on its own.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:rounded-full focus-visible:bg-accent focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-canvas focus-visible:shadow-premium"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
