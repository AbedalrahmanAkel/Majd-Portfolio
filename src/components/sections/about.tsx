import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { aboutParagraphs } from "@/lib/content";

const [lead, ...rest] = aboutParagraphs;
const thesis = rest[rest.length - 1];
const body = rest.slice(0, -1);

export function About() {
  return (
    <section id="about" className="py-24 lg:py-32">
      <Container>
        <SectionHeading index="00" kicker="About" title="The Story Behind the Strategy" />

        <div className="mt-14 max-w-3xl">
          <Reveal>
            <p className="text-xl leading-relaxed text-ink-soft first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-medium first-letter:text-ink">
              {lead}
            </p>
          </Reveal>

          {body.map((paragraph, index) => (
            <Reveal key={index} delay={0.08 * (index + 1)}>
              <p className="mt-6 text-xl leading-relaxed text-ink-soft">{paragraph}</p>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <blockquote className="mt-10 border-l-2 border-accent py-2 pl-6">
              {/* The one place the accent face carries a whole sentence: a
                  pull quote reads as a different voice from the body copy. */}
              <p className="text-balance font-accent text-2xl leading-snug font-medium text-ink italic sm:text-3xl">
                {thesis}
              </p>
            </blockquote>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
