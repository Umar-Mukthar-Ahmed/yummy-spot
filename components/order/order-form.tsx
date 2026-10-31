"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { env } from "@/lib/env"
import { loadPublicSettings, type PublicSettings } from "@/lib/catalog"
import { formatPrice } from "@/lib/utils"
import { issuesToErrors, MAX_DAYS_AHEAD, normalizePhone, orderRequestSchema } from "@/lib/validation/order"
import { MediaImage } from "@/components/shared/media-image"
import { Turnstile } from "./turnstile"
import { quantityStep, useRequest } from "./request-provider"

const inputClass =
  "min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 font-sans text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
const labelClass = "mb-1.5 block font-sans text-sm font-medium text-foreground"
const stepButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background font-sans text-lg font-semibold text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

type FieldErrors = Record<string, string>
type Fulfilment = "delivery" | "pickup"

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error: string | undefined; hint?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 font-sans text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 font-sans text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Multi-item order request: review items, enter details, pass Turnstile, send to /api/orders. */
export function OrderForm() {
  const { lines, ready, setQuantity, remove, clear } = useRequest()
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const idempotencyKey = useRef<string>("")
  const mountedAt = useRef(0)
  const formRef = useRef<HTMLFormElement>(null)
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery")
  const [token, setToken] = useState<string | null>(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState<{ reference: string } | null>(null)
  // Wall-clock time lives in state (set from timers) so rendering stays pure.
  const [now, setNow] = useState(0)

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID()
    mountedAt.current = performance.now()
    void loadPublicSettings().then(setSettings)
    const first = window.setTimeout(() => setNow(Date.now()), 0)
    const interval = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
    }
  }, [])

  const leadHours = useMemo(() => lines.reduce((max, line) => Math.max(max, line.leadTimeHours), 0), [lines])
  const earliest = now > 0 ? toLocalInput(new Date(now + leadHours * 3_600_000 + 60_000)) : undefined
  const latest = now > 0 ? toLocalInput(new Date(now + MAX_DAYS_AHEAD * 86_400_000)) : undefined
  const currency = lines[0]?.currency ?? "INR"
  const estimate = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const hasQuoteItems = lines.some((line) => line.unitPrice === 0)
  const notAccepting = settings !== null && !settings.acceptingOrders
  const areas = settings?.deliveryAreas ?? []

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !token) return
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? "").trim()
    const requestedRaw = text("requestedFor")

    setSubmitting(true)
    setErrors({})
    setFormError(null)

    const requestedFor = requestedRaw ? new Date(requestedRaw) : null
    const payload = {
      idempotencyKey: idempotencyKey.current,
      turnstileToken: token,
      website: text("website"),
      elapsedMs: Math.round(performance.now() - mountedAt.current),
      customer: { name: text("name"), phone: text("phone"), email: text("email") },
      fulfilment: {
        type: fulfilment,
        area: fulfilment === "delivery" ? text("area") : "",
        address: fulfilment === "delivery" ? text("address") : "",
        requestedFor: requestedFor && !Number.isNaN(requestedFor.getTime()) ? requestedFor.toISOString() : "",
      },
      notes: text("notes"),
      items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    }

    // Same schema the API uses, so mistakes are caught here without spending the single-use Turnstile token.
    const parsed = orderRequestSchema.safeParse(payload)
    const found: FieldErrors = parsed.success ? {} : issuesToErrors(parsed.error)
    if (!normalizePhone(payload.customer.phone, env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE)) {
      found["customer.phone"] = payload.customer.phone ? "Please enter a valid phone number" : "Please enter your phone number"
    }
    if (requestedFor && !Number.isNaN(requestedFor.getTime())) {
      const time = requestedFor.getTime()
      if (time < Date.now() + leadHours * 3_600_000) found["fulfilment.requestedFor"] = "Please choose a later time"
      else if (time > Date.now() + MAX_DAYS_AHEAD * 86_400_000) found["fulfilment.requestedFor"] = `Please choose a date within the next ${MAX_DAYS_AHEAD} days`
    }
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setSubmitting(false)
      window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = (await response.json().catch(() => ({}))) as {
        reference?: string
        errors?: FieldErrors
        error?: string
        productIds?: string[]
        earliest?: string | null
        notice?: string | null
      }

      if (response.ok && body.reference) {
        clear()
        setDone({ reference: body.reference })
        return
      }

      if (response.status === 400 && body.errors) setErrors(body.errors)
      else if (response.status === 422 && body.error === "unavailable") {
        const names = lines.filter((line) => body.productIds?.includes(line.productId)).map((line) => line.name)
        setFormError(`${names.join(", ") || "Some items"} can no longer be ordered. Please remove them and try again.`)
      } else if (response.status === 422 && body.error === "lead_time") {
        setFormError(body.earliest ? `These items need more notice. The earliest time is ${new Date(body.earliest).toLocaleString()}.` : "These items need more notice. Please choose a later time.")
      } else if (response.status === 429) setFormError("Too many requests from this number or device. Please try again later.")
      else if (response.status === 503) setFormError(body.notice ?? "We are not taking online requests right now. Please check back soon.")
      else if (response.status === 403) setFormError("We could not verify you are human. Please try again.")
      else if (response.status === 400) setFormError("Please check your details and the time you chose, then try again.")
      else setFormError("Something went wrong. Please try again in a moment.")
      setResetSignal((value) => value + 1)
    } catch {
      setFormError("We could not reach the server. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) return <p className="font-sans text-sm text-muted-foreground" role="status">Loading your request…</p>

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8" role="status">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Request received</p>
        <h2 className="mt-2 font-serif text-2xl text-foreground">Thank you!</h2>
        <p className="mt-3 font-sans text-base text-muted-foreground">
          Your reference is <strong className="text-foreground">{done.reference}</strong>. The kitchen will review your request and contact you on the phone number you gave to confirm the details and final price.
        </p>
        <Link href="/menu" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Back to the menu</Link>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
        <p className="font-sans text-base text-muted-foreground">Your request is empty. Choose a few dishes from the menu to get started.</p>
        <Link href="/menu" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Browse the menu</Link>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" noValidate>
      <section aria-labelledby="items-heading" className="space-y-4">
        <h2 id="items-heading" className="font-serif text-xl text-foreground">Your items</h2>
        <ul className="space-y-3" role="list">
          {lines.map((line) => {
            const step = quantityStep(line.priceUnit)
            return (
              <li key={line.productId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                  <MediaImage image={line.image} alt={line.name} sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-base text-foreground">{line.name}</p>
                  <p className="font-sans text-xs text-muted-foreground">{line.unitPrice > 0 ? `${formatPrice(line.unitPrice, line.currency)} / ${line.priceUnit}` : "Price confirmed by the kitchen"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className={stepButton} aria-label={`Decrease ${line.name}`} onClick={() => (line.quantity - step < step ? remove(line.productId) : setQuantity(line.productId, line.quantity - step))}>&minus;</button>
                    <span className="min-w-8 text-center font-sans text-sm font-semibold" aria-live="polite">{line.quantity}</span>
                    <button type="button" className={stepButton} aria-label={`Increase ${line.name}`} onClick={() => setQuantity(line.productId, line.quantity + step)}>+</button>
                    <button type="button" onClick={() => remove(line.productId)} className="ml-auto min-h-11 px-2 font-sans text-xs font-medium text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Remove</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="font-sans text-sm text-muted-foreground">
          Estimated total: <strong className="text-foreground">{formatPrice(estimate, currency)}</strong>{hasQuoteItems ? " plus items priced on request" : ""}. The kitchen confirms the final price.
        </p>
        <Link href="/menu" className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline">+ Add more dishes</Link>
      </section>

      <section aria-labelledby="details-heading" className="space-y-5">
        <h2 id="details-heading" className="font-serif text-xl text-foreground">Your details</h2>

        {notAccepting && (
          <p role="alert" className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground">
            {settings?.orderNotice ?? "We are not taking online requests right now. Please check back soon."}
          </p>
        )}

        <Field id="name" label="Name" error={errors["customer.name"]}>
          <input id="name" name="name" autoComplete="name" required maxLength={80} className={inputClass} aria-invalid={Boolean(errors["customer.name"])} aria-describedby={errors["customer.name"] ? "name-error" : undefined} />
        </Field>
        <Field id="phone" label="Phone number" error={errors["customer.phone"]} hint={env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE ? "The kitchen will contact you on this number." : "Include your country code, for example +1 555 0100."}>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputClass} aria-invalid={Boolean(errors["customer.phone"])} aria-describedby={errors["customer.phone"] ? "phone-error" : "phone-hint"} />
        </Field>
        <Field id="email" label="Email (optional)" error={errors["customer.email"]}>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} className={inputClass} aria-invalid={Boolean(errors["customer.email"])} aria-describedby={errors["customer.email"] ? "email-error" : undefined} />
        </Field>

        <fieldset>
          <legend className={labelClass}>How would you like to receive it?</legend>
          <div className="flex gap-2">
            {(["delivery", "pickup"] as const).map((option) => (
              <label key={option} className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border px-4 font-sans text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${fulfilment === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
                <input type="radio" name="fulfilment" value={option} checked={fulfilment === option} onChange={() => setFulfilment(option)} className="sr-only" />
                {option === "delivery" ? "Delivery" : "Pickup"}
              </label>
            ))}
          </div>
        </fieldset>

        {fulfilment === "delivery" && (
          <>
            <Field id="area" label={areas.length > 0 ? "Delivery area" : "Area (optional)"} error={errors["fulfilment.area"]}>
              {areas.length > 0 ? (
                <select id="area" name="area" className={inputClass} defaultValue="">
                  <option value="" disabled>Select your area</option>
                  {areas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              ) : (
                <input id="area" name="area" maxLength={120} className={inputClass} />
              )}
            </Field>
            <Field id="address" label="Delivery address" error={errors["fulfilment.address"]}>
              <textarea id="address" name="address" rows={3} maxLength={300} className={inputClass} aria-invalid={Boolean(errors["fulfilment.address"])} aria-describedby={errors["fulfilment.address"] ? "address-error" : undefined} />
            </Field>
          </>
        )}

        <Field id="requestedFor" label="When do you need it?" error={errors["fulfilment.requestedFor"]} hint={leadHours > 0 ? `Your items need about ${leadHours} ${leadHours === 1 ? "hour" : "hours"} of notice.` : undefined}>
          <input id="requestedFor" name="requestedFor" type="datetime-local" min={earliest} max={latest} required className={inputClass} aria-invalid={Boolean(errors["fulfilment.requestedFor"])} aria-describedby={errors["fulfilment.requestedFor"] ? "requestedFor-error" : leadHours > 0 ? "requestedFor-hint" : undefined} />
        </Field>

        <Field id="notes" label="Notes for the kitchen (optional)" error={errors.notes}>
          <textarea id="notes" name="notes" rows={3} maxLength={500} className={inputClass} />
        </Field>

        {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        {siteKey ? (
          <Turnstile siteKey={siteKey} onToken={setToken} resetSignal={resetSignal} />
        ) : (
          <p role="alert" className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-sm text-muted-foreground">Online requests are not set up yet.</p>
        )}

        {formError && <p role="alert" className="rounded-xl border border-destructive/40 bg-surface px-4 py-3 font-sans text-sm text-destructive">{formError}</p>}

        <button type="submit" disabled={submitting || !token || notAccepting || !siteKey} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Sending…" : "Send order request"}
        </button>
        <p className="font-sans text-xs text-muted-foreground">We only use your details to prepare and deliver your order.</p>
      </section>
    </form>
  )
}
