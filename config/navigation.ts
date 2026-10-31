/**
 * Navigation Configuration
 *
 * Centralised definition of all navigation structures.
 * Changing URLs or labels happens only here — no link rot.
 *
 * Category slugs are authoritative: they define Menu query parameters
 * and must match the slugs seeded in supabase/seed.sql.
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

/* ── Planned routes ─────────────────────────────────────────── */
/**
 * Routes that are designed but not built yet. Links to them are hidden from the header,
 * mobile menu and footer, and they are left out of the sitemap, so visitors never hit a 404.
 * When a page is built, delete its path here and its links appear everywhere.
 */
export const plannedRoutes: ReadonlySet<string> = new Set([
  "/about",
  "/gallery",
  "/contact",
  "/custom-order",
  "/privacy",
  "/terms",
])

const isLive = (item: NavItem) => !plannedRoutes.has(item.href)

/* ── Primary Navigation ─────────────────────────────────────── */
/** Rendered in the Navbar header. Keep this ≤ 6 items. */
export const primaryNav: NavItem[] = [
  { label: "Home",    href: "/",       segment: "" },
  { label: "Menu",    href: "/menu",   segment: "menu" },
  { label: "About",   href: "/about",  segment: "about" },
  { label: "Gallery", href: "/gallery",segment: "gallery" },
  { label: "Contact", href: "/contact",segment: "contact" },
].filter(isLive)

/* ── Product Category Navigation ───────────────────────────── */
/**
 * The 10 core product categories.
 * slugs are the URL-safe identifiers — match CMS slugs exactly.
 * Add new categories here without touching any page files.
 */
export const categoryNav: NavItem[] = [
  { label: "Homemade Meals",             href: "/menu?category=homemade-meals",        segment: "homemade-meals" },
  { label: "Desserts & Sweets",          href: "/menu?category=desserts-sweets",       segment: "desserts-sweets" },
  { label: "Snacks & Savouries",         href: "/menu?category=snacks-savouries",      segment: "snacks-savouries" },
  { label: "Biryani & Mandi",            href: "/menu?category=biryani-mandi",         segment: "biryani-mandi" },
  { label: "Curries",                    href: "/menu?category=curries",               segment: "curries" },
  { label: "Traditional Wellness Foods", href: "/menu?category=wellness-foods",        segment: "wellness-foods" },
  { label: "Homemade Health Supplements",href: "/menu?category=health-supplements",    segment: "health-supplements" },
  { label: "Seasonal Specials",          href: "/menu?category=seasonal-specials",     segment: "seasonal-specials" },
  { label: "Festival Specials",          href: "/menu?category=festival-specials",     segment: "festival-specials" },
  { label: "Custom Orders",              href: "/menu?category=custom-orders",          segment: "custom-orders" },
]

/* ── Footer Navigation ──────────────────────────────────────── */
const footerGroups: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Our Menu",      href: "/menu" },
      { label: "Your Order Request", href: "/order" },
      { label: "About Us",      href: "/about" },
      { label: "Gallery",       href: "/gallery" },
      { label: "Contact",       href: "/contact" },
      { label: "Custom Orders", href: "/custom-order" },
    ],
  },
  {
    label: "Categories",
    items: [
      { label: "Homemade Meals",  href: "/menu?category=homemade-meals" },
      { label: "Desserts",        href: "/menu?category=desserts-sweets" },
      { label: "Biryani & Mandi", href: "/menu?category=biryani-mandi" },
      { label: "Wellness Foods",  href: "/menu?category=wellness-foods" },
      { label: "Seasonal",        href: "/menu?category=seasonal-specials" },
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

/** Footer groups without links to planned pages; empty groups are dropped. */
export const footerNav: NavGroup[] = footerGroups
  .map((group) => ({ ...group, items: group.items.filter(isLive) }))
  .filter((group) => group.items.length > 0)
