# Technology Stack Reference

> **Brand**: Yummy Spot
> **Document Version**: 1.0.0

Complete reference for every technology in the stack with version pins, rationale, and usage notes.

---

## Core Runtime

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `next` | 16.x | Full-stack React framework | App Router, Server Components, next/image, next/font. `cacheComponents` and `partialPrefetching` stay off (they hang on Cloudflare Workers) |
| `react` | 19.x | UI library | Server Components, concurrent features |
| `react-dom` | 19.x | React DOM renderer | Required peer of react |
| `typescript` | 5.x | Type system | Strict mode — see `tsconfig.json` |

---

## Styling

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `tailwindcss` | 4.x | Utility-first CSS | CSS-first config via `@theme inline` in `globals.css` — no tailwind.config.js |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin | Required for production CSS processing |
| `clsx` | 2.x | Class string builder | Used inside `cn()` utility |
| `tailwind-merge` | 2.x | Tailwind class deduplication | Used inside `cn()` utility |

### Tailwind v4 Usage Pattern
```css
/* globals.css */
@import "tailwindcss";

@theme inline {
  --color-primary: var(--primary);   /* Maps CSS var → Tailwind bg-primary */
  --text-3xl: clamp(1.5rem, 1.25rem + 1vw, 1.875rem); /* Fluid type */
}

:root  { --primary: hsl(22 65% 38%); }
.dark  { --primary: hsl(22 62% 58%); }
```

---

## Animation

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `motion` | 12.x | Animation library | Import from `"motion/react"` — successor to framer-motion |

### Usage Pattern
```typescript
import { motion } from "motion/react"
import { MOTION_VARIANTS } from "@/constants/animation"

<motion.div variants={MOTION_VARIANTS.fadeInUp} initial="hidden" animate="visible" />
```

---

## Theme

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `next-themes` | 0.4.x | Dark/light theme management | Adds `dark` class to `<html>` based on localStorage + system preference |

### Usage Pattern
```typescript
// providers/theme-provider.tsx
"use client"
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

---

## Validation

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `zod` | 4.x | Runtime schema validation | Validates env vars and the order request (shared by the form and `/api/orders`) |

### Usage Pattern
```typescript
// lib/env.ts — validates at startup, not at request time
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
})
```

---

## Backend services and deployment (all free tier)

| Package / service | Role | Notes |
| :--- | :---: | :--- |
| `@supabase/supabase-js` | Database, Auth, Realtime client | Browser (anon key, RLS) and server (service role, `/api/orders` only) |
| `@opennextjs/cloudflare` (dev) | Builds the Next.js app for Cloudflare Workers | Config in `open-next.config.ts` (static assets cache, no extra bindings) |
| `wrangler` (dev) | Cloudflare CLI | Local preview and deploy; config in `wrangler.jsonc` |
| Cloudflare Turnstile | Spam protection | Loaded from Cloudflare's script; verified server-side with a `fetch`, no package |
| Cloudinary | Image upload and delivery | No SDK: signed upload via `fetch`, URLs built in `lib/media.ts` |

Not used: Payload or any CMS package, `@supabase/ssr`, Cloudinary SDKs, R2, D1, Durable Objects, Hyperdrive, `react-hook-form` (the forms are small enough to use native controls).

---

## Developer Tooling

| Package | Version | Role | Notes |
| :--- | :--- | :--- | :--- |
| `prettier` | 3.x | Code formatter | Configured via `.prettierrc` |
| `prettier-plugin-tailwindcss` | 0.6.x | Tailwind class sorter | Sorts Tailwind classes in JSX/TSX; configured for `cn()`, `cva()`, `clsx()` |
| `eslint` | 9.x | Linter | Flat config format (`eslint.config.mjs`) |
| `@eslint/eslintrc` | 3.x | ESLint compat | Next.js ESLint config adapter |

### npm Scripts
```json
{
  "dev":        "next dev",
  "build":      "next build",
  "start":      "next start",
  "lint":       "eslint",
  "cf:build":   "opennextjs-cloudflare build",
  "cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "cf:deploy":  "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
}
```

---

## Key Constraints & Rules

### Things NOT in the stack (and why)

| Technology | Why NOT |
| :--- | :--- |
| `framer-motion` | Replaced by `motion` (same API, standalone package) |
| `tailwind.config.js` | Tailwind v4 is CSS-first — config lives in `globals.css` |
| `axios` | `fetch` is native in Node 18+ and Next.js; no need for axios |
| `lodash` | Tree-shakeable custom utils in `lib/utils.ts` cover all needs |
| Raw `<img>` tags | Always use `next/image` for automatic AVIF/WebP + responsive srcset |
| `styled-components` / `emotion` | Tailwind v4 covers all styling needs without runtime CSS-in-JS |
| `redux` / `zustand` | No global state needed yet; server state via RSC, local state via useState |

---

## Version Pinning Policy

- Lock major versions for core framework packages (`next`, `react`, `typescript`).
- Track minor/patch updates for tooling (`prettier`, `eslint`).
- Run `npm audit` bi-weekly for security vulnerability scanning.
- Major version upgrades require dedicated testing sprint, not inline with feature work.
