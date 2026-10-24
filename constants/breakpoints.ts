/**
 * Breakpoint Constants
 *
 * Mirrors Tailwind CSS v4 default breakpoints.
 * Use these in JavaScript contexts where CSS media queries are unavailable:
 *   - Motion conditional animations
 *   - useMediaQuery hook
 *   - Dynamic layout calculations
 *
 * Do NOT use these for CSS — use Tailwind responsive prefixes instead.
 */

export const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  "2xl": 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/** CSS media query strings for use with window.matchMedia */
export const MEDIA_QUERIES = {
  sm:           `(min-width: ${BREAKPOINTS.sm}px)`,
  md:           `(min-width: ${BREAKPOINTS.md}px)`,
  lg:           `(min-width: ${BREAKPOINTS.lg}px)`,
  xl:           `(min-width: ${BREAKPOINTS.xl}px)`,
  "2xl":        `(min-width: ${BREAKPOINTS["2xl"]}px)`,
  /** Dark mode system preference */
  dark:         "(prefers-color-scheme: dark)",
  /** Pointer device capable of hover (not touch-only) */
  hover:        "(hover: hover) and (pointer: fine)",
  /** User has requested reduced motion in OS settings */
  reducedMotion:"(prefers-reduced-motion: reduce)",
  /** Portrait orientation */
  portrait:     "(orientation: portrait)",
  /** Landscape orientation */
  landscape:    "(orientation: landscape)",
} as const

export type MediaQueryKey = keyof typeof MEDIA_QUERIES
