"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "./admin-shell"
import { adminInput, Checkbox, Field, Message, PrimaryButton } from "./ui"

type SettingsRow = {
  whatsapp_number: string | null
  contact_email: string | null
  address: string | null
  delivery_areas: string[]
  instagram_url: string | null
  facebook_url: string | null
  accepting_orders: boolean
  order_notice: string | null
}

type FormState = {
  whatsapp: string
  email: string
  address: string
  areas: string
  instagram: string
  facebook: string
  accepting: boolean
  notice: string
}

const toForm = (row: SettingsRow): FormState => ({
  whatsapp: row.whatsapp_number ?? "", email: row.contact_email ?? "", address: row.address ?? "",
  areas: row.delivery_areas.join("\n"), instagram: row.instagram_url ?? "", facebook: row.facebook_url ?? "",
  accepting: row.accepting_orders, notice: row.order_notice ?? "",
})

export function SettingsAdmin() {
  const { supabase } = useAdmin()
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    void supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (error || !data) setMessage({ kind: "error", text: "Could not load settings. Make sure the database migrations have been applied." })
      else setForm(toForm(data as SettingsRow))
    })
  }, [supabase])

  if (!form) return <div><h1 className="font-serif text-2xl text-foreground">Settings</h1>{message ? <div className="mt-4"><Message kind={message.kind}>{message.text}</Message></div> : <p className="mt-4 font-sans text-sm text-muted-foreground">Loading…</p>}</div>

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => (current ? { ...current, [key]: value } : current))

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.from("site_settings").update({
      whatsapp_number: form.whatsapp.trim() || null,
      contact_email: form.email.trim() || null,
      address: form.address.trim() || null,
      delivery_areas: form.areas.split("\n").map((area) => area.trim()).filter(Boolean),
      instagram_url: form.instagram.trim() || null,
      facebook_url: form.facebook.trim() || null,
      accepting_orders: form.accepting,
      order_notice: form.notice.trim() || null,
    }).eq("id", 1)
    setSaving(false)
    setMessage(error ? { kind: "error", text: error.message } : { kind: "success", text: "Settings saved." })
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Settings</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-5 rounded-xl border border-border bg-surface-elevated p-4">
        <fieldset className="space-y-3">
          <legend className="font-sans text-sm font-semibold text-foreground">Taking orders</legend>
          <Checkbox id="s-accepting" label="Accept online order requests" checked={form.accepting} onChange={(value) => set("accepting", value)} />
          <Field id="s-notice" label="Message shown when orders are paused (optional)"><input id="s-notice" maxLength={200} value={form.notice} onChange={(event) => set("notice", event.target.value)} className={adminInput} /></Field>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="s-whatsapp" label="WhatsApp number" hint="International format, digits only."><input id="s-whatsapp" inputMode="tel" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} className={adminInput} /></Field>
          <Field id="s-email" label="Contact email"><input id="s-email" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} className={adminInput} /></Field>
          <Field id="s-instagram" label="Instagram link"><input id="s-instagram" type="url" value={form.instagram} onChange={(event) => set("instagram", event.target.value)} className={adminInput} /></Field>
          <Field id="s-facebook" label="Facebook link"><input id="s-facebook" type="url" value={form.facebook} onChange={(event) => set("facebook", event.target.value)} className={adminInput} /></Field>
        </div>

        <Field id="s-address" label="Pickup address"><textarea id="s-address" rows={2} value={form.address} onChange={(event) => set("address", event.target.value)} className={adminInput} /></Field>
        <Field id="s-areas" label="Delivery areas" hint="One per line. Customers choose from this list; leave empty to let them type their area."><textarea id="s-areas" rows={4} value={form.areas} onChange={(event) => set("areas", event.target.value)} className={adminInput} /></Field>

        {message && <Message kind={message.kind}>{message.text}</Message>}
        <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</PrimaryButton>
      </form>
    </div>
  )
}
