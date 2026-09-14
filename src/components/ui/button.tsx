import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

// Uppercase, tracked, small-caps-scale label — the boutique/editorial CTA
// treatment (Aesop, hospitality, print) in place of the previous plain
// sentence-case pill label. Still a full pill: one soft shape is a
// deliberate contrast against the mostly square/ruled layout around it.
const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:-translate-y-0.5 hover:shadow-premium",
  secondary:
    "border border-line text-ink hover:border-accent-text hover:text-accent-text",
  ghost: "text-ink-soft hover:text-ink",
};

interface CommonProps {
  variant?: Variant;
  icon?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

function TrailingIcon() {
  return (
    <ArrowUpRight
      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      aria-hidden="true"
    />
  );
}

export function Button({
  variant = "primary",
  icon = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (props.href) {
    const { href, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
        {icon ? <TrailingIcon /> : null}
      </a>
    );
  }

  return (
    <button
      // Defaults to "button". Without this an unqualified <button> is a
      // submit button, so dropping one inside the contact form would silently
      // submit it. Still overridable via props for genuine submit buttons.
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
      {icon ? <TrailingIcon /> : null}
    </button>
  );
}
