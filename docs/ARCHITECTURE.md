# Technical Architecture Decisions

> **Brand**: Yummy Spot
> **Document Version**: 1.0.0
> **Status**: Production Architecture Record

This document records the key technical decisions made during the architecture phase,
with rationale so future engineers understand the *why* behind each choice.

---

## 1. Framework: Next.js App Router

**Decision**: Next.js 15 App Router with React 19 Server Components.

**Rationale**:
- **ISR (Incremental Static Regeneration)** allows pages to be served as static HTML from the CDN edge, then revalidated on demand when the CMS publishes. This is the only approach that achieves sub-100ms TTFB for a food ordering site without building a custom caching layer.
- **Server Components** eliminate the hydration cost of product description and ingredient lists — the most content-heavy parts of the page — shipping zero JavaScript for purely display content.
- **`generateStaticParams()`** pre-renders all known product and category pages at build time, giving instant page loads for the most trafficked product URLs.
- **App Router file conventions** (`loading.tsx`, `error.tsx`, `not-found.tsx`) provide progressive streaming and error recovery without custom wrapper components.

---

## 2. Styling: Tailwind CSS v4 CSS-First

**Decision**: Tailwind v4 with `@theme inline {}` in `globals.css` — no `tailwind.config.js`.

**Rationale**:
- Tailwind v4's CSS-first architecture maps design tokens directly to CSS custom properties (`var(--color-primary)`), enabling runtime theme switching without CSS recompilation.
- `@theme inline {}` causes Tailwind to emit `var()` references instead of static values, so toggling `.dark` on `<html>` instantly applies the full dark theme — zero JavaScript dependency.
- All tokens live in one file (`globals.css`) rather than split across a JS config and CSS variables, making them easier to maintain and audit.
- Fluid typography tokens use `clamp()` natively inside `@theme`, meaning Tailwind's `text-3xl` class scales between breakpoints automatically.

---

## 3. Font Strategy: next/font/google

**Decision**: Fraunces (serif, headings) + Manrope (sans-serif, body) via `next/font/google`.

**Rationale**:
- `next/font/google` eliminates external font network requests — fonts are self-hosted, zero-layout-shift (`display: swap`), and preloaded automatically.
- **Fraunces** (editorial serif) communicates premium, handmade, trustworthy — matching the brand personality. Serif headings on warm off-white recall quality print/editorial aesthetics (inspiration: Misu Dessert, Atlas Bakery).
- **Manrope** (geometric sans) provides excellent legibility at small sizes for ingredient lists, pricing, and mobile navigation.
- Both fonts are exposed as CSS variables (`--font-fraunces`, `--font-manrope`) mapped in `@theme inline` so `font-serif` and `font-sans` Tailwind utilities resolve to the correct faces.

---

## 4. Theme System: next-themes

**Decision**: `next-themes` with `ThemeProvider` and `attribute="class"`.

**Rationale**:
- next-themes adds the `dark` class to `<html>` based on localStorage preference and system `prefers-color-scheme`, with zero flash-of-unstyled-content (via `suppressHydrationWarning`).
- Components that need the current theme value (`ThemeToggle`) are isolated Client Components. Everything else remains a Server Component.
- The SSR skeleton pattern in `ThemeToggle` (rendering a blank `<div>` until mounted) prevents hydration mismatches from the localStorage read.

---

## 5. Animation: Motion (`motion/react`)

**Decision**: Motion v12 (`motion` package, imported from `"motion/react"`).

**Rationale**:
- Motion is the spiritual successor to Framer Motion with the same API, now decoupled from Framer's design tool.
- Animation presets are defined in `constants/animation.ts` (easing curves, duration scales, variant factories) so all motion across the site shares the same feel without ad-hoc values.
- `@media (prefers-reduced-motion: reduce)` is handled globally in `globals.css`, disabling all transitions for users who opt out.

---

## 6. Type Safety: Zod + TypeScript Strict

**Decision**: TypeScript strict mode + Zod v4 for runtime validation.

**Rationale**:
- `strict: true` alone is insufficient — `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` catch entire classes of bugs (array index out of bounds, missing optional property checks).
- Zod validates environment variables at startup (`lib/env.ts`) so misconfigured deployments fail immediately with a clear error, not a cryptic runtime crash.
- Zod schemas for the Product and Category data models (in `docs/PRODUCT_MODEL.md`) will serve as the source of truth for CMS data validation in Phase 6, ensuring type safety from CMS response through React component props.

---

## 7. SEO Architecture

**Decision**: Server-rendered JSON-LD + next/metadata API + dynamic OG images.

**Rationale**:
- JSON-LD structured data is rendered as Server Components (`lib/seo.tsx`), ensuring search crawler visibility without JavaScript execution.
- Next.js metadata API (`generateMetadata`) produces per-route `<title>`, `<meta>`, and OpenGraph tags from the same data fetch as the page content — no duplicate data fetching.
- Dynamic OG images (`opengraph-image.tsx`, Phase 7) are edge-rendered on demand with `next/og`, producing a product-specific 1200×630px social card from the product name and price.

---

## 8. WhatsApp Commerce Architecture

**Decision**: Deep-link based ordering via `https://wa.me/{phone}?text={encoded_message}`.

**Rationale**:
- Eliminates the complexity, liability, and maintenance cost of a payment gateway, checkout flow, and order management system.
- The kitchen owner can start taking orders on day one without any backend setup.
- Pre-populated message templates (`buildWhatsAppUrl()` in `lib/utils.ts`) reduce customer friction to a single tap.
- This model scales naturally until order volume justifies a proper OMS — at which point, the WhatsApp CTA is replaced with a checkout flow without changing the product display pages.

---

## 9. Rendering Strategy

| Route Type | Strategy | Rationale |
| :--- | :--- | :--- |
| Homepage | ISR (revalidate: 3600) | Changes often for banners/specials, but not per-request |
| Category pages | ISR (revalidate: 86400) + on-demand | Product availability changes; ISR + webhook covers both |
| Product pages | ISR (revalidate: 86400) + on-demand | Same as category |
| About, Contact | Pure SSG | Never changes without a code deploy |
| Custom Order | SSG shell + client form | UI is static; form is interactive |
| API routes | Dynamic | Webhook handlers must be real-time |

---

## 10. Directory Architecture Principles

- **`config/`** is the single source of truth for all site-wide constants. Never hardcode brand URLs, phone numbers, or navigation items in components.
- **`lib/`** contains pure functions with no React dependencies — they are importable in Server Components, Client Components, API routes, and tests alike.
- **`components/ui/`** contains generic primitives with no business logic. They never import from `config/` or `lib/`.
- **`components/layout/`** contains structural components. They import from `config/navigation.ts` but never from CMS or API layers.
- **`types/`** contains TypeScript interfaces. Nothing in `types/` imports from components or config — it is the lowest layer of the dependency graph.

---

*Architecture decisions are living documents. Update this file when significant technical decisions are made.*
