"use client"

import { quantityStep, useRequest } from "./request-provider"
import type { Product } from "@/types/product"

const controlClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background font-sans text-lg font-semibold text-foreground transition duration-150 hover:bg-surface active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-sans text-sm font-semibold text-primary-foreground transition duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
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
        <span key={line.quantity} className="animate-pop min-w-8 text-center font-sans text-sm font-semibold text-foreground" aria-live="polite">{line.quantity}</span>
        <button type="button" className={controlClass} aria-label={`Increase ${product.name}`} onClick={() => setQuantity(product.id, line.quantity + step)}>
          +
        </button>
      </div>
      <span className="inline-flex items-center gap-1 font-sans text-xs font-medium text-success">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        In your request
      </span>
    </div>
  )
}
