/**
 * Color Constants
 *
 * Raw brand color primitives as JavaScript constants.
 * These mirror the HSL values defined in app/globals.css.
 *
 * USAGE RULE:
 *   In components → always use Tailwind utility classes (bg-primary, text-foreground, etc.)
 *   or CSS variables (var(--primary)).
 *
 *   Only use these JS constants when CSS variables are inaccessible:
 *     - Canvas API / WebGL rendering
 *     - SVG generation / d3.js charts
 *     - Email template generation
 *     - Screenshot / OG image generation (next/og)
 */

/* ── Brand Identity Colors (theme-agnostic) ─────────────────── */
/**
 * Warm amber-brown — the primary brand hue.
 * Evokes homemade warmth, traditional craftsmanship, and premium quality.
 */
export const BRAND_PRIMARY = {
  50:  "hsl(22 80% 96%)",
  100: "hsl(22 76% 90%)",
  200: "hsl(22 72% 80%)",
  300: "hsl(22 70% 68%)",
  400: "hsl(22 68% 56%)",
  500: "hsl(22 65% 44%)",
  600: "hsl(22 65% 38%)", // ← light theme --primary
  700: "hsl(22 65% 30%)",
  800: "hsl(22 60% 22%)",
  900: "hsl(22 55% 14%)",
} as const

/**
 * Warm gold — accent hue for highlights and badges.
 */
export const BRAND_ACCENT = {
  400: "hsl(43 88% 66%)",
  500: "hsl(43 80% 58%)", // ← light theme --accent
  600: "hsl(43 75% 50%)",
} as const

/* ── Light Theme Raw Values ─────────────────────────────────── */
export const LIGHT = {
  background:       "hsl(36 22% 97%)",
  foreground:       "hsl(25 18% 11%)",
  surface:          "hsl(36 18% 93%)",
  surfaceElevated:  "hsl(0 0% 100%)",
  border:           "hsl(30 15% 85%)",
  borderSubtle:     "hsl(30 12% 91%)",
  primary:          "hsl(22 65% 38%)",
  primaryForeground:"hsl(36 22% 97%)",
  muted:            "hsl(30 14% 90%)",
  mutedForeground:  "hsl(25 12% 47%)",
  accent:           "hsl(43 80% 57%)",
  destructive:      "hsl(0 72% 51%)",
  success:          "hsl(142 72% 29%)",
  warning:          "hsl(38 92% 50%)",
} as const

/* ── Dark Theme Raw Values ──────────────────────────────────── */
export const DARK = {
  background:       "hsl(25 14% 7%)",
  foreground:       "hsl(36 16% 92%)",
  surface:          "hsl(25 12% 11%)",
  surfaceElevated:  "hsl(25 11% 14%)",
  border:           "hsl(25 10% 20%)",
  borderSubtle:     "hsl(25 8% 15%)",
  primary:          "hsl(22 62% 58%)",
  primaryForeground:"hsl(25 14% 7%)",
  muted:            "hsl(25 10% 18%)",
  mutedForeground:  "hsl(30 10% 54%)",
  accent:           "hsl(43 72% 52%)",
  destructive:      "hsl(0 62% 58%)",
  success:          "hsl(142 60% 45%)",
  warning:          "hsl(38 80% 60%)",
} as const
