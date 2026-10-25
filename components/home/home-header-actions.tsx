"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

/** Homepage-only header actions; other routes keep the shared navbar unchanged. */
export function HomeHeaderActions() {
  const pathname = usePathname()
  if (pathname !== "/") return null

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link href="/menu" aria-label="Search the menu" className="grid h-11 w-11 place-items-center rounded-full text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></svg>
      </Link>
      <WhatsAppButton className="min-h-11 rounded-full bg-success px-4 text-xs" />
    </div>
  )
}
