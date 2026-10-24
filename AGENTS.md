# AGENTS.md — AI Agent Guidance for Yummy Spot

This file instructs AI coding agents (Antigravity, Copilot, Cursor, etc.) on how to
work with this codebase. Read this entire file before making any changes.

---

## Project Overview

**Yummy Spot** is a premium home-based food brand website.
- Customers browse products online and order via **WhatsApp** (no checkout flow).
- The owner manages content via a **headless CMS** (Phase 6, Payload CMS v3).
- This is **NOT** a restaurant — it is an artisanal home kitchen brand.

**Current Phase**: Phase 0 (architecture) and Phase 1 (information architecture) are complete.

---

## Non-Negotiable Rules

### 1. Mobile-First, Always
- Write CSS for 320px first, then layer up with `sm:`, `md:`, `lg:`, `xl:` variants.
- Never use fixed pixel widths that could overflow on mobile.
- All images MUST use `next/image` — never raw `<img>` tags.
- All interactive elements must have a minimum 44x44px touch target.

### 2. Tailwind CSS v4 CSS-First Architecture
- Design tokens live in `app/globals.css` inside `@theme inline {}`.
- **Never create a `tailwind.config.js` or `tailwind.config.ts`** — Tailwind v4 is CSS-first.
- Light theme variables are in `:root {}`. Dark theme variables are in `.dark {}`.
- Use semantic color tokens (`bg-background`, `text-foreground`, `text-primary`, etc.).
- Never hardcode hex/rgb colors directly in components — always use CSS variable tokens.

### 3. TypeScript Strict Mode
- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- No `any` types — use `unknown` and narrow with type guards.
- All async Server Component params are `Promise<{...}>` — always `await params`.
- Export named types alongside components when the type is reused elsewhere.

### 4. Server vs Client Components
- **Default to Server Components** — do NOT add `"use client"` unless absolutely required.
- Client Components are required when using: `useState`, `useEffect`, `useRef`, browser APIs, `next-themes`, `motion/react` animation directives.
- If only a small part of a component needs interactivity, extract it into a separate Client Component leaf.

### 5. Accessibility (WCAG 2.1 AA)
- Every interactive element must have an `aria-label` or visible text label.
- Use semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`.
- Focus rings must be visible in both light and dark mode.
- Use `role="status"` or `aria-live="polite"` for dynamic content updates.
- The skip-to-content link in `app/layout.tsx` must remain functional.

### 6. No Dummy Business Content
- Do not hardcode product names, prices, descriptions, or category descriptions.
- All business content comes from config files or (in Phase 6+) the CMS.
- Exception: placeholder text marked with `{/* Phase X: replace with CMS data */}` comments.

---

## Architecture Quick Reference

### Configuration Files
```
config/site.ts       — Brand identity, site URL, WhatsApp number, OG settings
config/navigation.ts — Primary nav, footer nav groups, 10 category slugs
config/metadata.ts   — Metadata factory for consistent OG/Twitter/canonical tags
config/theme.ts      — Theme config reference
```

### Key Utility Functions (`lib/utils.ts`)
```typescript
cn(...classes)                   // Merge Tailwind classes (clsx + tailwind-merge)
buildWhatsAppUrl(phone, message) // Build wa.me deep link
formatPrice(amount, currency?)   // Format price with currency symbol
slugify(text)                    // Convert text to URL slug
truncate(str, maxLength)         // Truncate text with ellipsis
debounce(fn, delay)              // Debounce a function
```

### Component Patterns

**Layout components** (always Server Components):
```
Container — horizontal constraint and gutters (size prop: sm/md/lg/xl/full)
Section   — vertical spacing wrapper (spacing prop: none/sm/md/lg/xl, as prop)
Navbar    — sticky header with logo, nav, theme toggle
Footer    — multi-column footer with nav groups
```

**UI Primitives** (Server Components unless noted):
```
Button  — 5 variants: primary, secondary, outline, ghost, destructive
Badge   — 7 variants: default, primary, accent, success, warning, destructive, outline
Card    — compound: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
Divider — horizontal/vertical separator with optional label
```

**Shared Components**:
```
Heading       — semantic h1-h6 with decoupled visual size; Fraunces serif by default
Text          — polymorphic (p/span/div/label/...) with size, variant, leading presets
Logo          — typographic brand mark; renders as Link or div (asDiv prop)
ThemeToggle   — [Client] light/dark mode switch with SSR skeleton
```

### The 10 Product Category Slugs
```
homemade-meals      desserts-sweets     snacks-savouries
biryani-mandi       curries             wellness-foods
health-supplements  seasonal-specials   festival-specials
custom-orders
```
Defined in `config/navigation.ts` as `productCategories`.

### WhatsApp Integration
```typescript
// Always use the utility from lib/utils.ts
const url = buildWhatsAppUrl(
  siteConfig.whatsapp.number,
  `*NEW ORDER*\n*Dish:* ${product.name}\n*Qty:* ${qty}`
)
// Generates: https://wa.me/{number}?text={url_encoded_message}
```

---

## Route Structure

```
app/
├── page.tsx                     → / (Homepage)
├── menu/
│   └── page.tsx                 → /menu (Categories, products, search, filters)
├── about/page.tsx               → /about
├── gallery/page.tsx             → /gallery
├── contact/page.tsx             → /contact
├── custom-order/page.tsx        → /custom-order
├── privacy/page.tsx             → /privacy
├── terms/page.tsx               → /terms
└── api/
    └── revalidate/route.ts      → ISR webhook (Phase 6)
```

**Dynamic route params are Promises** in Next.js App Router — always await:
```typescript
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // correct
}
```

---

## Adding a New Component

1. Choose the correct folder:
   - `components/layout/` — structural layout (full-page containers, wrappers)
   - `components/ui/` — reusable design system primitives
   - `components/shared/` — cross-cutting components used in multiple features
   - `components/[feature]/` — feature-specific (e.g., `components/menu/`)

2. Default to Server Component — add `"use client"` only if needed.

3. Use `cn()` from `lib/utils.ts` for conditional class merging.

4. Accept `className` prop and spread it last for composability.

5. Use semantic HTML elements, not `<div>` for everything.

6. Document with a JSDoc comment explaining purpose, `@example`, and `@phase` if future work.

---

## Responsive Design (Non-Negotiable)

Full spec: [`docs/RESPONSIVE_DESIGN.md`](./docs/RESPONSIVE_DESIGN.md)

Quick rules:
- Mobile-first: write base styles for 320px, enhance upward
- No horizontal overflow at any breakpoint
- All images: `next/image` with explicit `width`, `height`, and `sizes`
- Touch targets: 44x44px minimum
- Typography: fluid `clamp()` values via `--text-*` tokens in `globals.css`
- Test in BOTH light and dark mode before marking done
- Test at: 320px, 375px, 390px, 768px, 1024px, 1440px, 1920px

---

## Current Phase Status

| Phase | Status | Description |
| :---: | :--- | :--- |
| 0 | Complete | Repository and architecture foundation |
| 1 | Complete | Information architecture and content model |
| 2 | Next | Core UI foundation (mobile nav drawer, WhatsApp CTA, skeletons) |
| 3 | Planned | Marketing homepage |
| 4 | Planned | Menu and product catalog hub |
| 5 | Planned | Secondary and editorial pages |
| 6 | Planned | Headless CMS integration (Payload CMS v3) |
| 7 | Planned | SEO, social graph and Core Web Vitals |
| 8 | Planned | Analytics and event tracking |
| 9 | Planned | PWA and mobile enhancements |

Full roadmap: [`docs/ROADMAP.md`](./docs/ROADMAP.md)
