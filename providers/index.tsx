/**
 * Root Provider Composition
 *
 * Single entry point for all application-level providers.
 * Only this file is imported by app/layout.tsx.
 *
 * Provider ordering (outermost → innermost):
 *   ThemeProvider  — must be outermost to prevent flash of unstyled content
 *   RequestProvider — the customer's multi-item order request (localStorage)
 *   [AnalyticsProvider] — future: event tracking context
 *
 * Adding a new provider:
 *   1. Create its file in providers/
 *   2. Import it here and slot it in the composition tree
 *   3. Do NOT touch app/layout.tsx
 */

import { ThemeProvider } from "./theme-provider"
import { RequestProvider } from "@/components/order/request-provider"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <RequestProvider>{children}</RequestProvider>
    </ThemeProvider>
  )
}
