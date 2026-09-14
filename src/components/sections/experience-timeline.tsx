import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { timeline } from "@/lib/content";
import { getCardImage } from "@/lib/media";
import { iconMap } from "@/lib/icons";

export async function ExperienceTimeline() {
  const plate = await getCardImage("composite2");

  return (
    <section id="experience" className="border-t border-line py-24 lg:py-32">
      <Container>
        <SectionHeading
          index="02"
          kicker="Experience"
          title="A Career Built From the Ground Up"
          description="Operations first, marketing leadership second — each role adding a layer the last one didn't have."
        />

        {/* Portrait plate + ledger. `items-stretch` (the flex default) gives
            the plate the exact height of the list; `aspect-ratio` with an auto
            width then derives its width from that height, so it stays the
            photo's own proportions until the 45% cap clips it. */}
        <div className="mt-16 flex items-stretch gap-10 lg:gap-14">
          {plate ? (
            // The image is the flex item itself, deliberately.
            //  - `self-stretch` gives it the exact height of the ledger.
            //  - `w-auto` on a replaced element with a definite height and an
            //    intrinsic ratio derives the width from that height, so the
            //    column is as wide as the photo wants to be. A wrapper div
            //    cannot do this: with only an absolutely-positioned `fill`
            //    child it has no in-flow content, so its auto width is 0.
            //  - `max-w-[45%]` then caps it against the row, and `object-cover`
            //    crops the overflow instead of squashing the picture.
            <Image
              src={plate.src}
              alt=""
              aria-hidden="true"
              width={plate.width}
              height={plate.height}
              placeholder="blur"
              blurDataURL={plate.blurDataURL}
              draggable={false}
              className="media-guard pointer-events-none hidden w-auto max-w-[45%] shrink-0 self-stretch rounded-2xl object-cover object-top ring-1 ring-wine-100/10 select-none lg:block"
            />
          ) : null}

          {/* A ledger of rows rather than a dotted timeline — each entry gets
              an outlined index numeral and a hairline rule, print-register
              style, instead of a connecting line with icon nodes. */}
          <ol className="min-w-0 flex-1 border-t border-line">
          {timeline.map((entry, index) => {
            const Icon = iconMap[entry.icon];
            return (
              <Reveal key={entry.id} delay={0.06 * index}>
                {/* Two columns, not three: the ledger now shares its row with
                    the portrait plate, so a separate company column would
                    leave the description too narrow to read at any width. */}
                <li className="grid grid-cols-1 gap-3 border-b border-line py-8 sm:grid-cols-[5rem_1fr] sm:gap-x-8 sm:gap-y-4">
                  <span
                    className="numeral-ghost text-4xl sm:text-5xl"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-line text-accent-text">
                      {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium tracking-wide text-accent-text">
                        {entry.company}
                      </p>
                      {entry.current ? <Badge>Current</Badge> : null}
                    </div>
                  </div>

                  {/* Two columns, three cells — so this one is pinned to
                      column 2 rather than wrapping back under the numeral. */}
                  <div className="sm:col-start-2">
                    <h3 className="font-display text-xl font-medium text-ink">
                      {entry.role}
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">
                      {entry.description}
                    </p>
                  </div>
                </li>
              </Reveal>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
