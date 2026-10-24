/**
 * Navigation Configuration
 *
 * Centralised definition of all navigation structures.
 * Changing URLs or labels happens only here — no link rot.
 *
 * Category slugs are authoritative: they define the URL pattern
 * for /menu/[category] routes and must match CMS content slugs.
 */

/* ── Types ──────────────────────────────────────────────────── */
export type NavItem = {
  label: string
  href: string
  external?: boolean
  badge?: string
  /** Used to match the active route */
  segment?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/* ── Primary Navigation ─────────────────────────────────────── */
/** Rendered in the Navbar header. Keep this ≤ 6 items. */
export const primaryNav: NavItem[] = [
  { label: "Home",    href: "/",       segment: "" },
  { label: "Menu",    href: "/menu",   segment: "menu" },
  { label: "About",   href: "/about",  segment: "about" },
  { label: "Gallery", href: "/gallery",segment: "gallery" },
  { label: "Contact", href: "/contact",segment: "contact" },
]

/* ── Product Category Navigation ───────────────────────────── */
/**
 * The 10 core product categories.
 * slugs are the URL-safe identifiers — match CMS slugs exactly.
 * Add new categories here without touching any page files.
 */
export const categoryNav: NavItem[] = [
  { label: "Homemade Meals",            href: "/menu/homemade-meals",       segment: "homemade-meals" },
  { label: "Desserts & Sweets",         href: "/menu/desserts-sweets",      segment: "desserts-sweets" },
  { label: "Snacks & Savouries",        href: "/menu/snacks-savouries",     segment: "snacks-savouries" },
  { label: "Biryani & Mandi",           href: "/menu/biryani-mandi",        segment: "biryani-mandi" },
  { label: "Curries",                   href: "/menu/curries",              segment: "curries" },
  { label: "Traditional Wellness Foods",href: "/menu/wellness-foods",       segment: "wellness-foods" },
  { label: "Homemade Health Supplements",href:"/menu/health-supplements",   segment: "health-supplements" },
  { label: "Seasonal Specials",         href: "/menu/seasonal-specials",    segment: "seasonal-specials" },
  { label: "Festival Specials",         href: "/menu/festival-specials",    segment: "festival-specials" },
  { label: "Custom Orders",             href: "/custom-order",              segment: "custom-order" },
]

/* ── Footer Navigation ──────────────────────────────────────── */
export const footerNav: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Our Menu",      href: "/menu" },
      { label: "About Us",      href: "/about" },
      { label: "Gallery",       href: "/gallery" },
      { label: "Contact",       href: "/contact" },
      { label: "Custom Orders", href: "/custom-order" },
    ],
  },
  {
    label: "Categories",
    items: [
      { label: "Homemade Meals",  href: "/menu/homemade-meals" },
      { label: "Desserts",        href: "/menu/desserts-sweets" },
      { label: "Biryani & Mandi", href: "/menu/biryani-mandi" },
      { label: "Wellness Foods",  href: "/menu/wellness-foods" },
      { label: "Seasonal",        href: "/menu/seasonal-specials" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy Policy",   href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]
