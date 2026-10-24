"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

export type AnnouncementVariant = "info" | "warning" | "promo"

type AnnouncementBannerProps = {
  message: string
  linkText?: string
  linkHref?: string
  variant?: AnnouncementVariant
}

const variantStyles: Record<AnnouncementVariant, string> = {
  info: "bg-warning/15 text-foreground",
  warning: "bg-destructive/10 text-foreground",
  promo: "bg-primary text-primary-foreground",
}

function subscribeToDismissal(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("yummy-spot-announcement-change", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("yummy-spot-announcement-change", onChange)
  }
}

/** Dismissible site announcement that remembers dismissal in localStorage. */
export function AnnouncementBanner({
  message,
  linkText,
  linkHref,
  variant = "info",
}: AnnouncementBannerProps) {
  const storageKey = `yummy-spot-announcement-dismissed:${variant}:${message}`
  const dismissed = useSyncExternalStore(
    subscribeToDismissal,
    () => window.localStorage.getItem(storageKey) === "true",
    () => true
  )

  const dismiss = () => {
    window.localStorage.setItem(storageKey, "true")
    window.dispatchEvent(new Event("yummy-spot-announcement-change"))
  }

  if (dismissed) return null

  return (
    <aside role="status" className={cn("w-full", variantStyles[variant])}>
      <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center font-sans text-sm sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1">{message}</p>
        {linkText && linkHref && (
          <Link href={linkHref} className="min-h-11 shrink-0 inline-flex items-center font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {linkText}
          </Link>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
