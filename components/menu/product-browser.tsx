"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { categoryNav } from "@/config/navigation"
import { matchesFuzzyQuery } from "@/lib/search"
import { cn } from "@/lib/utils"
import { useCatalog } from "@/hooks/use-catalog"
import { MediaImage } from "@/components/shared/media-image"
import { Price } from "@/components/shared/price"
import { AddToRequest } from "@/components/order/add-to-request"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import type { Product } from "@/types/product"

const dietaryFilters = [
  { slug: "pure-vegetarian", label: "Pure vegetarian" },
  { slug: "gluten-free", label: "Gluten-free" },
  { slug: "dairy-free", label: "Dairy-free" },
  { slug: "sugar-free", label: "Sugar-free" },
] as const

const placeholderCards = Array.from({ length: 8 }, (_, index) => index)
const configCategories = categoryNav.flatMap((item) => (item.segment ? [{ slug: item.segment, name: item.label }] : []))
const productGrid = "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
const pill = "shrink-0 whitespace-nowrap rounded-full border font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const pillOn = "border-primary bg-primary text-primary-foreground"
const pillOff = "border-border bg-background text-foreground hover:bg-surface"

/** Menu controls and responsive product grid, loading published dishes from Supabase in the browser. */
export function ProductBrowser() {
  const state = useCatalog()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null)
  const pendingProduct = useRef<string | null>(null)

  const products = useMemo(() => (state.status === "ready" ? state.catalog.products : []), [state])
  const categories = state.status === "ready" && state.catalog.categories.length > 0 ? state.catalog.categories : configCategories

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim().toLocaleLowerCase()), 150)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function readCategoryQuery() {
      const params = new URLSearchParams(window.location.search)
      const slug = params.get("category") ?? window.location.hash.replace(/^#category-/, "")
      setSelectedCategory(slug || null)
      pendingProduct.current = params.get("product") ?? (window.location.hash.replace(/^#product-/, "") || null)
    }
    readCategoryQuery()
    window.addEventListener("popstate", readCategoryQuery)
    window.addEventListener("hashchange", readCategoryQuery)
    return () => {
      window.removeEventListener("popstate", readCategoryQuery)
      window.removeEventListener("hashchange", readCategoryQuery)
    }
  }, [])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.shortDescription} ${product.tags.map((tag) => tag.name).join(" ")}`.toLocaleLowerCase()
    const matchesQuery = matchesFuzzyQuery(text, debouncedQuery)
    const matchesDiet = selectedDietary.every((classification) => product.tags.some((tag) => tag.classification === classification))
    const matchesCategory = selectedCategory === null || product.categorySlug === selectedCategory
    return matchesQuery && matchesDiet && matchesCategory
  }), [products, debouncedQuery, selectedDietary, selectedCategory])

  useEffect(() => {
    const slug = pendingProduct.current
    if (!slug || visibleProducts.length === 0) return
    const product = visibleProducts.find((item) => item.slug === slug)
    if (!product) return
    pendingProduct.current = null
    setHighlightedProduct(product.slug)
    window.requestAnimationFrame(() => document.getElementById(`product-${product.slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" }))
    const timeout = window.setTimeout(() => setHighlightedProduct(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [visibleProducts])

  function selectCategory(slug: string | null) {
    setSelectedCategory(slug)
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set("category", slug)
    else url.searchParams.delete("category")
    url.searchParams.delete("product")
    window.history.replaceState(null, "", `${url.pathname}${url.search}`)
  }

  function toggleDietary(slug: string) {
    setSelectedDietary((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
  }

  const categoryName = (slug: string) => categories.find((item) => item.slug === slug)?.name
  const filtered = selectedCategory !== null || selectedDietary.length > 0 || debouncedQuery !== ""

  function clearFilters() {
    setQuery("")
    setSelectedDietary([])
    selectCategory(null)
  }

  return (
    <div>
      {/* Only search and categories stay pinned; the dietary row scrolls away to keep the viewport for food. */}
      <div className="sticky top-16 z-20 -mx-4 space-y-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-2xl sm:border-x sm:px-4">
        <label className="relative block min-w-0">
          <span className="sr-only">Search menu products</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes and treats…" autoComplete="off" className="min-h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-4 font-sans text-base text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        <nav aria-label="Menu categories" className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-2" role="list">
            <li><button type="button" id="category-all" aria-pressed={selectedCategory === null} onClick={() => selectCategory(null)} className={cn(pill, "min-h-11 px-4 text-sm", selectedCategory === null ? pillOn : pillOff)}>All</button></li>
            {categories.map((category) => <li key={category.slug}><button type="button" id={`category-${category.slug}`} aria-pressed={selectedCategory === category.slug} onClick={() => selectCategory(category.slug)} className={cn(pill, "min-h-11 px-4 text-sm", selectedCategory === category.slug ? pillOn : pillOff)}>{category.name}</button></li>)}
          </ul>
        </nav>
      </div>

      <fieldset className="-mx-4 mt-3 flex min-w-0 items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <legend className="sr-only">Dietary filters</legend>
        <span aria-hidden="true" className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dietary</span>
        {dietaryFilters.map((filter) => (
          <button key={filter.slug} type="button" aria-pressed={selectedDietary.includes(filter.slug)} onClick={() => toggleDietary(filter.slug)} className={cn(pill, "min-h-11 px-3.5 text-xs", selectedDietary.includes(filter.slug) ? pillOn : pillOff)}>{filter.label}</button>
        ))}
      </fieldset>

      <div className="mb-4 mt-4 flex items-center justify-between gap-3">
        <p className="font-sans text-sm text-muted-foreground" aria-live="polite">
          {state.status === "ready" ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "dish" : "dishes"}` : "Browse the menu"}
          {selectedCategory ? ` · ${categoryName(selectedCategory) ?? "Category"}` : ""}
        </p>
        {filtered && <button type="button" onClick={clearFilters} className="min-h-11 font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>}
      </div>

      {visibleProducts.length > 0 ? (
        <ul className={productGrid} role="list">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} categoryLabel={categoryName(product.categorySlug)} highlighted={highlightedProduct === product.slug} index={index} />
          ))}
        </ul>
      ) : state.status === "ready" ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center" role="status">
          <p className="font-sans text-sm text-muted-foreground">{products.length > 0 ? "No dishes match these filters." : "No dishes are published yet. Please check back soon."}</p>
          {products.length > 0 && filtered && <button type="button" onClick={clearFilters} className="mt-3 min-h-11 font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>}
        </div>
      ) : state.status === "unavailable" ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center" role="status">
          <p className="mx-auto max-w-md font-sans text-sm text-muted-foreground">The menu is not available right now. Please try again in a few minutes, or message us on WhatsApp.</p>
          <WhatsAppButton tone="outline" className="mt-4" />
        </div>
      ) : (
        <>
          <p className="sr-only" role="status">Loading the menu.</p>
          <ul className={productGrid} role="list" aria-hidden="true">
            {placeholderCards.map((card) => (
              <li key={card} className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
                <div className="flex sm:block">
                  <div className="aspect-square w-28 shrink-0 skeleton sm:aspect-[4/3] sm:w-full" />
                  <div className="flex-1 space-y-2.5 p-3 sm:p-4">
                    <div className="h-5 w-3/4 skeleton rounded" />
                    <div className="h-3 w-full skeleton rounded" />
                    <div className="h-3 w-1/3 skeleton rounded" />
                  </div>
                </div>
                <div className="px-3 pb-3 sm:px-4 sm:pb-4"><div className="h-11 w-full skeleton rounded-xl" /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/** One dish. Compact row on phones (photo left), vertical card from the sm breakpoint up; the action is always at the bottom. */
function ProductCard({ product, categoryLabel, highlighted, index }: { product: Product; categoryLabel: string | undefined; highlighted: boolean; index: number }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
  const note = !product.inStock ? "Not available right now" : product.availabilityNote
  return (
    <li
      id={`product-${product.slug}`}
      style={{ "--i": Math.min(index, 8) } as CSSProperties}
      className={cn("enter flex scroll-mt-40 flex-col overflow-hidden rounded-2xl border bg-surface-elevated shadow-xs transition duration-300 hover:shadow-md", highlighted ? "border-primary ring-2 ring-primary/40 shadow-lg" : "border-border")}
    >
      <div className="flex sm:flex-col">
        <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-surface sm:aspect-[4/3] sm:w-full">
          <MediaImage image={image} alt={product.name} sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 112px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1 p-3 sm:p-4 sm:pb-2">
          <h2 className="font-serif text-lg leading-snug text-foreground sm:text-xl">{product.name}</h2>
          {categoryLabel && <p className="mt-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-primary">{categoryLabel}</p>}
          {product.shortDescription && <p className="mt-1.5 line-clamp-2 font-sans text-sm text-muted-foreground">{product.shortDescription}</p>}
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} unit={product.priceUnit} className="mt-2 block font-sans text-sm" />
          {note && <p className={cn("mt-1 font-sans text-xs", product.inStock ? "text-muted-foreground" : "font-medium text-destructive")}>{note}</p>}
        </div>
      </div>
      <div className="mt-auto px-3 pb-3 sm:px-4 sm:pb-4">
        {product.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" role="list" aria-label="Dietary information">
            {product.tags.map((tag) => <li key={tag.id} className="rounded-full border border-border px-2.5 py-0.5 font-sans text-xs text-muted-foreground">{tag.name}</li>)}
          </ul>
        )}
        {(product.description || product.ingredients.length > 0) && (
          <details className="group mt-2 border-t border-border">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-2 font-sans text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              Dish details
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            {product.description && <p className="font-sans text-sm text-muted-foreground">{product.description}</p>}
            {product.ingredients.length > 0 && <p className="mt-2 font-sans text-xs text-muted-foreground">Ingredients: {product.ingredients.join(", ")}</p>}
          </details>
        )}
        <AddToRequest product={product} />
      </div>
    </li>
  )
}
