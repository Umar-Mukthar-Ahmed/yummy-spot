/**
 * Type Definitions — Site
 *
 * Core data types for site configuration, navigation, and
 * shared UI structures.
 */

/* ── Navigation ──────────────────────────────────────────────── */
export type NavItem = {
  label: string
  href: string
  external?: boolean
  badge?: string
  /** Used to match the currently active route segment */
  segment?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/* ── Theme ───────────────────────────────────────────────────── */
export type ThemeMode = "light" | "dark" | "system"

/* ── Site Config ─────────────────────────────────────────────── */
export type SiteConfig = {
  name: string
  tagline: string
  description: string
  url: string
  keywords: string[]
  whatsapp: {
    number: string
    defaultMessage: string
  }
  social: {
    instagram: string
    facebook: string
  }
  og: {
    width: number
    height: number
  }
}

/* ── Generic Page Props ──────────────────────────────────────── */
/**
 * Next.js 15+ page params are Promises.
 * Use this type for generateMetadata and page components.
 */
export type PageProps<
  TParams extends Record<string, string> = Record<string, string>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<TParams>
  searchParams: Promise<TSearchParams>
}
