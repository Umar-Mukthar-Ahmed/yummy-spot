/**
 * Root Provider Composition
 *
 * Single entry point for all application-level providers.
 * Only this file is imported by app/layout.tsx.
 *
 * Provider ordering (outermost → innermost):
 *   ThemeProvider  — must be outermost to prevent flash of unstyled content
 *   [SupabaseProvider]  — future: database session context
 *   [QueryProvider]     — future: TanStack Query cache
 *   [AnalyticsProvider] — future: event tracking context
 *
 * Adding a new provider:
 *   1. Create its file in providers/
 *   2. Import it here and slot it in the composition tree
 *   3. Do NOT touch app/layout.tsx
 */

import { ThemeProvider } from "./theme-provider"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {/* SupabaseProvider — Phase 6: database integration */}
      {/* QueryProvider   — Phase 6: server state caching  */}
      {/* AnalyticsProvider — Phase 8: event tracking      */}
      {children}
    </ThemeProvider>
  )
}
