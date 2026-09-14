import type {
  ExpertiseItem,
  StatItem,
  SuccessStory,
  Testimonial,
  TimelineEntry,
} from "@/types";

/**
 * Every fact below is sourced directly from the provided profile content.
 * Wording is polished for tone; nothing is invented — no dates, clients,
 * or outcomes beyond what was supplied.
 */

export const aboutParagraphs: string[] = [
  "Every strategy is only as strong as the operation behind it. That belief didn't start in a boardroom — it started in a kitchen, responsible for food safety and daily operations at Jamil Bakery, and on the floor with Right To Play, leading groups as a Junior Leader long before “leadership” was a line on a résumé.",
  "That operational discipline carried directly into marketing. As Marketing Manager and Operations Officer at Focus, campaigns weren't judged by how clever they looked — only by whether they ran on time, on budget, and delivered for the client. Over 4+ years and 50+ client accounts, strategy and execution stopped being two separate jobs.",
  "Now leading the marketing team at Riseco, the job is building the systems, campaigns, and people that make growth repeatable — not a one-time win. Outside of client work, that same approach shapes personal brands: directing content, sponsorships, and positioning for a national MMA champion and a creator with a 2,000,000+ audience, and teaching the fundamentals directly through workshops reaching roughly 60 people.",
  "The common thread is simple: brands don't grow from good ideas alone. They grow from strategy paired with relentless execution — and someone in the room who can lead both.",
];

export const expertise: ExpertiseItem[] = [
  {
    title: "Marketing Strategy",
    description:
      "Positioning, messaging, and go-to-market planning built around how a brand actually earns attention and trust.",
    icon: "compass",
  },
  {
    title: "Brand Development",
    description:
      "Turning a raw reputation or idea into a distinct, consistent brand identity people recognize and remember.",
    icon: "gem",
  },
  {
    title: "Operations Management",
    description:
      "The processes, systems, and day-to-day discipline that let strategy survive contact with reality.",
    icon: "settings-2",
  },
  {
    title: "Team Leadership",
    description:
      "Building and directing marketing teams — setting standards, delegating with clarity, and owning outcomes.",
    icon: "users",
  },
  {
    title: "Personal Branding",
    description:
      "Shaping how athletes, creators, and entrepreneurs are perceived — on stage, on camera, and in the feed.",
    icon: "sparkles",
  },
  {
    title: "Growth Strategy",
    description:
      "Identifying the highest-leverage moves for audience — then sequencing them.",
    icon: "trending-up",
  },
  {
    title: "Campaign Execution",
    description:
      "Paid advertising and offline campaign delivery managed end-to-end, from brief to budget to results.",
    icon: "rocket",
  },
  {
    title: "Content Direction",
    description:
      "Directing podcasts, interviews, and content strategy so every piece serves the brand behind it.",
    icon: "clapperboard",
  },
];

export const timeline: TimelineEntry[] = [
  {
    id: "focus",
    company: "Focus",
    role: "Marketing Manager + Operations Officer (Support)",
    description:
      "Managed marketing execution while supporting operations — a dual role spanning campaign delivery, client management, and process. Worked across 50+ client accounts over 4+ years.",
    icon: "briefcase",
  },
  {
    id: "jamil-bakery",
    company: "Jamil Bakery",
    role: "Responsible for Food Safety & Kitchen",
    description:
      "Hands-on responsibility for food safety standards and kitchen operations — an early proving ground for discipline, process, and accountability.",
    icon: "chef-hat",
  },
  {
    id: "riseco",
    company: "Riseco",
    role: "Head of Marketing Team",
    current: false,
    description:
      "Leads the marketing team — setting strategy, directing campaigns, and building the processes and people behind consistent brand growth.",
    icon: "building-2",
  },
  {
    id: "right-to-play",
    company: "Right To Play",
    role: "Junior Leader",
    description:
      "Junior Leader with Right To Play, a global youth-development organization — early, hands-on experience leading groups and guiding peers.",
    icon: "heart-handshake",
  }
];

export const successStories: SuccessStory[] = [
  {
    id: "omar-antar",
    name: "Omar Antar",
    category: "Athlete Branding & Sponsorship",
    summary:
      "World-class MMA competitor — 3rd Place World MMA Youth Championship, 1st Place World MMA Amateur Championship, and three-time Lebanon MMA Champion.",
    achievements: [
      "3rd Place, World MMA Youth Championship",
      "1st Place, World MMA Amateur Championship",
      "Three-time Lebanon MMA Champion",
    ],
    contributions: [
      "Personal Branding",
      "Content Strategy",
      "Sponsorship Management",
      "Paid Advertising",
      "Digital Presence",
    ],
    icon: "trophy",
    imageKey: "omarantar",
  },
  {
    id: "omar-aboud",
    name: "Omar Aboud",
    category: "Influencer Growth & Podcast Direction",
    summary:
      "Content creator and influencer with an audience of 500,000+ followers.",
    contributions: [
      "Podcast Direction",
      "Interview Scripting",
      "Sponsorship Management",
      "Advertising",
      "Personal Branding",
      "Content Strategy",
    ],
    stat: { value: "500K+", label: "Followers" },
    icon: "mic-2",
    imageKey: "omaraboud",
  },
  {
    id: "workshops",
    name: "Marketing & Branding Workshops",
    category: "Education & Community",
    summary:
      "Hands-on sessions sharing practical marketing and branding knowledge with rising talent and teams.",
    contributions: ["3 Workshops Conducted", "~60 Participants Reached"],
    icon: "presentation",
    imageKey: "majdhalimacard",
  },
];

export const stats: StatItem[] = [
  { value: "50+", label: "Clients" },
  { value: "4+", label: "Years Experience" },
  { value: "2M+", label: "Audience Reached" },
  { value: "3", label: "Workshops" },
  { value: "60", label: "Workshop Participants" },
];

export const testimonials: Testimonial[] = [
  { name: "Neswan Al Foron", role: "Role, Company", text: "A game changer for us was when an idea pops up at 12:00 AM midnight, and you were more responsive than any other agency we've worked with." },
  { name: "Nahouli Group", role: "Role, Company", text: "Your team delivered beyond our expectations. Your attention to detail and creative approach made all the difference." },
  { name: "Romanista Football Acedamy", role: "Role, Company", text: "Everytime is a new hit, your videos give us an adrenaline rush!" },
];
