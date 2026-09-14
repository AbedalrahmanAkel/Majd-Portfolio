import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { AccentText } from "./accent-text";

interface SectionHeadingProps {
  /** e.g. "02" — rendered as a large ghost numeral beside the kicker. The
   *  kicker text remains the accessible label; the numeral is decorative. */
  index?: string;
  kicker: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={cn("max-w-2xl", isCenter && "mx-auto text-center", className)}>
      <Reveal>
        <div
          className={cn(
            "flex items-center gap-4",
            isCenter && "justify-center",
          )}
        >
          {index ? (
            <span className="numeral-ghost select-none text-5xl sm:text-6xl" aria-hidden="true">
              {index}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
            <span className="h-px w-6 bg-accent-text" aria-hidden="true" />
            {kicker}
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="text-balance mt-4 font-display text-3xl leading-[1.1] font-medium sm:text-4xl lg:text-5xl">
          <AccentText>{title}</AccentText>
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.16}>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{description}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
