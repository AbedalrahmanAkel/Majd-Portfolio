import { Hero } from "@/components/sections/hero";
import { Expertise } from "@/components/sections/expertise";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { SuccessStories } from "@/components/sections/success-stories";
import { VisualWork } from "@/components/sections/visual-work";
import { Numbers } from "@/components/sections/numbers";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import { siteConfig } from "@/lib/site-config";
import { getCardImages, getDisciplines } from "@/lib/media";

/**
 * Rendered per request rather than prerendered.
 *
 * The gallery comes from a manifest on the data volume, which the dashboard
 * edits at runtime. A prerendered page is generated at BUILD time, when that
 * volume is not mounted — so every deploy would serve the shipped seed until
 * something happened to revalidate it, resurrecting deleted photos in the
 * meantime. The page does no I/O beyond reading one small JSON file, so
 * rendering it per request costs very little and is always correct.
 */
export const dynamic = "force-dynamic";

function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    url: siteConfig.url,
    email: siteConfig.email,
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
      siteConfig.social.twitter,
    ].filter((link) => link && link !== "#"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Media is read once here and handed to the sections. The dashboard can
 * change it at runtime, so revalidatePath("/") in the dashboard actions is
 * what refreshes this page after an edit.
 */
export default async function Home() {
  const [cards, disciplines] = await Promise.all([getCardImages(), getDisciplines()]);

  return (
    <>
      <PersonJsonLd />
      <Hero portrait={cards.composite} />
      {/* About is intentionally disabled. To restore it, re-add
          `import { About } from "@/components/sections/about";` above and
          render <About /> here — the section itself is untouched. */}
      <Expertise />
      <ExperienceTimeline />
      <SuccessStories />
      <VisualWork disciplines={disciplines} />
      <Numbers />
      <Testimonials />
      <Contact />
    </>
  );
}
