/**
 * Navbar — Server Component
 *
 * Sticky site header with logo, desktop navigation, and theme toggle.
 * Uses frosted-glass backdrop-blur for a premium feel.
 *
 * @phase Phase 2 — responsive navigation drawer
 */

import Link from "next/link"
import { Container } from "./container"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { primaryNav } from "@/config/navigation"
import { MobileNav } from "./mobile-nav"
import { HomeHeaderActions } from "@/components/home/home-header-actions"

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/80 backdrop-blur-md"
      role="banner"
    >
      <Container>
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="Main navigation"
        >
          {/* ── Brand ──────────────────────────────────────── */}
          <Logo />

          {/* ── Desktop Links ───────────────────────────────── */}
          <ul
            className="hidden md:flex items-center gap-1"
            role="list"
          >
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "inline-flex items-center rounded-md px-3 py-2",
                    "font-sans text-sm font-medium text-muted-foreground",
                    "transition-colors duration-150",
                    "hover:text-foreground hover:bg-surface",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-1",
                    "focus-visible:ring-offset-background",
                  ].join(" ")}
                  {...(item.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Actions ─────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            <HomeHeaderActions />
            <ThemeToggle />
            <MobileNav />
          </div>
        </nav>
      </Container>
    </header>
  )
}
