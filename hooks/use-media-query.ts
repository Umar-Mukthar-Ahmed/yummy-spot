"use client"

import { useEffect, useState } from "react"

/**
 * useMediaQuery
 *
 * Reactively tracks a CSS media query string.
 * Returns undefined during SSR to prevent hydration mismatches.
 * Cleans up the event listener on unmount.
 *
 * @param query - A valid CSS media query string
 * @returns true | false on the client, undefined during SSR
 *
 * @example
 * import { MEDIA_QUERIES } from "@/constants/breakpoints"
 *
 * const isDesktop = useMediaQuery(MEDIA_QUERIES.lg)
 * const prefersDark = useMediaQuery(MEDIA_QUERIES.dark)
 * const reducedMotion = useMediaQuery(MEDIA_QUERIES.reducedMotion)
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(query)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mql.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [query])

  return matches
}
