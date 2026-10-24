/**
 * Logo — Server Component
 *
 * Typographic logo using Fraunces serif.
 * Phase 2: Replace with an SVG or next/image logo asset.
 *
 * Renders as a Next.js <Link> by default.
 * Pass asDiv={true} on the homepage where wrapping in a link
 * to "/" would create a redundant landmark.
 *
 * @example
 * <Logo />                    // Links to /
 * <Logo asDiv />              // Div — for homepage hero
 * <Logo className="text-2xl" /> // Size override
 */

import Link from "next/link"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"

type LogoProps = {
  className?: string
  /** Render as a div instead of a Link (e.g., on the homepage itself) */
  asDiv?: boolean
}

const logoText = (className?: string) => (
  <span
    className={cn(
      "font-serif text-xl font-semibold tracking-tight text-foreground",
      "select-none",
      className
    )}
  >
    {siteConfig.name}
  </span>
)

export function Logo({ className, asDiv = false }: LogoProps) {
  if (asDiv) {
    return <div>{logoText(className)}</div>
  }

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — Go to homepage`}
      className="rounded-sm transition-opacity duration-150 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {logoText(className)}
    </Link>
  )
}
