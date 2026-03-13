/**
 * Tailwind CSS class merge utility.
 * Combines class names and resolves conflicts.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
