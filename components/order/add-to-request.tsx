"use client"

import { quantityStep, useRequest } from "./request-provider"
import type { Product } from "@/types/product"

const controlClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background font-sans text-lg font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** Adds a product to the order request, then lets the customer adjust its quantity in place. */
export function AddToRequest({ product }: { product: Product }) {
  const { lines, add, setQuantity, remove } = useRequest()
  const line = lines.find((item) => item.productId === product.id)

  if (!product.inStock) {
    return (
      <p className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-border px-4 font-sans text-sm text-muted-foreground">
        Not available right now
      </p>
    )
  }

  if (!line) {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 font-sans text-sm font-semibold text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Add to request
      </button>
    )
  }

  const step = quantityStep(line.priceUnit)
  return (
    <div className="mt-4 flex items-center justify-between gap-2" role="group" aria-label={`Quantity for ${product.name}`}>
      <div className="flex items-center gap-2">
        <button type="button" className={controlClass} aria-label={`Decrease ${product.name}`} onClick={() => (line.quantity - step < step ? remove(product.id) : setQuantity(product.id, line.quantity - step))}>
          &minus;
        </button>
        <span className="min-w-8 text-center font-sans text-sm font-semibold text-foreground" aria-live="polite">{line.quantity}</span>
        <button type="button" className={controlClass} aria-label={`Increase ${product.name}`} onClick={() => setQuantity(product.id, line.quantity + step)}>
          +
        </button>
      </div>
      <span className="font-sans text-xs font-medium text-success">In your request</span>
    </div>
  )
}
