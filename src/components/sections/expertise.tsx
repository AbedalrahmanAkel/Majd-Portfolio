import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { expertise } from "@/lib/content";
import { iconMap } from "@/lib/icons";

export function Expertise() {
  return (
    <section id="expertise" className="border-t border-line py-24 lg:py-32">
      <Container>
        <SectionHeading
          index="01"
          kicker="Expertise"
          title="Strategic Capabilities, Not Software Skills"
          description="A working range built through practice, not certifications — from brand strategy through the operations that keep it running."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {expertise.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <Reveal key={item.title} delay={0.05 * (index % 4)}>
                <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-t-accent">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-muted tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-accent-text transition-colors duration-300">
                      {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
