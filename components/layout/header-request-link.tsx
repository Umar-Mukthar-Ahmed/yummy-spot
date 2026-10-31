"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { buttonClass } from "@/components/ui/button"
import { useRequest } from "@/components/order/request-provider"

/** Desktop header shortcut to the order request; on small screens the floating request bar does this job. */
export function HeaderRequestLink() {
  const { count, ready } = useRequest()
  const pathname = usePathname()
  const hasItems = ready && count > 0

  return (
    <Link
      href="/order"
      aria-current={pathname.startsWith("/order") ? "page" : undefined}
      className={buttonClass({ variant: hasItems ? "primary" : "secondary", size: "sm", className: "mr-1 hidden md:inline-flex" })}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 11H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
      <span>Your request</span>
      {hasItems && (
        <span key={count} className="animate-pop grid h-5 min-w-5 place-items-center rounded-full bg-primary-foreground px-1.5 text-xs font-bold leading-none text-primary">
          {count}
          <span className="sr-only"> {count === 1 ? "item" : "items"}</span>
        </span>
      )}
    </Link>
  )
}
