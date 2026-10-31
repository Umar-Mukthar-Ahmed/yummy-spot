"use client"

import { usePathname } from "next/navigation"
import { RequestBar } from "@/components/order/request-bar"

type SiteChromeProps = {
  header: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
}

/** Storefront header, footer and main wrapper; the admin area (/admin) renders without them. */
export function SiteChrome({ header, footer, children }: SiteChromeProps) {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return <>{children}</>

  return (
    <>
      {header}
      <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-4rem)] outline-none">
        {children}
      </main>
      {footer}
      <RequestBar />
    </>
  )
}
