import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { stats } from "@/lib/content";

export function Numbers() {
  return (
    <section className="surface-deep py-20 lg:py-24">
      <Container>
        <Reveal>
          {/* Same rule-flanked kicker treatment as SectionHeading, so this
              band reads as part of the same system rather than a one-off
              stat strip. */}
          <div className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.2em] text-wine-400 uppercase">
            <span className="h-px w-6 bg-wine-400" aria-hidden="true" />
            Track Record
            <span className="h-px w-6 bg-wine-400" aria-hidden="true" />
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={0.06 * index} className="text-center">
              <p className="font-display text-5xl font-medium text-wine-100 sm:text-6xl">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="mt-3 text-[0.7rem] font-medium tracking-[0.14em] text-wine-400 uppercase">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
