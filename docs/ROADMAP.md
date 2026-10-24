# Master Product & Engineering Roadmap

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Status**: Active Engineering Roadmap

---

## 1. Roadmap Overview

```
+-------------------------------------------------------------------------------------------+
|                          DELIVERY TIMELINE & PHASE PROGRESSION                            |
|                                                                                           |
| [P0] Repo & Architecture  ✅ COMPLETED                                                    |
| [P1] Info Architecture    ✅ COMPLETED (Current Milestone)                               |
| [P2] Core UI Foundation ──► [P3] Homepage ──► [P4] Menu & Catalog ──► [P5] Secondary     |
|                                                                          │                |
|                                                                          ▼                |
| [P9] PWA & Mobile  ◄──  [P8] Analytics  ◄──  [P7] SEO & Perf  ◄──  [P6] CMS Integration |
|                                                                                           |
| [*] Tech Debt & Ongoing Hardening                                                         |
+-------------------------------------------------------------------------------------------+
```

**Estimation Legend**: S = 1-2 days · M = 3-5 days · L = 6-10 days (1 sprint) · XL = 11-20 days

---

## 2. Non-Negotiable Engineering Standards

The following requirements apply to **every phase** and every component built:

### Responsive Design Requirements (MANDATORY)
- **Mobile-first development** — build for mobile first, then enhance for larger screens.
- Every page must be **fully responsive** with zero horizontal scrolling.
- **Test breakpoints**: 320px, 375px, 390px, 768px, 1024px, 1440px, 1920px.
- **Touch-friendly interactions** — minimum 44px touch targets, no hover-only UI.
- **Responsive typography** using `clamp()` for fluid scaling.
- **Responsive spacing** using design tokens from `globals.css`.
- All images must use **`next/image`** (automatic AVIF/WebP + responsive sizing).
- Navigation must **adapt elegantly for mobile** (hamburger → drawer).
- Maintain **visual consistency** across both dark and light themes.
- Every feature must be **tested on both mobile and desktop** before marking complete.

See [`RESPONSIVE_DESIGN.md`](./RESPONSIVE_DESIGN.md) for detailed implementation spec.

---

## 3. Phase Specifications

---

### Phase 0: Repository & Architecture Foundation ✅
- **Status**: Completed · **Effort**: M · **Dependencies**: None
- **Key Deliverables**:
  - Next.js App Router, React 19, Tailwind CSS v4, TypeScript strict mode
  - Design system (`globals.css`): `@theme inline` CSS variables, light/dark themes
  - Component primitives: Button, Badge, Card, Divider, Heading, Text, Logo, ThemeToggle
  - Layout components: Navbar, Footer, Container, Section
  - Providers: ThemeProvider (next-themes), root composition (`providers/index.tsx`)
  - Hooks: `useMounted`, `useMediaQuery`
  - App routes: `sitemap.ts`, `robots.ts`, `manifest.ts`, `not-found.tsx`, `error.tsx`, `loading.tsx`
  - Utilities: `lib/utils.ts` (cn, buildWhatsAppUrl, formatPrice, slugify), `lib/env.ts`, `lib/seo.tsx`
  - Constants: `constants/animation.ts`, `constants/breakpoints.ts`, `constants/colors.ts`
  - Types: `types/site.ts`, `types/seo.ts`
  - Config: `config/site.ts`, `config/navigation.ts`, `config/metadata.ts`, `config/theme.ts`
  - Dev tooling: ESLint flat config, Prettier + prettier-plugin-tailwindcss, `.env.example`

---

### Phase 1: Information Architecture & Domain Modeling ✅
- **Status**: Completed · **Effort**: M · **Dependencies**: Phase 0
- **Key Deliverables**:
  - [`CONTENT_ARCHITECTURE.md`](./CONTENT_ARCHITECTURE.md) — content hierarchy, navigation structure, search
  - [`PRODUCT_MODEL.md`](./PRODUCT_MODEL.md) — TypeScript interfaces, Zod schemas, data relationships
  - [`CMS_PLAN.md`](./CMS_PLAN.md) — CMS evaluation → Payload CMS v3, owner workflows, ISR revalidation
  - [`SITE_MAP.md`](./SITE_MAP.md) — URL tree, dynamic routes, rendering strategy, 10 category slugs
  - [`SEO_PLAN.md`](./SEO_PLAN.md) — keyword taxonomy, JSON-LD schemas, dynamic OG, Core Web Vitals targets
  - [`USER_FLOW.md`](./USER_FLOW.md) — customer journeys, WhatsApp templates, friction solutions, WCAG flows
  - [`RESPONSIVE_DESIGN.md`](./RESPONSIVE_DESIGN.md) — responsive implementation spec
  - [`ROADMAP.md`](./ROADMAP.md) — this document

---

### Phase 2: Core UI Foundation & Design System
- **Status**: Ready for Execution · **Effort**: L · **Dependencies**: Phase 0, Phase 1
- **Responsive Requirement**: All components must pass at 320px minimum width.
- **Key Deliverables**:
  - Fluid typography via `clamp()` for all heading sizes
  - Mobile slide-out navigation drawer (Motion animated, focus-trapped, touch gesture support)
  - WhatsApp CTA Button variant (high-contrast emerald green, `min-h-[44px]`)
  - Dietary badge set: Halal, Pure Veg, Sugar-Free, No Preservatives
  - Skeleton/loading placeholder components
  - Rich footer with social icons and culinary hygiene notices
  - `<Breadcrumb />` component for category/product pages
  - `<AnnouncementBanner />` global dismissible banner
  - All interactive elements: minimum 44×44px touch targets

---

### Phase 3: Marketing Homepage
- **Status**: Planned · **Effort**: L · **Dependencies**: Phase 2
- **Responsive Requirement**: Hero must be stunning at 320px AND 1920px.
- **Key Deliverables**:
  - Hero Section: headline (fluid clamp type), food montage, trust badges, CTA
  - Announcement Banner: dismissible top bar with responsive collapse
  - Featured Categories Shelf: grid → carousel on mobile
  - Chef's Special / Bestsellers: horizontal scroll snap on mobile
  - Kitchen Heritage Section: responsive two-column → stacked
  - Customer Testimonials Grid: 3-col → 1-col on mobile
  - Seasonal Promo Banner: full-width, responsive typography

---

### Phase 4: Menu & Product Catalog Hub
- **Status**: Planned · **Effort**: XL · **Dependencies**: Phase 2, Phase 3
- **Responsive Requirement**: Product grid 1-col (mobile) → 2-col (tablet) → 3-col (desktop).
- **Key Deliverables**:
  - Menu Hub (`/menu`): category grid, search bar, dietary filter chips
  - Category Showcase: dynamic ISR, responsive product card grid, filter sidebar → bottom sheet on mobile
  - Client-Side Fuzzy Search: 150ms debounced, mobile keyboard-aware
  - Product Detail Page: swipe-able image gallery on mobile, sticky bottom order bar
  - `generateStaticParams()` for all known products at build time
  - All product images: `next/image` with responsive `sizes` prop

---

### Phase 5: Secondary & Editorial Pages
- **Status**: Planned · **Effort**: M · **Dependencies**: Phase 2, Phase 4
- **Key Deliverables**:
  - About (`/about`): responsive editorial layout, founder story
  - Gallery (`/gallery`): CSS masonry grid → single column on mobile
  - Custom Order (`/custom-order`): multi-step form, touch-optimized inputs
  - Contact (`/contact`): WhatsApp CTA, responsive delivery zone map
  - Privacy & Terms: readable line-length (`max-w-prose`) on all viewports

---

### Phase 6: Headless CMS Integration
- **Status**: Planned · **Effort**: XL · **Dependencies**: Phase 4, Phase 5
- **Key Deliverables**:
  - Payload CMS v3 at `/admin` (embedded in Next.js App Router)
  - PostgreSQL / Supabase + Cloudflare R2 media storage
  - Content schemas: Products, Categories, Gallery, Reviews, Banners, Site Settings
  - Webhook endpoint (`/api/revalidate`) for on-demand ISR cache invalidation
  - Media pipeline: auto WebP/AVIF + responsive thumbnails
  - Owner onboarding: 2-page laminated guide + mobile PWA shortcut

---

### Phase 7: SEO, Social Graph & Web Vitals
- **Status**: Planned · **Effort**: M · **Dependencies**: Phase 4, Phase 6
- **Key Deliverables**:
  - JSON-LD injection: LocalBusiness, Product, BreadcrumbList, ItemList, Organization
  - Edge-rendered dynamic OG cards per product (`opengraph-image.tsx`)
  - Dynamic sitemap with all CMS products and categories
  - Core Web Vitals targets: LCP < 1.8s, CLS < 0.05, INP < 150ms, TTFB < 150ms
  - Lighthouse audit: 95+ across all four categories

---

### Phase 8: Analytics & Event Tracking
- **Status**: Planned · **Effort**: S · **Dependencies**: Phase 4, Phase 7
- **Key Deliverables**:
  - Privacy-compliant analytics (Plausible / Umami / GA4)
  - Custom events: `click_whatsapp_order`, `custom_order_submitted`, `category_filter_selected`, `search_query_executed`
  - Real User Monitoring (RUM) for Core Web Vitals in production
  - Error monitoring via Sentry (integrate in `app/error.tsx`)

---

### Phase 9: Progressive Web App (PWA) & Mobile
- **Status**: Planned · **Effort**: M · **Dependencies**: Phase 3, Phase 7
- **Key Deliverables**:
  - Service worker: asset caching + offline fallback page
  - "Add to Home Screen" install banner for repeat visitors
  - PWA icons: 192px maskable, 512px any
  - iOS standalone optimizations: status bar theming, full-screen viewport safeguards

---

### Ongoing: Technical Debt & Security
- Bi-weekly `npm audit` dependency security scanning
- Regular WCAG 2.1 AA accessibility regressions (Axe-core CLI)
- Next.js and React framework version upgrades
- Seasonal menu archival and database index optimization

---

## 4. Master Deliverables Matrix

| Phase | Title | Effort | Risk | Status |
| :---: | :--- | :---: | :---: | :--- |
| **0** | Repo & Architecture Foundation | M | Low | ✅ Complete |
| **1** | Information Architecture | M | Low | ✅ Complete |
| **2** | Core UI Foundation & Design System | L | Low | ⬜ Planned |
| **3** | Marketing Homepage | L | Medium | ⬜ Planned |
| **4** | Menu & Product Catalog Hub | XL | Medium | ⬜ Planned |
| **5** | Secondary & Editorial Pages | M | Low | ⬜ Planned |
| **6** | Headless CMS Integration | XL | High | ⬜ Planned |
| **7** | SEO, Social Graph & Web Vitals | M | Low | ⬜ Planned |
| **8** | Analytics & Event Tracking | S | Low | ⬜ Planned |
| **9** | PWA & Mobile Enhancements | M | Low | ⬜ Planned |
| **\*** | Tech Debt & Ongoing Hardening | — | — | ♻️ Continuous |

---

*This roadmap is the definitive multi-phase guide for engineering, product, and operational delivery for Yummy Spot.*
