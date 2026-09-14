/**
 * Single source of truth for identity/contact details. Everything here that
 * is still a placeholder is marked TODO — update these and the whole site
 * (metadata, hero, footer, contact section, JSON-LD) picks it up.
 */
export const siteConfig = {
  name: "Majd Halima", // wasTODO: replace with real full name
  initials: "MH", // wasTODO: used in the monogram mark — update alongside name
  role: "Marketing & Operations Leader",
  // Words wrapped in *asterisks* render in the Cormorant Garamond accent
  // face. Keep it to one word — see components/ui/accent-text.tsx.
  headline: "Building brands, teams, and businesses that *perform*.",
  subheadline:
    "I lead marketing and operations for growing companies — and mentor athletes and creators in building personal brands that convert attention into opportunity.",
  description:
    "Marketing and operations professional focused on building brands, high-performing teams, strategy, execution, and leadership. 50+ clients served across marketing, operations, and personal brand growth.",
  location: "UAE", // wasTODO: e.g. "Beirut, Lebanon" — optional, improves local SEO
  url: "https://Majdhalima.com", // wasTODO: production domain
  email: "majdhalimasupport@gmail.com", // wasTODO: public contact email
  phone: "+96176948720", // wasTODO: optional
  social: {
    linkedin: "https://www.linkedin.com/in/majd-halima-b19070437", // wasTODO
    instagram: "https://www.instagram.com/majdz_halima/", // wasTODO
    twitter: "#", // TODO
  },
  nav: [
    // "About" is omitted while the About section is disabled in page.tsx —
    // it linked to #about, which no longer exists, so both the header and
    // footer links were dead. Re-add this entry when you restore the section.
    { label: "Expertise", href: "#expertise" },
    { label: "Experience", href: "#experience" },
    { label: "Work", href: "#work" },
    { label: "Photo & Video", href: "#visual-work" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ],
} as const;
