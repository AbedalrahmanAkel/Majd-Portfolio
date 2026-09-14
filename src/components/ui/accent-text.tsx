import { Fragment } from "react";

/**
 * Renders a string where *asterisk-wrapped* words are set in the accent face
 * (Cormorant Garamond italic) instead of the surrounding display serif.
 *
 * The accent is deliberately rare — one word per headline at most. Its job is
 * to put a stress on the single word that carries the meaning, not to
 * decorate. Mark a word by wrapping it in asterisks in `site-config.ts` or
 * `content.ts`, e.g.:
 *
 *   headline: "Building brands, teams, and businesses that *perform*."
 *
 * Escaped as literal text if the asterisks are unbalanced, so ordinary copy
 * containing an asterisk still renders untouched.
 */
export function AccentText({ children }: { children: string }) {
  const segments = children.split(/(\*[^*]+\*)/g);

  return (
    <>
      {segments.map((segment, index) => {
        const isAccent =
          segment.length > 2 && segment.startsWith("*") && segment.endsWith("*");

        if (!isAccent) return <Fragment key={index}>{segment}</Fragment>;

        return (
          <em
            key={index}
            // `not-italic` is never right here — the accent face is loaded
            // italic-only, and the slant is the whole point of the contrast.
            className="font-accent font-normal italic"
          >
            {segment.slice(1, -1)}
          </em>
        );
      })}
    </>
  );
}
