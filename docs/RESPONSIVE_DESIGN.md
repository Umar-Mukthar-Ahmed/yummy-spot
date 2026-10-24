# Responsive Design Specification

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Status**: Non-Negotiable Engineering Standard
> **Applies To**: Every page, component, and feature — without exception

---

## 1. Core Principles

1. **Mobile-First Always** — write CSS for 320px first, then layer enhancements via `min-width` breakpoints.
2. **No Horizontal Scroll** — `overflow-x: hidden` on html; never use fixed widths wider than the viewport.
3. **Touch-Friendly** — all interactive elements must have a minimum 44×44px touch target (per WCAG 2.5.5).
4. **Fluid Typography** — use `clamp()` for all heading and display sizes; never use hard-coded `px` font sizes.
5. **Fluid Spacing** — use Tailwind tokens and responsive variants (`sm:`, `md:`, `lg:`); no magic numbers.
6. **next/image Always** — every image rendered on the page uses `next/image` for responsive srcset, AVIF/WebP, lazy loading, and CLS prevention.
7. **Dark + Light Parity** — both themes are equally tested; no feature is considered done until verified in both.

---

## 2. Breakpoint Reference

| Breakpoint Token | Min Width | Device Profile |
| :--- | :---: | :--- |
| *(base / mobile-first)* | 320px | Smallest supported phone (iPhone SE 1st gen) |
| `xs` (custom) | 375px | Standard small phone (iPhone SE 2nd gen / 12 mini) |
| `sm:` | 640px | Large phone / phablet (iPhone Pro Max) |
| `md:` | 768px | Tablet portrait (iPad Mini) |
| `lg:` | 1024px | Tablet landscape / small laptop |
| `xl:` | 1280px | Desktop (13" laptop) |
| `2xl:` | 1536px | Wide desktop (1440px+) |

**Testing Widths**: 320px · 375px · 390px · 768px · 1024px · 1440px · 1920px

---

## 3. Fluid Typography Specification

All heading and display sizes use `clamp(min, preferred, max)`.

The formula used: `clamp(size-at-320px, fluid-midpoint, size-at-1920px)`

### 3.1 Typography Scale (defined in `globals.css` `@theme inline`)

| Token | clamp() Value | Range |
| :--- | :--- | :--- |
| `--text-xs` | `clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem)` | 11px → 12px |
| `--text-sm` | `clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem)` | 13px → 14px |
| `--text-base` | `clamp(0.9375rem, 0.875rem + 0.3vw, 1rem)` | 15px → 16px |
| `--text-lg` | `clamp(1rem, 0.9375rem + 0.35vw, 1.125rem)` | 16px → 18px |
| `--text-xl` | `clamp(1.125rem, 1rem + 0.5vw, 1.25rem)` | 18px → 20px |
| `--text-2xl` | `clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)` | 20px → 24px |
| `--text-3xl` | `clamp(1.5rem, 1.25rem + 1vw, 1.875rem)` | 24px → 30px |
| `--text-4xl` | `clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem)` | 30px → 36px |
| `--text-5xl` | `clamp(2.25rem, 1.75rem + 2vw, 3rem)` | 36px → 48px |
| `--text-6xl` | `clamp(3rem, 2.25rem + 3vw, 3.75rem)` | 48px → 60px |
| `--text-7xl` | `clamp(3.75rem, 2.75rem + 4vw, 4.5rem)` | 60px → 72px |
| `--text-8xl` | `clamp(4.5rem, 3rem + 6vw, 6rem)` | 72px → 96px |
| `--text-display` | `clamp(4rem, 2.5rem + 7.5vw, 7rem)` | 64px → 112px |

---

## 4. Responsive Layout Grid

### 4.1 Page Container
- Uses `Container` component (`components/layout/container.tsx`)
- Padding: `px-4` (mobile) → `px-6` (sm) → `px-8` (lg)
- Max-width: `max-w-7xl` for content, `max-w-2xl` for articles

### 4.2 Standard Breakpoint Grid Patterns

```
Product Card Grid:
  mobile   (320-639px):  1 column
  tablet   (640-1023px): 2 columns
  desktop  (1024-1279px): 3 columns
  wide     (1280px+):     4 columns

Category Grid:
  mobile   (320-639px):  1 column (full bleed cards)
  tablet   (640-1023px): 2 columns
  desktop  (1024px+):    3 columns

Hero Layout:
  mobile   (320-767px):  stacked (image below text)
  tablet   (768-1023px): stacked, larger image
  desktop  (1024px+):    side-by-side (text left, image right)

Footer Grid:
  mobile   (320-639px):  2 columns (brand + 1 nav group)
  tablet   (640-1023px): 2 columns (brand + 2 nav groups)
  desktop  (1024px+):    4 columns (brand + 3 nav groups)
```

---

## 5. Touch Interaction Standards

| Element Type | Minimum Touch Target | Implementation |
| :--- | :---: | :--- |
| Navigation links | 44×44px | `min-h-[44px] px-4` |
| Buttons (all sizes) | 44×44px | `min-h-[44px]` on `sm`/`md`/`lg` sizes |
| Icon buttons | 44×44px | `h-11 w-11` (not `h-9 w-9`) |
| Card tap areas | Full card | `cursor-pointer` on entire card |
| Form inputs | 44px height | `h-11` for inputs, `h-12` for selects |
| WhatsApp CTA | 48px+ height | `h-12` minimum, full-width on mobile |
| Quantity ±buttons | 44×44px | `h-11 w-11` with `p-0` |

---

## 6. Navigation Responsive Behavior

### Desktop (≥ 768px)
- Horizontal nav bar with logo, link list, and theme toggle
- Links show text with hover/active states

### Mobile (< 768px)
- Show: Logo + hamburger menu button (44×44px) + theme toggle
- Hide: Desktop link list (`hidden md:flex`)
- Hamburger opens full-screen slide-over drawer (Motion animated)
- Drawer: Logo × close button, full-width category links, WhatsApp CTA
- Drawer closes on: Escape key, backdrop click, link navigation
- Focus trap active while drawer is open (WCAG 2.4.3)

---

## 7. Image Responsive Requirements

```tsx
// CORRECT — responsive image with next/image
<Image
  src={product.thumbnail.url}
  alt={product.name}
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover w-full h-full"
  priority={isAboveFold}
/>

// WRONG — never use raw <img> tags
<img src={product.thumbnail.url} alt={product.name} />
```

### Required `sizes` prop patterns

| Usage | `sizes` value |
| :--- | :--- |
| Hero image (full width) | `"100vw"` |
| Product card (1→2→3→4 col grid) | `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"` |
| Category card (1→2→3 col grid) | `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` |
| Gallery masonry image | `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"` |
| Avatar / thumbnail (fixed small) | `"(max-width: 640px) 64px, 96px"` |

---

## 8. Dark & Light Theme Consistency Rules

- Every color must have a corresponding CSS variable in both `:root` (light) and `.dark` (dark) in `globals.css`.
- Never hardcode `text-gray-600` or `bg-white` — always use semantic tokens: `text-muted-foreground`, `bg-background`, etc.
- Before marking any component complete, toggle between light and dark with `ThemeToggle` and verify visual consistency.
- Typography contrast ratios in both themes must meet WCAG AA (4.5:1 for body, 3:1 for large text).

### Theme verification checklist per component:
- [ ] Readable in light mode (off-white background)
- [ ] Readable in dark mode (deep charcoal background)
- [ ] Borders/dividers visible in both themes
- [ ] Shadows appropriate in both themes (darker in dark mode)
- [ ] Interactive states (hover/focus/active) visible in both themes

---

## 9. Pre-Completion Testing Checklist

Before any feature is marked as complete, run through all items:

```
RESPONSIVE VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Viewport Tests (using DevTools device emulation):
  [ ] 320px  — Samsung Galaxy S8 (smallest)
  [ ] 375px  — iPhone SE / 12 mini
  [ ] 390px  — iPhone 14 / 15 standard
  [ ] 768px  — iPad Mini portrait
  [ ] 1024px — iPad landscape / small laptop
  [ ] 1440px — MacBook 14" / desktop
  [ ] 1920px — Full HD wide desktop

Layout:
  [ ] No horizontal scroll at any viewport
  [ ] No content clipping or overflow
  [ ] Container gutters visible at all sizes
  [ ] Images not distorted (object-cover / object-contain correct)

Typography:
  [ ] Headings scale gracefully (clamp-based)
  [ ] Body text readable at 320px (no wrap-induced overflow)
  [ ] Line lengths ≤ 75ch on wide screens (max-w-prose)

Touch:
  [ ] All buttons ≥ 44px tap target
  [ ] No hover-only UI (all hover states have touch equivalents)
  [ ] CTA buttons full-width on mobile

Navigation:
  [ ] Desktop nav visible at 768px+
  [ ] Hamburger visible at < 768px
  [ ] Drawer opens/closes correctly
  [ ] Drawer focus trap works (Tab stays inside)
  [ ] Escape key closes drawer

Themes:
  [ ] Visually correct in light mode
  [ ] Visually correct in dark mode
  [ ] No hardcoded colors (all semantic tokens)

Performance:
  [ ] All images use next/image
  [ ] Hero image has priority={true}
  [ ] No layout shift on image load (explicit width/height)
```

---

*Every engineer is responsible for this checklist. No exceptions. No shortcuts.*
