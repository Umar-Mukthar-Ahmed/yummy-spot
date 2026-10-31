"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRequest } from "./request-provider"

/** Floating shortcut to the request page while the customer has items selected. */
export function RequestBar() {
  const { count, ready } = useRequest()
  const pathname = usePathname()
  if (!ready || count === 0 || pathname.startsWith("/order") || pathname.startsWith("/admin")) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:hidden">
      <Link
        href="/order"
        className="enter pointer-events-auto inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-5 font-sans text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span key={count} className="animate-pop grid h-6 min-w-6 place-items-center rounded-full bg-primary-foreground px-1.5 text-xs font-bold leading-none text-primary">{count}</span>
        <span>{count === 1 ? "item" : "items"} in your request</span>
        <span aria-hidden="true">Review &rarr;</span>
      </Link>
    </div>
  )
}
