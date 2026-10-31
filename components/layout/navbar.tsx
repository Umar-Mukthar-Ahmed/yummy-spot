/** Sticky site header: logo, desktop links, request shortcut, theme toggle and the mobile menu. */

import { Container } from "./container"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { HeaderRequestLink } from "./header-request-link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/90 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
          <Logo />
          <NavLinks />
          <div className="flex items-center gap-1">
            <HeaderRequestLink />
            <ThemeToggle />
            <MobileNav />
          </div>
        </nav>
      </Container>
    </header>
  )
}
