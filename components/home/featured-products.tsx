"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useCatalog } from "@/hooks/use-catalog"
import { formatPrice } from "@/lib/utils"
import { MediaImage } from "@/components/shared/media-image"
import type { Product } from "@/types/product"

const placeholderTiles = Array.from({ length: 6 }, (_, index) => index)

/** Featured and bestselling dishes from the published catalog; neutral placeholders until it loads or is empty. */
export function FeaturedProducts() {
  const state = useCatalog()
  const featured = useMemo(
    () => (state.status === "ready"
      ? state.catalog.products.filter((product) => product.labels.includes("featured") || product.labels.includes("bestseller")).slice(0, 6)
      : []),
    [state]
  )

  if (featured.length > 0) {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4" role="list">
        {featured.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
      </ul>
    )
  }

  if (state.status !== "loading") {
    return (
      <p className="font-sans text-sm text-muted-foreground" role="status">
        {state.status === "unavailable" ? "The menu is not available right now." : "Dishes will appear here once they are published."}{" "}
        <Link href="/menu" className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline">Open the menu</Link>
      </p>
    )
  }

  return (
    <>
      <p className="sr-only" role="status">Loading featured dishes.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4" role="list" aria-label="Featured dish placeholders">
        {placeholderTiles.map((tile) => <li key={tile} aria-hidden="true"><ProductCardPlaceholder /></li>)}
      </ul>
    </>
  )
}

function FeaturedProductCard({ product }: { product: Product }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <div className="relative aspect-[1.3/1] overflow-hidden bg-surface">
        <MediaImage image={image} alt={product.name} sizes="(min-width: 1024px) 16vw, 48vw" className="object-cover" />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-serif text-base text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-9 font-sans text-xs text-muted-foreground">{product.shortDescription}</p>
        <p className="mt-2 font-sans text-sm font-semibold text-primary">{product.price > 0 ? formatPrice(product.salePrice ?? product.price, product.currency) : "Ask for today's price"}</p>
        <Link href={`/menu?category=${encodeURIComponent(product.categorySlug)}&product=${encodeURIComponent(product.slug)}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-success px-3 font-sans text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View details</Link>
      </div>
    </li>
  )
}

function ProductCardPlaceholder() {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <div className="aspect-[1.3/1] animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-9 rounded-full bg-muted" />
      </div>
    </div>
  )
}
