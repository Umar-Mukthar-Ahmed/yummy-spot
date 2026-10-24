"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { primaryNav } from "@/config/navigation"
import { Logo } from "@/components/shared/logo"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

/** Full-screen, focus-trapped mobile navigation drawer. */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [modalActive, setModalActive] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!modalActive) return
    const opener = openerRef.current
    const focusable = () => drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable()?.[0]
    first?.focus()

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
    <div
      ref={portalRef}
      className={`fixed inset-0 z-[100] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <AnimatePresence onExitComplete={() => setModalActive(false)}>
        {open && (
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            tabIndex={-1}
            aria-label="Close navigation menu"
            className="fixed inset-0 z-0 h-full w-full cursor-default bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
            onClick={closeDrawer}
          />
        )}
        {open && (
          <motion.aside
            key="mobile-nav-drawer"
        ref={drawerRef}
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="fixed inset-0 z-10 flex flex-col bg-background px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8"
        initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="mx-auto flex w-full max-w-3xl min-h-12 items-center justify-between border-b border-border-subtle pb-4">
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
          <ul className="my-auto w-full space-y-1" role="list">
            {primaryNav.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeDrawer}
                  className="group flex min-h-14 items-center justify-between border-b border-border-subtle px-1 font-serif text-2xl text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-16 sm:text-3xl"
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="font-sans text-sm text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary">0{index + 1} ↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-auto w-full max-w-3xl shrink-0 border-t border-border-subtle pt-5">
          <WhatsAppButton className="w-full" />
        </div>
          </motion.aside>
        )}
      </AnimatePresence>
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
