/**
 * Theme Configuration
 *
 * Maps design token names to their semantic meanings.
 * Acts as the TypeScript-level documentation of the design system.
 *
 * NOTE: Actual CSS values live in app/globals.css.
 *       This file provides typed constants for use in JS/TS contexts
 *       (e.g., Motion animations, Canvas operations, chart libraries).
 */

/* ── Theme Modes ─────────────────────────────────────────────── */
export const THEME_MODES = ["light", "dark", "system"] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export const themeConfig = {
  defaultTheme: "system" as ThemeMode,
  /** Key used in localStorage by next-themes */
  storageKey: "yummy-spot-theme",
  /** next-themes attribute applied to <html> */
  attribute: "class" as const,

  /**
   * CSS variable token map.
   * Maps semantic names → CSS variable names defined in globals.css.
   * Used for documentation and future tooling (e.g., design token export).
   */
  tokens: {
    color: {
      background:       "--background",
      foreground:       "--foreground",
      surface:          "--surface",
      surfaceElevated:  "--surface-elevated",
      border:           "--border",
      borderSubtle:     "--border-subtle",
      primary:          "--primary",
      primaryForeground:"--primary-foreground",
      primaryHover:     "--primary-hover",
      muted:            "--muted",
      mutedForeground:  "--muted-foreground",
      accent:           "--accent",
      accentForeground: "--accent-foreground",
      destructive:      "--destructive",
      success:          "--success",
      warning:          "--warning",
      ring:             "--ring",
      overlay:          "--overlay",
    },
    font: {
      serif: "--font-fraunces",
      sans:  "--font-manrope",
    },
    radius: {
      none: "--radius-none",
      xs:   "--radius-xs",
      sm:   "--radius-sm",
      md:   "--radius-md",
      lg:   "--radius-lg",
      xl:   "--radius-xl",
      "2xl":"--radius-2xl",
      "3xl":"--radius-3xl",
      full: "--radius-full",
    },
    duration: {
      instant: "--duration-instant",
      fast:    "--duration-fast",
      normal:  "--duration-normal",
      slow:    "--duration-slow",
      slower:  "--duration-slower",
    },
  },
} as const
