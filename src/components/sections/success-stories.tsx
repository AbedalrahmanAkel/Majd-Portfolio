import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { successStories } from "@/lib/content";
import { getCardImages } from "@/lib/media";
import { iconMap } from "@/lib/icons";

export async function SuccessStories() {
  const cards = await getCardImages();

  return (
    <section id="work" className="border-t border-line py-24 lg:py-32">
      <Container>
        <SectionHeading
          index="03"
          kicker="Featured Success Stories"
          title="Brands and People, *Repositioned*"
          description="Real outcomes across athlete branding, creator growth, and hands-on marketing education."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {successStories.map((story, index) => {
            const Icon = iconMap[story.icon];
            const image = cards[story.imageKey];

            return (
              <Reveal key={story.id} delay={0.08 * index}>
                <article className="reveal-host group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl surface-card shadow-premium sm:aspect-[3/4]">
                  {image ? (
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      // Decorative: every fact in the image is stated in the
                      // card text below, so announcing it would duplicate.
                      aria-hidden="true"
                      placeholder="blur"
                      blurDataURL={image.blurDataURL}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="pointer-events-none object-cover transition-transform duration-700 ease-premium select-none group-hover:scale-105"
                      draggable={false}
                    />
                  ) : null}

                  {/* Scrim: bottom-weighted so the copy always clears AA
                      contrast regardless of what the photo does underneath. */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/75 to-wine-950/10"
                    aria-hidden="true"
                  />
                  <div
                    // Deepens on hover: the detail copy now extends further up
                    // the card, over parts of the photo the bottom-weighted
                    // gradient alone does not cover.
                    className="pointer-events-none absolute inset-0 bg-wine-950/25 transition-colors duration-500 group-hover:bg-wine-950/60"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-start justify-between gap-4 p-7 pb-0">
                    <span className="flex size-11 items-center justify-center rounded-lg border border-wine-100/15 bg-wine-100/10 text-claret-200 backdrop-blur-sm">
                      {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                    </span>
                    {story.stat ? (
                      <div className="text-right">
                        <p className="font-display text-2xl font-medium text-wine-100">
                          {story.stat.value}
                        </p>
                        <p className="text-xs text-wine-300">{story.stat.label}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* `reveal-anchor` is the positioning context the detail
                      block hangs off, which is what keeps every card's title
                      on the same baseline. */}
                  <div className="reveal-anchor relative mt-auto p-7">
                    <span className="inline-flex items-center rounded-sm border border-wine-100/30 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-claret-200 uppercase">
                      {story.category}
                    </span>

                    {/* Two-line box, text bottom-aligned. A title that wraps
                        would otherwise push its badge and detail block up and
                        break alignment with the single-line cards beside it.
                        (text-2xl leading = 2rem, so two lines = 4rem.) */}
                    <h3 className="mt-3 flex min-h-[4rem] items-end font-display text-2xl font-medium text-wine-100">
                      {story.name}
                    </h3>

                    {/* Collapsed on hover-capable pointers, always visible on
                        touch. See `.reveal-target` in globals.css. */}
                    <div className="reveal-target">
                      <p className="mt-2.5 text-sm leading-relaxed text-wine-200">
                        {story.summary}
                      </p>

                      {story.achievements ? (
                        <ul className="mt-4 space-y-1.5">
                          {story.achievements.map((achievement) => (
                            <li
                              key={achievement}
                              className="flex items-start gap-2 text-sm text-wine-200"
                            >
                              <CheckCircle2
                                className="mt-0.5 size-3.5 shrink-0 text-claret-300"
                                aria-hidden="true"
                              />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {story.contributions.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-sm border border-wine-100/15 px-2.5 py-1 text-[0.65rem] font-medium tracking-[0.06em] text-wine-100 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
