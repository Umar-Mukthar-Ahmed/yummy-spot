"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { primaryNav } from "@/config/navigation"

/** Desktop header links with an underline on the current page. */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <ul className="hidden items-center gap-1 md:flex" role="list">
      {primaryNav.map((item) => {
        const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
              className="relative inline-flex min-h-11 items-center rounded-md px-3 font-sans text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current=page]:text-foreground after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 aria-[current=page]:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
