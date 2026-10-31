"use client"

import Link from "next/link"
import { useMemo, type CSSProperties } from "react"
import { useCatalog } from "@/hooks/use-catalog"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { MediaImage } from "@/components/shared/media-image"
import { Price } from "@/components/shared/price"
import { SectionHeading } from "./section-heading"
import type { Product } from "@/types/product"

const MAX_FEATURED = 8
const skeletonTiles = Array.from({ length: 4 }, (_, index) => index)
const linkClass = "inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** Featured and bestselling dishes from the published catalog. Hidden when there are none or the catalog is unavailable. */
export function FeaturedSection() {
  const state = useCatalog()
  const featured = useMemo(
    () => (state.status === "ready"
      ? state.catalog.products.filter((product) => product.inStock && (product.labels.includes("featured") || product.labels.includes("bestseller"))).slice(0, MAX_FEATURED)
      : []),
    [state]
  )
  const loading = state.status === "loading"
  const empty = !loading && featured.length === 0

  return (
    <Section spacing="md" className="bg-surface" aria-labelledby="featured-heading">
      <Container>
        <SectionHeading eyebrow="From the kitchen" title="Kitchen favorites" id="featured-heading" action={<Link href="/menu" className={linkClass}>View the full menu <span aria-hidden="true" className="ml-2">&rarr;</span></Link>} />
        {empty ? (
          <p className="rounded-2xl border border-dashed border-border bg-background/60 px-5 py-8 text-center font-sans text-sm text-muted-foreground" role="status">
            {state.status === "unavailable" ? "The menu is not available right now. Please try again in a few minutes." : "Featured dishes will appear here once they are published."}
          </p>
        ) : loading ? (
          <>
            <p className="sr-only" role="status">Loading featured dishes.</p>
            <ul className={dishGrid} role="list" aria-hidden="true">
              {skeletonTiles.map((tile) => <li key={tile}><SkeletonCard /></li>)}
            </ul>
          </>
        ) : (
          <ul className={dishGrid} role="list">
            {featured.map((product, index) => <FeaturedCard key={product.id} product={product} index={index} />)}
          </ul>
        )}
      </Container>
    </Section>
  )
}

/** Browse-by-category tiles built from the categories that currently have published dishes. */
export function CategoriesSection() {
  const state = useCatalog()
  const categories = useMemo(() => {
    if (state.status !== "ready") return []
    return state.catalog.categories
      .map((category) => ({ ...category, count: state.catalog.products.filter((product) => product.categorySlug === category.slug).length }))
      .filter((category) => category.count > 0)
  }, [state])
  if (state.status !== "loading" && categories.length === 0) return null

  return (
    <Section spacing="md" aria-labelledby="categories-heading">
      <Container>
        <SectionHeading eyebrow="Browse" title="Our categories" id="categories-heading" />
        {state.status === "loading" ? (
          <ul className={categoryGrid} role="list" aria-hidden="true">
            {skeletonTiles.map((tile) => <li key={tile} className="skeleton h-20 rounded-2xl" />)}
          </ul>
        ) : (
          <ul className={categoryGrid} role="list">
            {categories.map((category, index) => (
              <li key={category.id} className="enter" style={{ "--i": index } as CSSProperties}>
                <Link href={`/menu?category=${encodeURIComponent(category.slug)}`} className="group flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="min-w-0">
                    <span className="block font-serif text-base leading-snug text-foreground">{category.name}</span>
                    <span className="mt-0.5 block font-sans text-xs text-muted-foreground">{category.count} {category.count === 1 ? "dish" : "dishes"}</span>
                  </span>
                  <span aria-hidden="true" className="text-primary transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  )
}

const dishGrid = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
const categoryGrid = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]"

/** Link to seasonal and festive dishes. Only shown when the catalog actually has some. */
export function SeasonalBanner() {
  const state = useCatalog()
  if (state.status !== "ready") return null
  const seasonal = state.catalog.products.filter((product) => product.inStock && (product.labels.includes("seasonal") || product.labels.includes("festive") || product.categorySlug === "seasonal-specials" || product.categorySlug === "festival-specials"))
  if (seasonal.length === 0) return null
  const first = seasonal[0]!
  const inCategory = seasonal.every((product) => product.categorySlug === first.categorySlug)
  const href = inCategory ? `/menu?category=${encodeURIComponent(first.categorySlug)}` : "/menu"
  return (
    <Section spacing="sm" aria-label="Seasonal and festive dishes">
      <Container>
        <div className="flex flex-col gap-5 rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] opacity-80">Seasonal &amp; festive</p>
            <p className="mt-1 font-serif text-2xl leading-snug sm:text-3xl">{seasonal.length} {seasonal.length === 1 ? "special" : "specials"} on the menu right now.</p>
          </div>
          <Link href={href} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-background px-6 font-sans text-sm font-semibold text-foreground transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary">See the specials <span aria-hidden="true" className="ml-2">&rarr;</span></Link>
        </div>
      </Container>
    </Section>
  )
}

function FeaturedCard({ product, index }: { product: Product; index: number }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
  return (
    <li className="enter" style={{ "--i": index } as CSSProperties}>
      <Link
        href={`/menu?category=${encodeURIComponent(product.categorySlug)}&product=${encodeURIComponent(product.slug)}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <MediaImage image={image} alt={product.name} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="font-serif text-base leading-snug text-foreground sm:text-lg">{product.name}</h3>
          {product.shortDescription && <p className="mt-1 line-clamp-2 font-sans text-xs text-muted-foreground sm:text-sm">{product.shortDescription}</p>}
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} unit={product.priceUnit} className="mt-auto pt-3 font-sans text-sm" />
        </div>
      </Link>
    </li>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      <div className="aspect-[4/3] skeleton" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-1/3 skeleton rounded" />
      </div>
    </div>
  )
}
