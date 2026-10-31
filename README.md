# Yummy Spot

> **Homemade. Premium. Delivered.**

A premium home-based food brand website. Customers browse the menu and send a multi-item order request; the owner reviews and manages requests, products and photos in a built-in admin. Everything runs on free tiers; only the domain name costs money (see [FREE_TIER_NOTES.md](./FREE_TIER_NOTES.md)).

---

## Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme inline`), Motion, next-themes |
| Hosting | Cloudflare Workers **Free** via `@opennextjs/cloudflare` |
| Database + admin login | Supabase **Free** (PostgreSQL, Auth, Realtime) |
| Images | Cloudinary **Free** (signed direct uploads, resized delivery) |
| Spam protection | Cloudflare Turnstile |
| Validation | Zod v4 |

No Payload, no other CMS, no paid services.

---

## How ordering works

1. A customer adds dishes to a **request** (kept in their browser) and opens `/order`.
2. They enter name, phone, delivery or pickup details and a wanted time, and pass Turnstile.
3. `POST /api/orders` validates the request and calls the database function `create_order`, which checks availability and lead times, computes prices from the database, blocks duplicates and rate-limits abusers.
4. The owner sees the request in `/admin/orders`, confirms or rejects it, moves it through preparing, ready and delivered, and can message the customer on WhatsApp from the order screen.

There is no online payment. WhatsApp buttons on the site remain as an optional way to contact the kitchen.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in values (see comments in the file)
npm run dev                    # http://localhost:3000
```

The storefront renders without any environment variables (placeholders are shown). Ordering, the real menu and `/admin` need the Supabase, Cloudinary and Turnstile values.

### Environment variables

`.env.example` lists every variable and marks it **public** (safe in the browser, baked in at build time) or **secret** (server only). Use:

| File | Used by |
| :--- | :--- |
| `.env.local` | `npm run dev` and builds (public values, plus secrets for local API routes) |
| `.env.production.local` | Production builds, overrides `.env.local` (real Turnstile keys, real app URL) |
| `.dev.vars` | `npm run cf:preview` (secrets read by the local Worker) |
| `wrangler secret put NAME` | Production secrets on Cloudflare |

All of these are gitignored. Never commit real values.

### Database

Apply the files in `supabase/migrations/` in order (Supabase dashboard, SQL editor), then `supabase/seed.sql`. Create the owner in Supabase Auth, then add them to `admin_users` (the command is in the comments of the first migration).

### Scripts

```bash
npm run lint
npm run build
npm run cf:preview     # OpenNext build + local Cloudflare runtime
npm run cf:deploy      # deploy to Cloudflare (after the end-to-end test passes)
```

---

## Project structure

```
app/            routes: /, /menu, /order, /admin/*, /api/orders, /api/admin/media/sign
components/     layout, ui, shared, home, menu, order (cart + form + Turnstile), admin
config/         site, navigation, metadata, theme
lib/            catalog, media (Cloudinary boundary), supabase clients, validation, env
supabase/       migrations (schema, RLS, create_order function) and seed.sql
docs/           architecture, product model, admin plan, user flow, roadmap, SEO
```

---

## Documentation

| Document | Purpose |
| :--- | :--- |
| [FREE_TIER_NOTES.md](./FREE_TIER_NOTES.md) | Free-tier limits, risks, and what we deliberately did not add |
| [AGENTS.md](./AGENTS.md) | Rules and architecture for AI agents and contributors |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical decisions and the final free-first architecture |
| [docs/PRODUCT_MODEL.md](./docs/PRODUCT_MODEL.md) | Catalog, media and order data model |
| [docs/CMS_PLAN.md](./docs/CMS_PLAN.md) | Custom admin: screens, workflows, security |
| [docs/USER_FLOW.md](./docs/USER_FLOW.md) | Customer and owner journeys |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phases and status |
| [docs/SITE_MAP.md](./docs/SITE_MAP.md) | Routes |
| [docs/CONTENT_ARCHITECTURE.md](./docs/CONTENT_ARCHITECTURE.md) | Information architecture blueprint |
| [docs/SEO_PLAN.md](./docs/SEO_PLAN.md) | SEO strategy |
| [docs/RESPONSIVE_DESIGN.md](./docs/RESPONSIVE_DESIGN.md) | Responsive implementation spec |
| [docs/TECH_STACK.md](./docs/TECH_STACK.md) | Packages and rationale |
