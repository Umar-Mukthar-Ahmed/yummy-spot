"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils"
import { useAdmin } from "./admin-shell"
import { adminInput, adminLabel, formatDateTime, Message, PrimaryButton, SecondaryButton } from "./ui"

type Status = "new" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "completed" | "rejected" | "cancelled"

type OrderItem = { id: string; product_name: string; unit_price: number; price_unit: string; quantity: number; line_total: number; note: string | null }

type Order = {
  id: string
  reference: string
  status: Status
  customer_name: string
  customer_phone: string
  customer_email: string | null
  fulfilment_type: "delivery" | "pickup"
  delivery_area: string | null
  delivery_address: string | null
  requested_for: string
  notes: string | null
  subtotal: number
  currency: string
  needs_price_quote: boolean
  owner_notes: string | null
  rejection_reason: string | null
  created_at: string
  order_items: OrderItem[]
}

const statusLabel: Record<Status, string> = {
  new: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

const tabs = [
  { id: "new", label: "New", statuses: ["new"] },
  { id: "active", label: "In progress", statuses: ["confirmed", "preparing", "ready", "out_for_delivery"] },
  { id: "done", label: "Completed", statuses: ["completed"] },
  { id: "closed", label: "Closed", statuses: ["rejected", "cancelled"] },
  { id: "all", label: "All", statuses: [] },
] as const

/** Mirrors the database trigger; the database is the source of truth and rejects anything else. */
function nextStatuses(order: Order): Status[] {
  switch (order.status) {
    case "new": return ["confirmed", "rejected", "cancelled"]
    case "confirmed": return ["preparing", "cancelled"]
    case "preparing": return ["ready", "cancelled"]
    case "ready": return order.fulfilment_type === "delivery" ? ["out_for_delivery"] : ["completed"]
    case "out_for_delivery": return ["completed"]
    default: return []
  }
}

const actionLabel: Record<Status, string> = {
  new: "New",
  confirmed: "Confirm",
  preparing: "Start preparing",
  ready: "Mark ready",
  out_for_delivery: "Out for delivery",
  completed: "Mark completed",
  rejected: "Reject",
  cancelled: "Cancel order",
}

function customerMessage(order: Order): string {
  const name = order.customer_name
  const ref = order.reference
  switch (order.status) {
    case "confirmed": return `Hi ${name}, your order request ${ref} is confirmed. We'll keep you updated.`
    case "ready": return `Hi ${name}, your order ${ref} is ready.`
    case "out_for_delivery": return `Hi ${name}, your order ${ref} is on its way.`
    case "rejected": return `Hi ${name}, sorry, we can't take your order request ${ref}.${order.rejection_reason ? ` ${order.rejection_reason}` : ""}`
    case "cancelled": return `Hi ${name}, your order ${ref} has been cancelled.`
    default: return `Hi ${name}, this is about your order request ${ref}.`
  }
}

export function OrdersAdmin() {
  const { supabase } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("new")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    let active = true
    void supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) setError("Could not load orders.")
        else {
          setError(null)
          setOrders(data as Order[])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [supabase, version])

  useEffect(() => {
    const channel = supabase
      .channel("orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => reload())
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, reload])

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const entry of tabs) result[entry.id] = orders.filter((order) => entry.statuses.length === 0 || (entry.statuses as readonly string[]).includes(order.status)).length
    return result
  }, [orders])

  const visible = useMemo(() => {
    const statuses = tabs.find((entry) => entry.id === tab)?.statuses ?? []
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (statuses.length > 0 && !(statuses as readonly string[]).includes(order.status)) return false
      if (!term) return true
      return [order.reference, order.customer_name, order.customer_phone].some((value) => value.toLowerCase().includes(term))
    })
  }, [orders, tab, search])

  const selected = orders.find((order) => order.id === selectedId) ?? null

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Orders</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Order status">
        {tabs.map((entry) => (
          <button key={entry.id} type="button" role="tab" aria-selected={tab === entry.id} onClick={() => setTab(entry.id)} className={`min-h-11 rounded-full border px-4 font-sans text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === entry.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>
            {entry.label} <span className="opacity-75">({counts[entry.id] ?? 0})</span>
          </button>
        ))}
        <label className="ml-auto block w-full sm:w-64">
          <span className="sr-only">Search orders</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or reference" className={adminInput} />
        </label>
      </div>

      {error && <div className="mt-4"><Message kind="error">{error}</Message></div>}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ul className="space-y-2" role="list" aria-label="Orders">
          {loading && <li className="font-sans text-sm text-muted-foreground">Loading…</li>}
          {!loading && visible.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center font-sans text-sm text-muted-foreground">No orders here.</li>}
          {visible.map((order) => (
            <li key={order.id}>
              <button type="button" onClick={() => setSelectedId(order.id)} aria-pressed={selectedId === order.id} className={`w-full rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedId === order.id ? "border-primary bg-surface" : "border-border bg-surface-elevated hover:bg-surface"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-sm font-semibold text-foreground">{order.reference}</span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-sans text-xs text-muted-foreground">{statusLabel[order.status]}</span>
                </div>
                <p className="mt-1 font-sans text-sm text-foreground">{order.customer_name} · {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}</p>
                <p className="font-sans text-xs text-muted-foreground">Wanted {formatDateTime(order.requested_for)} · {order.fulfilment_type}</p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? <OrderDetail key={selected.id} order={selected} onChanged={reload} /> : (
          <div className="hidden rounded-xl border border-dashed border-border p-8 text-center font-sans text-sm text-muted-foreground lg:block">Select an order to see its details.</div>
        )}
      </div>
    </div>
  )
}

function OrderDetail({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const { supabase } = useAdmin()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState(order.rejection_reason ?? "")
  const [ownerNotes, setOwnerNotes] = useState(order.owner_notes ?? "")

  async function update(values: Record<string, unknown>, success: string) {
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.from("orders").update(values).eq("id", order.id)
    if (error) setMessage({ kind: "error", text: error.message })
    else {
      setMessage({ kind: "success", text: success })
      setRejecting(false)
      onChanged()
    }
    setBusy(false)
  }

  function changeStatus(status: Status) {
    if (status === "rejected") {
      setRejecting(true)
      return
    }
    void update({ status }, `Marked as ${statusLabel[status].toLowerCase()}.`)
  }

  const whatsappUrl = buildWhatsAppUrl(order.customer_phone, customerMessage(order))

  return (
    <section aria-label={`Order ${order.reference}`} className="space-y-4 rounded-xl border border-border bg-surface-elevated p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl text-foreground">{order.reference}</h2>
          <p className="font-sans text-xs text-muted-foreground">Received {formatDateTime(order.created_at)}</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 font-sans text-xs font-medium text-foreground">{statusLabel[order.status]}</span>
      </header>

      <dl className="grid gap-x-4 gap-y-2 font-sans text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-muted-foreground">Customer</dt><dd className="text-foreground">{order.customer_name}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Phone</dt><dd><a href={`tel:${order.customer_phone}`} className="text-primary underline">{order.customer_phone}</a></dd></div>
        {order.customer_email && <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="break-all text-foreground">{order.customer_email}</dd></div>}
        <div><dt className="text-xs text-muted-foreground">Wanted for</dt><dd className="text-foreground">{formatDateTime(order.requested_for)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">{order.fulfilment_type === "delivery" ? "Delivery" : "Pickup"}</dt><dd className="whitespace-pre-line text-foreground">{order.fulfilment_type === "delivery" ? [order.delivery_area, order.delivery_address].filter(Boolean).join("\n") : "Customer collects"}</dd></div>
        {order.notes && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Customer notes</dt><dd className="whitespace-pre-line text-foreground">{order.notes}</dd></div>}
      </dl>

      <div>
        <h3 className="font-sans text-sm font-semibold text-foreground">Items</h3>
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border" role="list">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 p-3 font-sans text-sm">
              <span className="text-foreground">{item.quantity} × {item.product_name}{item.note && <span className="block text-xs text-muted-foreground">{item.note}</span>}</span>
              <span className="shrink-0 text-muted-foreground">{item.unit_price > 0 ? formatPrice(item.line_total, order.currency) : "On request"}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-sans text-sm text-foreground">Estimated total: <strong>{formatPrice(order.subtotal, order.currency)}</strong>{order.needs_price_quote ? " + items priced on request" : ""}</p>
      </div>

      {order.rejection_reason && <p className="font-sans text-sm text-muted-foreground">Rejection reason: {order.rejection_reason}</p>}
      {message && <Message kind={message.kind}>{message.text}</Message>}

      {nextStatuses(order).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nextStatuses(order).map((status) => (
            status === "confirmed" || status === "preparing" || status === "ready" || status === "out_for_delivery" || status === "completed"
              ? <PrimaryButton key={status} disabled={busy} onClick={() => changeStatus(status)}>{actionLabel[status]}</PrimaryButton>
              : <SecondaryButton key={status} disabled={busy} onClick={() => changeStatus(status)}>{actionLabel[status]}</SecondaryButton>
          ))}
        </div>
      )}

      {rejecting && (
        <div className="space-y-2 rounded-xl border border-border p-3">
          <label htmlFor="reject-reason" className={adminLabel}>Reason for rejecting (shared with the customer if you message them)</label>
          <textarea id="reject-reason" rows={2} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} className={adminInput} />
          <div className="flex gap-2">
            <PrimaryButton disabled={busy || reason.trim().length === 0} onClick={() => void update({ status: "rejected", rejection_reason: reason.trim() }, "Order rejected.")}>Confirm rejection</PrimaryButton>
            <SecondaryButton onClick={() => setRejecting(false)}>Keep order</SecondaryButton>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="owner-notes" className={adminLabel}>Your private notes</label>
        <textarea id="owner-notes" rows={2} maxLength={1000} value={ownerNotes} onChange={(event) => setOwnerNotes(event.target.value)} className={adminInput} />
        <SecondaryButton className="mt-2" disabled={busy || ownerNotes === (order.owner_notes ?? "")} onClick={() => void update({ owner_notes: ownerNotes.trim() || null }, "Notes saved.")}>Save notes</SecondaryButton>
      </div>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full bg-whatsapp px-5 font-sans text-sm font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Message customer on WhatsApp</a>
    </section>
  )
}
