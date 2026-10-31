"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseBrowser } from "@/lib/supabase/browser"

type AdminContextValue = {
  supabase: SupabaseClient
  email: string
  /** Fresh access token for calls to our own API routes. */
  getToken: () => Promise<string>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext)
  if (!context) throw new Error("useAdmin must be used inside AdminShell")
  return context
}

type Gate = "loading" | "unconfigured" | "signed-out" | "denied" | "ready"

const navItems = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
] as const

/** Client-side auth gate for /admin. Real protection is Supabase RLS; this only decides what to render. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowser()
  const pathname = usePathname()
  const router = useRouter()
  const [gate, setGate] = useState<Gate>(supabase ? "loading" : "unconfigured")
  const [email, setEmail] = useState("")
  const onLogin = pathname === "/admin/login"

  useEffect(() => {
    if (!supabase) return
    let active = true

    async function evaluate(hasSession: boolean, sessionEmail: string) {
      if (!supabase) return
      if (!hasSession) {
        if (active) setGate("signed-out")
        return
      }
      const { data, error } = await supabase.rpc("is_admin")
      if (!active) return
      setEmail(sessionEmail)
      setGate(!error && data === true ? "ready" : "denied")
    }

    void supabase.auth.getSession().then(({ data }) => evaluate(Boolean(data.session), data.session?.user.email ?? ""))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void evaluate(Boolean(session), session?.user.email ?? "")
    })
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (gate === "signed-out" && !onLogin) router.replace("/admin/login")
    if (gate === "ready" && onLogin) router.replace("/admin/orders")
  }, [gate, onLogin, router])

  const getToken = useCallback(async () => {
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
    return data.session?.access_token ?? ""
  }, [supabase])

  const value = useMemo<AdminContextValue | null>(
    () => (supabase ? { supabase, email, getToken } : null),
    [supabase, email, getToken]
  )

  if (gate === "unconfigured") {
    return <Notice title="Admin is not configured">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.</Notice>
  }
  if (onLogin && gate !== "ready" && gate !== "denied") return <main id="main-content" className="min-h-dvh bg-background">{children}</main>
  if (gate === "loading" || gate === "signed-out") return <Notice title="Loading…" />
  if (gate === "denied") {
    return (
      <Notice title="No admin access">
        This account is signed in but is not an admin. Ask the site owner to add it to the admin list.
        <button type="button" onClick={() => void supabase?.auth.signOut()} className="mt-4 block min-h-11 font-sans text-sm font-semibold text-primary underline">Sign out</button>
      </Notice>
    )
  }
  if (!value) return null

  return (
    <AdminContext.Provider value={value}>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 px-4 py-2">
            <span className="font-serif text-lg">Kitchen admin</span>
            <nav aria-label="Admin" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:order-none md:mx-0 md:w-auto md:flex-1 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="ml-auto flex items-center gap-3 md:ml-0">
              <Link href="/" className="inline-flex min-h-11 items-center font-sans text-sm text-muted-foreground hover:text-foreground">View site</Link>
              <button type="button" onClick={() => void supabase?.auth.signOut()} className="min-h-11 font-sans text-sm text-muted-foreground underline hover:text-foreground" aria-label={`Sign out ${email}`}>Sign out</button>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 outline-none">{children}</main>
      </div>
    </AdminContext.Provider>
  )
}

function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main id="main-content" className="grid min-h-dvh place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">{title}</h1>
        {children && <div className="mt-3 font-sans text-sm text-muted-foreground">{children}</div>}
      </div>
    </main>
  )
}
