# Technical Architecture Decisions

> **Brand**: Yummy Spot
> **Document Version**: 1.0.0
> **Status**: Production Architecture Record

This document records the key technical decisions made during the architecture phase,
with rationale so future engineers understand the *why* behind each choice.

---

## 1. Framework: Next.js App Router

**Decision**: Next.js 16 App Router with React 19, deployed to Cloudflare Workers through OpenNext.

**Rationale**:
- **Static-first pages.** Every storefront page is prerendered at build time and served as static content. Catalog data is fetched in the browser from Supabase, so there is no server cache or revalidation layer to run, and menu changes are visible on the next page load.
- **Server Components by default** keep display-only content free of client JavaScript; only interactive leaves (search, cart, order form, admin) are Client Components.
- **`cacheComponents` and `partialPrefetching` are deliberately off.** They hang the Cloudflare Workers runtime (verified in a local workerd test), and the site does not need them.
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
- Zod schemas validate environment variables and the order request (`lib/validation/order.ts`), which is shared by the order form and `/api/orders`. Database rows are mapped to typed `Product` objects in `lib/catalog.ts`.

---

## 7. SEO Architecture

**Decision**: Server-rendered JSON-LD + next/metadata API + dynamic OG images.

**Rationale**:
- JSON-LD structured data is rendered as Server Components (`lib/seo.tsx`), ensuring search crawler visibility without JavaScript execution.
- Next.js metadata API (`generateMetadata`) produces per-route `<title>`, `<meta>`, and OpenGraph tags from the same data fetch as the page content — no duplicate data fetching.
- Dynamic OG images (`opengraph-image.tsx`, Phase 7) are edge-rendered on demand with `next/og`, producing a product-specific 1200×630px social card from the product name and price.

---

## 8. Ordering Architecture: Order Requests (WhatsApp as fallback)

**Decision**: Customers send a multi-item **order request** from the website. Requests are stored in Supabase and managed by the owner in `/admin`. There is no payment gateway and no checkout.

**Rationale**:
- Sending customers straight into the owner's WhatsApp lets anyone spam it, and gives the owner no inbox, filters, or status tracking.
- A stored request can be validated, rate-limited, de-duplicated and priced by the database, and shown in one list.
- The owner still confirms availability, timing and the final price by phone or WhatsApp, started from the order screen, so nothing about the personal, home-kitchen feel is lost.
- Existing WhatsApp buttons stay as an optional contact route.

**Flow**: `Add to request` (browser) -> `/order` (Turnstile) -> `POST /api/orders` -> database function `create_order` -> `/admin/orders`. Details: `docs/PRODUCT_MODEL.md` section 6 and `docs/USER_FLOW.md`.

**Anti-spam layers**: Turnstile, hidden honeypot field, minimum fill time, request size limit, per-phone and per-IP-hash rate limits, 10-minute duplicate detection, an idempotency key, and an owner kill switch (`accepting_orders`).

---

## 9. Rendering Strategy

| Route Type | Strategy | Rationale |
| :--- | :--- | :--- |
| Homepage, `/menu`, `/order` | Static shell, client-side data | Catalog loaded from Supabase in the browser; always fresh, no cache to invalidate |
| `/admin/*` | Static shell, client-rendered | All data goes browser to Supabase under RLS; no Worker CPU |
| `/api/orders` | Dynamic (Worker) | Verifies Turnstile and calls `create_order` with the service role |
| `/api/admin/media/sign` | Dynamic (Worker) | Signs Cloudinary uploads for admins; keeps the API secret server-side |
| Metadata routes (sitemap, robots, manifest) | Static | No dynamic data |

---

## 10. Directory Architecture Principles

- **`config/`** is the single source of truth for all site-wide constants. Never hardcode brand URLs, phone numbers, or navigation items in components.
- **`lib/`** contains pure functions with no React dependencies — they are importable in Server Components, Client Components, API routes, and tests alike.
- **`components/ui/`** contains generic primitives with no business logic. They never import from `config/` or `lib/`.
- **`components/layout/`** contains structural components. They import from `config/navigation.ts` but never from CMS or API layers.
- **`types/`** contains TypeScript interfaces. Nothing in `types/` imports from components or config — it is the lowest layer of the dependency graph.

---

## 11. Final Free-First Architecture

```
                      +------------------------------------------+
   Customer / Owner   |  Cloudflare Workers Free (OpenNext)      |
   ---------------->  |  static pages + 2 API routes             |
                      +------------------+-----------------------+
                                         |
        +--------------------------------+-----------------------------+
        |                                |                             |
        v                                v                             v
+---------------+              +-------------------+          +----------------+
| Turnstile     |              | Supabase Free     |          | Cloudinary     |
| (spam check)  |              | PostgreSQL + Auth |          | Free (images)  |
+---------------+              | + Realtime, RLS   |          +----------------+
                               +-------------------+
```

| Decision | Choice | Why |
| :--- | :--- | :--- |
| Hosting | Cloudflare Workers Free | Free, global, supports Next.js through OpenNext |
| Data | Supabase PostgreSQL | Free tier, SQL constraints and RLS enforce rules in one place |
| Admin login | Supabase Auth | No custom auth to build or secure |
| Images | Cloudinary Free | Upload, resize and optimized delivery without running anything |
| CMS | Custom `/admin` | Smallest thing that does the job; no CMS product runs on the free Workers plan reliably |
| Caching | None on the server | Catalog fetched in the browser; nothing to invalidate |
| Extra Cloudflare products | None (no R2, D1, Durable Objects, Queues, Hyperdrive) | Not needed; each would add setup and cost risk |

Free-tier limits, risks and the list of features deliberately not added live in [`FREE_TIER_NOTES.md`](../FREE_TIER_NOTES.md).

---

*Architecture decisions are living documents. Update this file when significant technical decisions are made.*
