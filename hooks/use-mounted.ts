"use client"

import { useEffect, useState } from "react"

/**
 * useMounted
 *
 * Returns true only after the component has mounted on the client.
 * Essential for any rendering that would cause a hydration mismatch:
 *   - Theme-aware UI (ThemeToggle reads localStorage)
 *   - Browser-only APIs (window, navigator)
 *   - next-themes (reads from localStorage/OS)
 *
 * @example
 * const mounted = useMounted()
 * if (!mounted) return <Skeleton />  // SSR-safe fallback
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
