# AGENTS.md — AI Agent Guidance for Yummy Spot

This file instructs AI coding agents (Copilot, Cursor, etc.) on how to work with this codebase. Read this entire file before making any changes.

---

## Project Overview

**Yummy Spot** is a premium home-based food brand website.
- Customers browse the menu and send a **multi-item order request** from the website. Requests are stored in Supabase and the owner works through them in the custom **`/admin`** area.
- There is **no payment gateway and no checkout**. The owner confirms availability, timing and the final price with the customer, then replies (optionally on WhatsApp).
- WhatsApp buttons (hero, mobile nav, closing banner) remain as an optional fallback contact. The order flow does **not** depend on WhatsApp.
- Content (categories, products, settings, images) is managed by the owner in `/admin`. There is **no Payload and no third-party CMS**.
- This is **NOT** a restaurant — it is an artisanal home kitchen brand.

**Operating cost target: free.** The only paid item is the domain name. Read [`FREE_TIER_NOTES.md`](./FREE_TIER_NOTES.md) before proposing any new service.

---

## Architecture at a Glance

```
Browser ──► Cloudflare Workers Free (Next.js via OpenNext)
              ├─ static pages (/, /menu, /order, /admin/*)
              ├─ POST /api/orders              Turnstile + Zod + honeypot ──► rpc create_order
              └─ POST /api/admin/media/sign    admin check ──► Cloudinary upload signature
Browser ──► Supabase (anon key, protected by RLS): catalog reads, admin CRUD, Auth, Realtime
Browser ──► Cloudinary: signed direct uploads (admin) and image delivery (everyone)
```

| Concern | Choice | Where it lives |
| :--- | :--- | :--- |
| Hosting | Cloudflare Workers **Free** via `@opennextjs/cloudflare` | `open-next.config.ts`, `wrangler.jsonc` |
| Database + admin login | Supabase **Free** (PostgreSQL, Auth, Realtime) | `supabase/migrations`, `lib/supabase/*` |
| Images | Cloudinary **Free** | `lib/media*.ts`, `components/shared/media-image.tsx` |
| Spam protection | Cloudflare Turnstile | `components/order/turnstile.tsx`, `app/api/orders/route.ts` |
| Admin | Custom client-rendered `/admin`, talks to Supabase under RLS | `components/admin/*`, `app/admin/*` |

### Hard rules for this architecture

1. **Free first, simple first.** Do not add paid services, paid plans or billing details. Before adding any Cloudflare product (R2, D1, Durable Objects, Queues, Hyperdrive, Cron, KV) or any optional feature, write down why the current design cannot work and get approval.
2. **Keep `cacheComponents` and `partialPrefetching` off** in `next.config.ts`. They hang the Workers runtime (verified). No `use cache`, no ISR tag revalidation.
3. **The catalog is fetched in the browser** from Supabase (`lib/catalog.ts`, `hooks/use-catalog.ts`). Do not add server-side data fetching that needs a cache layer.
4. **Secrets never reach the client.**
   - Public (`NEXT_PUBLIC_*`): Supabase URL and anon key, Turnstile site key, Cloudinary cloud name, country code, WhatsApp number, social URLs.
   - Secret (server only): `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, optional Telegram values.
   - Server code reads secrets through `lib/server-env.ts` (`import "server-only"`). Never import it from a client component.
5. **All images go through `lib/media.ts` / `MediaImage`.** Only `lib/media.ts`, `lib/media-server.ts`, `lib/media-upload.ts` and `components/shared/media-image.tsx` may know about Cloudinary, so the provider stays replaceable. The database stores media asset objects (`provider`, `publicId`, `url`, `alt`, `width`, `height`), not bare URLs.
6. **Orders are only created by the database function `create_order`**, called from `/api/orders` with the service role. Prices, availability, lead times, duplicate detection and rate limits are enforced there, never trusted from the browser. Never grant `anon` or `authenticated` write access to `orders`, `order_items` or `order_events`.
7. **Admin security is Supabase RLS**, not the client-side gate. Any new admin table needs RLS policies using `public.is_admin()`. Any new API route that needs an admin must verify it with `lib/admin-auth.ts`.
8. **Database changes go in new migration files** in `supabase/migrations`. Run the SQL checks in `supabase/tests` (instructions at the top of `00_stubs.sql`) after changing policies, triggers or `create_order`, and add a check for any new rule.

---

## Non-Negotiable Rules

### 1. Mobile-First, Always
- Write CSS for 320px first, then layer up with `sm:`, `md:`, `lg:`, `xl:` variants.
- Never use fixed pixel widths that could overflow on mobile.
- All images MUST use `next/image` (directly or through `MediaImage`) — never raw `<img>` tags.
- All interactive elements must have a minimum 44x44px touch target.

### 2. Tailwind CSS v4 CSS-First Architecture
- Design tokens live in `app/globals.css` inside `@theme inline {}`.
- **Never create a `tailwind.config.js` or `tailwind.config.ts`** — Tailwind v4 is CSS-first.
- Light theme variables are in `:root {}`. Dark theme variables are in `.dark {}`.
- Use semantic color tokens (`bg-background`, `text-foreground`, `text-primary`, etc.).
- Never hardcode hex/rgb colors directly in components — always use CSS variable tokens.
- Do not change the visual design unless asked.

### 3. TypeScript Strict Mode
- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- No `any` types — use `unknown` and narrow with type guards.
- All async Server Component params are `Promise<{...}>` — always `await params`.
- Export named types alongside components when the type is reused elsewhere.

### 4. Server vs Client Components
- **Default to Server Components** — do NOT add `"use client"` unless absolutely required.
- Client Components are required for: `useState`, `useEffect`, `useRef`, browser APIs, `next-themes`, `motion/react`, Supabase browser calls, the order cart.
- If only a small part of a component needs interactivity, extract it into a separate Client Component leaf.

### 5. Accessibility (WCAG 2.1 AA)
- Every interactive element must have an `aria-label` or visible text label.
- Use semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`.
- Focus rings must be visible in both light and dark mode.
- Use `role="status"`, `role="alert"` or `aria-live="polite"` for dynamic content updates.
- The skip-to-content link in `app/layout.tsx` must remain functional.

### 6. No Invented Business Content
- Do not hardcode product names, prices, descriptions, or category descriptions.
- Business content comes from the Supabase database (managed in `/admin`) or from `config/`. The 10 category names and slugs are seeded from `supabase/seed.sql` and mirror `config/navigation.ts`.
- Do not invent contact details, opening hours, delivery areas or testimonials. Placeholder UI is acceptable until the owner enters real data.

---

## Quick Reference

### Configuration Files
```
config/site.ts       — Brand identity, site URL, WhatsApp number (fallback contact), OG settings
config/navigation.ts — Primary nav, footer nav groups, category slugs (mirrors supabase/seed.sql)
config/metadata.ts   — Metadata factory for consistent OG/Twitter/canonical tags
config/theme.ts      — Theme config reference
lib/env.ts           — Validated public env vars (client-safe)
lib/server-env.ts    — Server-only secrets (never import from client code)
.env.example         — Every environment variable, marked public or secret
```

### Key Utilities
```typescript
cn(...classes)                   // lib/utils.ts: merge Tailwind classes
formatPrice(amount, currency?)   // lib/utils.ts
slugify(text)                    // lib/utils.ts
buildWhatsAppUrl(phone, message) // lib/utils.ts: wa.me link (fallback contact; owner replies in /admin)
loadCatalog() / useCatalog()     // lib/catalog.ts, hooks/use-catalog.ts: published categories + products
mediaUrl() / cloudinaryUrl()     // lib/media.ts: the only place that builds image URLs
orderRequestSchema               // lib/validation/order.ts: shared by the form and /api/orders
```

### Component Patterns
- `components/layout/` — structural (Navbar, Footer, Container, Section, `SiteChrome` hides the storefront chrome on `/admin`).
- `components/ui/` — design-system primitives with no business logic.
- `components/shared/` — cross-cutting (Heading, Text, Logo, ThemeToggle, MediaImage).
- `components/menu/`, `components/home/`, `components/order/` — storefront features.
- `components/admin/` — custom admin (all client components under `AdminShell`).

### Ordering Flow (what the code does)
1. Customer taps **Add to request** on a dish (`AddToRequest`); the request lives in `localStorage` (`RequestProvider`).
2. `/order` shows the items and a details form, plus a Turnstile widget.
3. `POST /api/orders` validates (Zod), checks honeypot + minimum fill time, verifies Turnstile, then calls `create_order`.
4. The order appears in `/admin/orders` (live via Realtime). The owner changes status (only valid transitions, enforced by a database trigger) and can message the customer on WhatsApp from the order screen.

### WhatsApp
WhatsApp is **not** the checkout. It is (a) an optional contact button for visitors, and (b) a convenience link in the admin for the owner to message a customer. Use `buildWhatsAppUrl()` for both.

---

## Route Structure

```
app/
├── page.tsx                       → / (Homepage)
├── menu/page.tsx                  → /menu (catalog from Supabase, search, filters, Add to request)
├── order/page.tsx                 → /order (multi-item order request, noindex)
├── admin/                         → /admin/* (noindex, client-rendered, Supabase Auth)
│   ├── login/page.tsx
│   ├── orders/page.tsx
│   ├── products/page.tsx
│   ├── categories/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── orders/route.ts            → POST create an order request
│   └── admin/media/sign/route.ts  → POST Cloudinary upload signature (admin only)
├── about, gallery, contact, custom-order, privacy, terms   → planned, not built yet
```

**Planned pages are hidden, not linked.** `config/navigation.ts` has a `plannedRoutes` set. Header, mobile nav, footer and `app/sitemap.ts` skip those paths. When you build one of these pages, remove it from `plannedRoutes` and it appears everywhere. Privacy and Terms must exist before launch because the order form collects phone numbers and addresses.

**Production never shows made-up content.** Dishes without a photo get a neutral block (`MediaImage` has no stock fallback). If the catalog cannot load, `/menu` shows an unavailable message with the WhatsApp button. Testimonials and the Instagram column on the home page are placeholders and render only when `NODE_ENV !== "production"`.

**CSS cascade.** Global element styles in `globals.css` live inside `@layer base`. Do not put them outside a layer, or they override Tailwind utilities. The body uses `overflow-x: clip` (not `hidden`) so sticky headers keep working.

**Dynamic route params are Promises** in Next.js App Router — always await them.

---

## Adding a New Component

1. Choose the correct folder (layout / ui / shared / feature).
2. Default to Server Component — add `"use client"` only if needed.
3. Use `cn()` for conditional class merging; accept `className` and spread it last.
4. Use semantic HTML elements.
5. Write a one-line JSDoc comment explaining purpose.

---

## Responsive Design (Non-Negotiable)

Full spec: [`docs/RESPONSIVE_DESIGN.md`](./docs/RESPONSIVE_DESIGN.md)

- Mobile-first: base styles for 320px, enhance upward.
- No horizontal overflow at any breakpoint.
- Touch targets: 44x44px minimum.
- Typography: fluid `clamp()` values via `--text-*` tokens in `globals.css`.
- Test in BOTH light and dark mode.
- Test at: 320px, 375px, 390px, 768px, 1024px, 1440px, 1920px.

---

## Commands

```
npm run dev          Next.js dev server (uses .env.local)
npm run lint         ESLint
npm run build        Next.js production build
npm run cf:preview   OpenNext build + local workerd preview (uses .dev.vars)
npm run cf:deploy    OpenNext build + deploy to Cloudflare (do not run until the end-to-end test passes)
```

On Windows, run the OpenNext binary from `node_modules\.bin` (the scripts do this). Local workerd only accepts a `compatibility_date` up to yesterday.

---

## Current Phase Status

| Phase | Status | Description |
| :---: | :--- | :--- |
| 0 | Complete | Repository and architecture foundation |
| 1 | Complete | Information architecture and content model |
| 2 | Complete | Core UI foundation (nav drawer, WhatsApp CTA, skeletons) |
| 3 | Complete | Marketing homepage (data-driven featured dishes) |
| 4 | Complete | Menu, catalog from Supabase, multi-item order request |
| 5 | Planned | Secondary pages (about, gallery, contact, custom order, legal) |
| 6 | Built, awaiting first real end-to-end test | Supabase schema, custom admin, Cloudinary media, Turnstile, Cloudflare deployment config |
| 7 | Planned | SEO, social graph and Core Web Vitals |
| 8 | Planned | Analytics (free, privacy-friendly option only) |
| 9 | Planned | PWA and mobile enhancements |

Optional features not yet added by decision: admin TOTP, order alerts, backups, keep-alive. See `FREE_TIER_NOTES.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
