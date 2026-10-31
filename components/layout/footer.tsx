/**
 * Footer — Server Component
 *
 * Site-wide footer with brand mark, nav groups, and copyright.
 * All content is driven by config/navigation.ts and config/site.ts —
 * no hardcoded business content here.
 *
 * @phase Phase 3 — add social icons, WhatsApp CTA, newsletter
 */

import Link from "next/link"
import { Container } from "./container"
import { Logo } from "@/components/shared/logo"
import { siteConfig } from "@/config/site"
import { footerNav } from "@/config/navigation"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t border-border bg-surface"
      role="contentinfo"
    >
      <Container>
        {/* ── Main footer grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs font-sans text-sm text-muted-foreground leading-relaxed">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Nav group columns */}
          {footerNav.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {group.label}
              </h2>
              <ul className="space-y-2.5" role="list">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-sans text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
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
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-t border-border-subtle py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Homemade with care &middot; Order requests online
          </p>
        </div>
      </Container>
    </footer>
  )
}
