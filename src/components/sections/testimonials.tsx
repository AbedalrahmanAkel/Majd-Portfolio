import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-line py-24 lg:py-32">
      <Container>
        <SectionHeading
          index="05"
          kicker="Testimonials"
          title="What Clients & Collaborators Say"
          description="Reserved for direct feedback from clients, athletes, and creators — added as it comes in."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={index} delay={0.08 * index}>
              <div className="flex h-full flex-col rounded-xl border border-dashed border-line p-8">
                <Quote className="size-7 text-muted/60" aria-hidden="true" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted italic">
                  {testimonial.text}
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span
                    className="flex size-10 items-center justify-center rounded-full border border-dashed border-line text-xs text-muted"
                    aria-hidden="true"
                  >
                    —
                  </span>
                  <div>
                    <p className="text-sm font-medium text-muted">{testimonial.name}</p>
                    {/* Full-strength muted, not muted/70: at 70% this measured
                        3.4:1 and failed AA. Still reads as secondary. */}
                    {/* <p className="text-xs text-muted">{testimonial.role}</p> */}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
