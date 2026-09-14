import { ArrowUpRight, Link2, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "./contact-form";
import { siteConfig } from "@/lib/site-config";

const contactLinks = [
  {
    label: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "Connect on LinkedIn",
    href: siteConfig.social.linkedin,
    icon: Link2,
  },
];

export function Contact() {
  return (
    <section id="contact" className="border-t border-line py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div>
            <SectionHeading
              index="06"
              kicker="Contact"
              title="Let's Build Something Worth Talking About"
              description="Open to marketing and operations consulting, brand partnerships, personal-branding mentorship, and speaking opportunities."
            />

            <Reveal delay={0.15}>
              <ul className="mt-10 space-y-4">
                {contactLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="group inline-flex items-center gap-3 text-ink transition-colors hover:text-accent-text"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                        <link.icon className="size-4.5" aria-hidden="true" />
                      </span>
                      <span className="link-underline text-base font-medium">{link.label}</span>
                      <ArrowUpRight
                        className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
