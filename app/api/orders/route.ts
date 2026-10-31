import "server-only"
import { after, NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server-env"
import { getSupabaseService } from "@/lib/supabase/server"
import { issuesToErrors, normalizePhone, orderRequestSchema } from "@/lib/validation/order"

const MAX_BODY_BYTES = 20_000
const MIN_FILL_MS = 3_000

function reply(body: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, ...(headers ? { headers } : {}) })
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const form = new URLSearchParams({ secret, response: token })
  if (ip) form.set("remoteip", ip)
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5_000),
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

async function notifyTelegram(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    /* alerts are best-effort; the order is already saved */
  }
}

type RpcResult = {
  ok: boolean
  code?: string
  duplicate?: boolean
  reference?: string
  subtotal?: number
  currency?: string
  needsPriceQuote?: boolean
  notice?: string | null
  productIds?: string[]
  earliest?: string
  customerName?: string
  requestedFor?: string
  summary?: { name: string; quantity: number }[]
}

export async function POST(request: Request) {
  const config = getServerEnv()
  const supabase = getSupabaseService()
  if (!supabase || !config.turnstileSecret || !config.ipHashSalt) return reply({ error: "unavailable" }, 503)

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return reply({ error: "too_large" }, 413)

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return reply({ error: "invalid" }, 400)
  }

  const parsed = orderRequestSchema.safeParse(json)
  if (!parsed.success) return reply({ error: "invalid", errors: issuesToErrors(parsed.error) }, 400)
  const order = parsed.data

  // Bots tend to fill hidden fields and submit instantly; real people do neither.
  if (order.website || order.elapsedMs < MIN_FILL_MS) return reply({ error: "rejected" }, 403)

  const phone = normalizePhone(order.customer.phone, config.defaultCountryCode)
  if (!phone) return reply({ error: "invalid", errors: { "customer.phone": "Please enter a valid phone number" } }, 400)

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? ""
  if (!(await verifyTurnstile(config.turnstileSecret, order.turnstileToken, ip))) return reply({ error: "rejected" }, 403)

  const { data, error } = await supabase.rpc("create_order", {
    p_payload: {
      idempotencyKey: order.idempotencyKey,
      customer: { name: order.customer.name, phone, email: order.customer.email ?? "" },
      fulfilment: {
        type: order.fulfilment.type,
        area: order.fulfilment.area ?? "",
        address: order.fulfilment.address ?? "",
        requestedFor: order.fulfilment.requestedFor,
      },
      notes: order.notes ?? "",
      items: order.items,
    },
    p_ip_hash: ip ? await sha256Hex(`${config.ipHashSalt}:${ip}`) : null,
  })

  if (error || !data) {
    console.error("create_order failed", error?.message)
    return reply({ error: "server_error" }, 500)
  }

  const result = data as RpcResult
  if (result.ok) {
    if (!result.duplicate && config.telegramToken && config.telegramChatId) {
      const items = (result.summary ?? []).map((item) => `- ${item.quantity} x ${item.name}`).join("\n")
      const when = result.requestedFor ? new Date(result.requestedFor).toUTCString() : "-"
      const text = `New order request ${result.reference}\n${result.customerName ?? ""}\n${items}\nWanted for: ${when}`
      after(() => notifyTelegram(config.telegramToken, config.telegramChatId, text))
    }
    return reply(
      { reference: result.reference, status: "new", subtotal: result.subtotal, currency: result.currency, needsPriceQuote: result.needsPriceQuote ?? false },
      result.duplicate ? 200 : 201
    )
  }

  switch (result.code) {
    case "not_accepting":
      return reply({ error: "not_accepting", notice: result.notice ?? null }, 503)
    case "unavailable":
      return reply({ error: "unavailable", productIds: result.productIds ?? [] }, 422)
    case "lead_time":
      return reply({ error: "lead_time", earliest: result.earliest ?? null }, 422)
    case "rate_limited":
      return reply({ error: "rate_limited" }, 429, { "Retry-After": "3600" })
    default:
      return reply({ error: "invalid" }, 400)
  }
}
