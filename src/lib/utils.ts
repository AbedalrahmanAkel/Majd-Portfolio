import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes the *accent markers* used by `<AccentText>`. Needed anywhere a
 * marked string is consumed as plain text — OG images, metadata, alt text —
 * so the asterisks never leak into user-visible output.
 */
export function stripAccentMarkers(value: string) {
  return value.replace(/\*([^*]+)\*/g, "$1");
}
