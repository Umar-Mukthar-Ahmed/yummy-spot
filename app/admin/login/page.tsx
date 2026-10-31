"use client"

import { useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase/browser"
import { adminInput, adminLabel, PrimaryButton } from "@/components/admin/ui"

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const supabase = getSupabaseBrowser()
    if (!supabase || busy) return
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    })
    // The shell redirects to /admin/orders once the session is confirmed as an admin.
    if (signInError) setError("That email and password did not match.")
    setBusy(false)
  }

  return (
    <div className="mx-auto grid min-h-dvh max-w-sm content-center px-4">
      <h1 className="font-serif text-3xl text-foreground">Kitchen admin</h1>
      <p className="mt-2 font-sans text-sm text-muted-foreground">Sign in to manage orders and the menu.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className={adminLabel}>Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className={adminInput} />
        </div>
        <div>
          <label htmlFor="password" className={adminLabel}>Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={adminInput} />
        </div>
        {error && <p role="alert" className="font-sans text-sm text-destructive">{error}</p>}
        <PrimaryButton type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</PrimaryButton>
      </form>
    </div>
  )
}
