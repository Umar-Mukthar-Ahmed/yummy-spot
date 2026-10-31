"use client"

import { createContext, useContext, useMemo, useSyncExternalStore } from "react"
import type { Product } from "@/types/product"
import type { MediaAsset } from "@/types/media"

export type RequestLine = {
  productId: string
  name: string
  unitPrice: number
  priceUnit: string
  currency: string
  quantity: number
  leadTimeHours: number
  image: Pick<MediaAsset, "provider" | "publicId" | "url" | "alt"> | null
}

type RequestContextValue = {
  lines: RequestLine[]
  /** False until the browser's saved request has been read, so server and first client render match. */
  ready: boolean
  count: number
  add: (product: Product) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const STORAGE_KEY = "ys-request-v1"
const MAX_LINES = 20
const MAX_QUANTITY = 99
const EMPTY: RequestLine[] = []

/** Per-kg items can be requested in half steps; everything else in whole units. */
export function quantityStep(priceUnit: string): number {
  return priceUnit === "per kg" ? 0.5 : 1
}

function parse(raw: string | null): RequestLine[] {
  if (!raw) return EMPTY
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return EMPTY
    return parsed.flatMap((item: unknown): RequestLine[] => {
      if (typeof item !== "object" || item === null) return []
      const line = item as Partial<RequestLine>
      if (typeof line.productId !== "string" || typeof line.name !== "string") return []
      if (typeof line.quantity !== "number" || line.quantity <= 0) return []
      return [{
        productId: line.productId,
        name: line.name,
        unitPrice: typeof line.unitPrice === "number" ? line.unitPrice : 0,
        priceUnit: typeof line.priceUnit === "string" ? line.priceUnit : "per piece",
        currency: typeof line.currency === "string" ? line.currency : "INR",
        quantity: Math.min(line.quantity, MAX_QUANTITY),
        leadTimeHours: typeof line.leadTimeHours === "number" ? line.leadTimeHours : 0,
        image: line.image ?? null,
      }]
    }).slice(0, MAX_LINES)
  } catch {
    return EMPTY
  }
}

/* A tiny external store over localStorage; it keeps working in memory if storage is blocked. */
let loaded = false
let current: RequestLine[] = EMPTY
const listeners = new Set<() => void>()

function read(): RequestLine[] {
  if (!loaded) {
    try {
      current = parse(window.localStorage.getItem(STORAGE_KEY))
    } catch {
      current = EMPTY
    }
    loaded = true
  }
  return current
}

function commit(next: RequestLine[]) {
  current = next.length > 0 ? next : EMPTY
  loaded = true
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    /* storage can be unavailable (private mode); the request still works for this visit */
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      loaded = false
      listener()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

const subscribeNever = () => () => {}

function add(product: Product) {
  const lines = read()
  if (lines.some((line) => line.productId === product.id) || lines.length >= MAX_LINES) return
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0] ?? null
  commit([...lines, {
    productId: product.id,
    name: product.name,
    unitPrice: product.salePrice ?? product.price,
    priceUnit: product.priceUnit,
    currency: product.currency,
    quantity: 1,
    leadTimeHours: product.orderLeadTimeHours,
    image: image ? { provider: image.provider, publicId: image.publicId, url: image.url, alt: image.alt } : null,
  }])
}

function setQuantity(productId: string, quantity: number) {
  commit(read().map((line) => {
    if (line.productId !== productId) return line
    return { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(quantityStep(line.priceUnit), quantity)) }
  }))
}

function remove(productId: string) {
  commit(read().filter((line) => line.productId !== productId))
}

function clear() {
  commit(EMPTY)
}

const RequestContext = createContext<RequestContextValue | null>(null)

/** Holds the multi-item order request while the customer browses. */
export function RequestProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY)
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false)

  const value = useMemo<RequestContextValue>(
    () => ({ lines, ready, count: lines.length, add, setQuantity, remove, clear }),
    [lines, ready]
  )

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
}

export function useRequest(): RequestContextValue {
  const context = useContext(RequestContext)
  if (!context) throw new Error("useRequest must be used inside RequestProvider")
  return context
}
