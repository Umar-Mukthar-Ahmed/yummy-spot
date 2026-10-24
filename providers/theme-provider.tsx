"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * ThemeProvider — Client Component
 *
 * Wraps next-themes ThemeProvider with project-specific defaults.
 * Must be a Client Component because it reads from localStorage.
 *
 * Configured with:
 *   attribute="class"   → applies "dark" class to <html>
 *   defaultTheme="system" → respects OS preference on first visit
 *   enableSystem          → syncs with prefers-color-scheme
 *   storageKey            → persists user choice
 *
 * @see https://github.com/pacocoursey/next-themes
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="yummy-spot-theme"
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
