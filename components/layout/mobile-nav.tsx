"use client"

import Link from "next/link"
import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { primaryNav } from "@/config/navigation"
import { Logo } from "@/components/shared/logo"
import { buttonClass } from "@/components/ui/button"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { useRequest } from "@/components/order/request-provider"

/** Full-screen, focus-trapped mobile navigation drawer (CSS animated). */
export function MobileNav() {
  // `modalActive` keeps the drawer mounted while its exit animation plays; `open` drives the visible state.
  const [open, setOpen] = useState(false)
  const [modalActive, setModalActive] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const { count, ready } = useRequest()

  useEffect(() => {
    if (!modalActive) return
    const opener = openerRef.current
    const focusable = () => drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable()?.[0]?.focus()

    const body = document.body
    const root = document.documentElement
    const previousBodyOverflow = body.style.overflow
    const previousRootOverflow = root.style.overflow
    body.style.overflow = "hidden"
    root.style.overflow = "hidden"

    const inertSiblings = Array.from(body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== portalRef.current)
      .map((element) => ({ element, wasInert: element.inert }))
    inertSiblings.forEach(({ element }) => { element.inert = true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== "Tab") return
      const elements = focusable()
      if (!elements?.length) return
      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]
      const focusIsOutside = !drawerRef.current?.contains(document.activeElement)
      if (event.shiftKey && (document.activeElement === firstElement || focusIsOutside)) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && (document.activeElement === lastElement || focusIsOutside)) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown, true)
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      body.style.overflow = previousBodyOverflow
      root.style.overflow = previousRootOverflow
      inertSiblings.forEach(({ element, wasInert }) => { element.inert = wasInert })
      opener?.focus()
    }
  }, [modalActive])

  // Unmount after the exit animation; the timer also covers the case where the drawer is hidden by a breakpoint.
  useEffect(() => {
    if (open || !modalActive) return
    const timeout = window.setTimeout(() => setModalActive(false), 260)
    return () => window.clearTimeout(timeout)
  }, [open, modalActive])

  useEffect(() => {
    if (!modalActive) return
    const desktopViewport = window.matchMedia("(min-width: 768px)")
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    desktopViewport.addEventListener("change", closeOnDesktop)
    return () => desktopViewport.removeEventListener("change", closeOnDesktop)
  }, [modalActive])

  const openDrawer = () => {
    setModalActive(true)
    setOpen(true)
  }
  const closeDrawer = () => setOpen(false)

  const drawer = (
    <div ref={portalRef} className={`fixed inset-0 z-[100] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close navigation menu"
        className={`fixed inset-0 z-0 h-full w-full cursor-default bg-overlay ${open ? "animate-fade-in" : "animate-fade-out"}`}
        onClick={closeDrawer}
      />
      <aside
        ref={drawerRef}
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-10 flex flex-col bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 ${open ? "animate-drawer-in" : "animate-drawer-out"}`}
      >
        <div className="mx-auto flex min-h-12 w-full max-w-3xl items-center justify-between border-b border-border-subtle pb-4">
          <Logo />
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile navigation links" className="mx-auto flex w-full max-w-3xl flex-1 overflow-y-auto py-6 sm:py-10">
          <ul className="my-auto w-full" role="list">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeDrawer}
                  className="group flex min-h-14 items-center justify-between border-b border-border-subtle px-1 font-serif text-2xl text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-16 sm:text-3xl"
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="font-sans text-lg text-muted-foreground transition-transform duration-150 group-hover:translate-x-1 group-hover:text-primary">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-auto grid w-full max-w-3xl shrink-0 gap-3 border-t border-border-subtle pt-5">
          <Link href="/order" onClick={closeDrawer} className={buttonClass({ size: "lg", className: "w-full" })}>
            Your request{ready && count > 0 ? ` (${count})` : ""}
          </Link>
          <WhatsAppButton tone="outline" className="w-full" />
        </div>
      </aside>
    </div>
  )

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation-drawer"
        onClick={openDrawer}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {modalActive && typeof document !== "undefined" ? createPortal(drawer, document.body) : null}
    </>
  )
}
