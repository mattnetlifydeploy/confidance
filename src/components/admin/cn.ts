// Tiny classnames joiner. Keeps the admin kit dependency-light (no clsx/tailwind-merge).
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
