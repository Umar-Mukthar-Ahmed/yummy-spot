# Yummy Spot

> **Homemade. Premium. Delivered.**

A premium home-based food brand website built with Next.js App Router. Customers browse handcrafted meals, desserts, wellness foods, and seasonal specials — then place orders directly via WhatsApp.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (CSS-first `@theme inline`) |
| Animation | Motion (`motion/react`) |
| Themes | next-themes |
| Validation | Zod v4 |
| Fonts | Fraunces (serif) + Manrope (sans) via `next/font` |
| Formatting | Prettier + prettier-plugin-tailwindcss |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values (see comments in the file).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Format code

```bash
npm run format
```

### 5. Lint

```bash
npm run lint
```

---

## Project Structure

```
yummy-spot/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Navbar, Footer, Providers)
│   ├── page.tsx            # Homepage placeholder
│   ├── globals.css         # Tailwind v4 @theme inline design system
│   ├── not-found.tsx       # 404 page
│   ├── error.tsx           # Error boundary
│   ├── loading.tsx         # Root loading UI
│   ├── sitemap.ts          # Auto-generated sitemap.xml
│   ├── robots.ts           # Auto-generated robots.txt
│   └── manifest.ts         # PWA manifest
│
├── components/
│   ├── layout/             # Structural components
│   │   ├── navbar.tsx      # Sticky site header
│   │   ├── footer.tsx      # Site-wide footer
│   │   ├── container.tsx   # Horizontal constraint + gutters
│   │   └── section.tsx     # Vertical spacing wrapper
│   ├── ui/                 # Design system primitives
│   │   ├── button.tsx      # Button (5 variants, 4 sizes, loading state)
│   │   ├── badge.tsx       # Badge (7 variants)
│   │   ├── card.tsx        # Card compound components
│   │   └── divider.tsx     # Horizontal/vertical separator
│   └── shared/             # Cross-cutting components
│       ├── heading.tsx     # Semantic heading with decoupled sizing
│       ├── text.tsx        # Polymorphic text primitive
│       ├── logo.tsx        # Brand logo (typographic)
│       └── theme-toggle.tsx # Dark/light mode toggle
│
├── config/                 # Single-source-of-truth configuration
│   ├── site.ts             # Brand identity, URLs, WhatsApp config
│   ├── navigation.ts       # Primary nav, footer nav, category slugs
│   ├── metadata.ts         # Metadata factory for OG/Twitter/canonical
│   └── theme.ts            # Theme configuration and token map
│
├── constants/
│   ├── animation.ts        # Motion easing curves and variants
│   ├── breakpoints.ts      # Breakpoints mirroring Tailwind v4
│   └── colors.ts           # Raw brand color primitives
│
├── docs/                   # Architecture documentation
│   ├── ARCHITECTURE.md     # Technical architecture decisions
│   ├── CMS_PLAN.md         # CMS evaluation and owner workflows
│   ├── CONTENT_ARCHITECTURE.md # Content hierarchy and IA
│   ├── PRODUCT_MODEL.md    # TypeScript types and Zod schemas
│   ├── RESPONSIVE_DESIGN.md # Responsive implementation spec
│   ├── ROADMAP.md          # Engineering roadmap (Phases 0-9)
│   ├── SEO_PLAN.md         # SEO strategy and JSON-LD schemas
│   ├── SITE_MAP.md         # URL structure and routing
│   ├── TECH_STACK.md       # Technology choices and rationale
│   └── USER_FLOW.md        # Customer journeys and WhatsApp flows
│
├── hooks/
│   ├── use-mounted.ts      # SSR-safe hydration state
│   └── use-media-query.ts  # Reactive media query hook
│
├── lib/
│   ├── utils.ts            # cn(), buildWhatsAppUrl(), formatPrice(), slugify()
│   ├── env.ts              # Zod v4 environment variable validation
│   └── seo.tsx             # JSON-LD schema factories + Server Component renderer
│
├── providers/
│   ├── theme-provider.tsx  # next-themes wrapper
│   └── index.tsx           # Root provider composition
│
├── styles/
│   └── animations.css      # Keyframes and animation utilities
│
├── types/
│   ├── site.ts             # SiteConfig, NavItem, FooterNavGroup
│   ├── seo.ts              # JSON-LD schema types
│   └── index.ts            # Barrel exports
│
├── .env.example            # Environment variable template
├── .env.local              # Local dev secrets (gitignored)
├── .prettierrc             # Prettier config with Tailwind class sorting
├── .prettierignore         # Prettier ignore patterns
├── next.config.ts          # Next.js config (images, headers, Turbopack)
└── tsconfig.json           # Strict TypeScript config
```

---

## Design System

### Themes
- **Light**: Warm off-white (`hsl(36 22% 97%)`) with amber-brown primary
- **Dark**: Deep warm charcoal (`hsl(25 14% 7%)`) with softened amber

Toggle via the moon/sun button in the navbar.

### Typography
- **Headings**: Fraunces (serif) — editorial, warm, premium
- **Body/UI**: Manrope (sans-serif) — clean, modern, readable
- **Type scale**: Fluid `clamp()` values — scales from 320px to 1920px

### Color Tokens (semantic)
```
background        surface           border
foreground        surface-elevated  border-subtle
primary           muted             accent
primary-foreground muted-foreground accent-foreground
destructive       success           warning
ring              overlay
```

### Responsive Breakpoints
320px · 375px · 390px · 768px · 1024px · 1440px · 1920px

---

## Ordering Flow

Customers browse the product catalog, then tap **"Order via WhatsApp"** which opens WhatsApp with a pre-filled message template:

```
*NEW ORDER — YUMMY SPOT* 🍲
---------------------------------------
*Dish:* Mutton Mandi Platter
*Portion:* 2 (per box)
*Estimated Price:* ₹2,500.00
...
```

No checkout, no payment gateway — pure conversational commerce.

---

## Documentation

All architecture decisions, content models, and roadmap are documented in [`/docs`](./docs/).

| Document | Purpose |
| :--- | :--- |
| [ROADMAP.md](./docs/ROADMAP.md) | Phases 0-9 engineering roadmap |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture decisions |
| [PRODUCT_MODEL.md](./docs/PRODUCT_MODEL.md) | Data models and TypeScript types |
| [SITE_MAP.md](./docs/SITE_MAP.md) | URL structure and routing strategy |
| [SEO_PLAN.md](./docs/SEO_PLAN.md) | SEO strategy and JSON-LD schemas |
| [CMS_PLAN.md](./docs/CMS_PLAN.md) | CMS evaluation and owner workflows |
| [USER_FLOW.md](./docs/USER_FLOW.md) | Customer journeys |
| [RESPONSIVE_DESIGN.md](./docs/RESPONSIVE_DESIGN.md) | Responsive implementation spec |

---

## Current Phase

**Phase 0 ✅ Complete** — Repository and architecture foundation  
**Phase 1 ✅ Complete** — Information architecture and content model  
**Phase 2 ⬜ Next** — Core UI foundation and design system completion

See [ROADMAP.md](./docs/ROADMAP.md) for the full delivery plan.
