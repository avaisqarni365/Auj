export type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — drops falsy values, joins the rest with spaces. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter((p): p is string | number => p !== false && p !== null && p !== undefined && p !== '').join(' ');
}
