/**
 * Animation Constants
 *
 * Centralised Motion (motion/react) configuration.
 * Import TRANSITIONS and VARIANTS in components for consistent
 * animation language across the entire application.
 *
 * These values deliberately mirror the CSS easing variables in globals.css
 * so Motion-driven animations feel identical to CSS transitions.
 *
 * @example
 * import { VARIANTS, TRANSITIONS } from "@/constants/animation"
 * <motion.div variants={VARIANTS.slideUp} transition={TRANSITIONS.default} />
 */

/* ── Easing ──────────────────────────────────────────────────── */
/** Named easing arrays for Motion's `ease` property */
export const EASING = {
  smooth:   [0.4,  0,    0.2, 1   ] as const,   // Material Design standard
  spring:   [0.34, 1.56, 0.64, 1  ] as const,   // Slight overshoot
  outExpo:  [0.16, 1,    0.3, 1   ] as const,   // Dramatic ease-out
  inOut:    [0.45, 0,    0.55, 1  ] as const,
  linear:   [0,    0,    1,   1   ] as const,
} as const

/* ── Duration ─────────────────────────────────────────────────── */
/** Duration in seconds (Motion uses seconds, CSS uses ms) */
export const DURATION = {
  instant: 0.05,
  fast:    0.15,
  normal:  0.25,
  slow:    0.4,
  slower:  0.6,
  slowest: 0.8,
} as const

/* ── Transition Presets ───────────────────────────────────────── */
export const TRANSITIONS = {
  /** Default page-level transitions */
  default: {
    duration: DURATION.normal,
    ease: EASING.smooth,
  },
  /** Snappy UI feedback (buttons, toggles) */
  fast: {
    duration: DURATION.fast,
    ease: EASING.smooth,
  },
  /** Hero and section entrances */
  slow: {
    duration: DURATION.slow,
    ease: EASING.outExpo,
  },
  /** Springy interactive elements */
  spring: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
    mass: 1,
  },
  /** Gentler spring for layout shifts */
  springGentle: {
    type: "spring" as const,
    stiffness: 180,
    damping: 26,
    mass: 1,
  },
} as const

/* ── Variant Presets ─────────────────────────────────────────── */
/**
 * Motion variant objects for `variants` prop.
 * Use with `initial="hidden"` and `animate="visible"`.
 */
export const VARIANTS = {
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden:  { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden:  { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleUp: {
    hidden:  { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  /** Container variant for staggered children */
  stagger: {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren:   0.1,
      },
    },
  },
  /** Faster stagger for dense grids */
  staggerFast: {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren:   0.05,
      },
    },
  },
} as const

/* ── Helpers ─────────────────────────────────────────────────── */
/** Calculate stagger delay for nth item in a list */
export function staggerDelay(index: number, base = 0.08): number {
  return index * base
}
