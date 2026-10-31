"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { categoryNav } from "@/config/navigation"
import { formatPrice } from "@/lib/utils"
import { matchesFuzzyQuery } from "@/lib/search"
import { useCatalog } from "@/hooks/use-catalog"
import { MediaImage } from "@/components/shared/media-image"
import { AddToRequest } from "@/components/order/add-to-request"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

const dietaryFilters = [
  { slug: "pure-vegetarian", label: "Pure vegetarian" },
  { slug: "gluten-free", label: "Gluten-free" },
  { slug: "dairy-free", label: "Dairy-free" },
  { slug: "sugar-free", label: "Sugar-free" },
] as const

const placeholderCards = Array.from({ length: 8 }, (_, index) => index)
const configCategories = categoryNav.flatMap((item) => (item.segment ? [{ slug: item.segment, name: item.label }] : []))

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

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 mb-5 space-y-3 border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:top-20 sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
      <label className="relative block min-w-0">
        <span className="sr-only">Search menu products</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes and treats…" autoComplete="off" className="min-h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-4 font-sans text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </label>
      <nav aria-label="Menu categories" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="list">
          <li><button type="button" id="category-all" aria-pressed={selectedCategory === null} onClick={() => selectCategory(null)} className={`min-h-11 rounded-full border px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCategory === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>All</button></li>
          {categories.map((category) => <li key={category.slug}><button type="button" id={`category-${category.slug}`} aria-pressed={selectedCategory === category.slug} onClick={() => selectCategory(category.slug)} className={`min-h-11 whitespace-nowrap rounded-full border px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCategory === category.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>{category.name}</button></li>)}
        </ul>
      </nav>
      <fieldset className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1"><legend className="sr-only">Dietary filters</legend><span aria-hidden="true" className="shrink-0 font-sans text-xs font-semibold text-muted-foreground">Dietary</span>{dietaryFilters.map((filter) => { const active = selectedDietary.includes(filter.slug); return <button key={filter.slug} type="button" aria-pressed={active} onClick={() => toggleDietary(filter.slug)} className={`min-h-11 shrink-0 rounded-full border px-3 font-sans text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>{filter.label}</button> })}</fieldset>
      </div>
      <p className="mb-5 mt-6 font-sans text-sm text-muted-foreground" aria-live="polite">{products.length ? `${visibleProducts.length} dishes` : "Browse the menu"}{selectedCategory ? ` · ${categoryName(selectedCategory) ?? "Category"}` : ""}</p>

      {visibleProducts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          {visibleProducts.map((product) => {
            const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
            return <li id={`product-${product.slug}`} key={product.id} className={`scroll-mt-28 overflow-hidden rounded-xl border bg-surface-elevated shadow-sm transition duration-300 ${highlightedProduct === product.slug ? "border-primary ring-2 ring-primary/40 shadow-lg" : "border-border"}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <MediaImage image={image} alt={product.name} sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl text-foreground">{product.name}</h2>
                <p className="mt-1 font-sans text-xs font-semibold uppercase tracking-wide text-primary">{categoryName(product.categorySlug) ?? "Menu item"}</p>
                <p className="mt-2 line-clamp-2 min-h-10 font-sans text-sm text-muted-foreground">{product.shortDescription}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{product.tags.map((tag) => <span key={tag.id} className="rounded-full border border-border px-2.5 py-1 font-sans text-xs text-muted-foreground">{tag.name}</span>)}</div>
                <p className="mt-3 font-sans text-sm font-semibold text-foreground">{product.price > 0 ? <>{formatPrice(product.salePrice ?? product.price, product.currency)} <span className="font-normal text-muted-foreground">/ {product.priceUnit}</span></> : "Ask for today's price"}</p>
                <p className={`mt-2 font-sans text-xs ${product.inStock ? "text-success" : "text-muted-foreground"}`}>{product.availabilityNote ?? (product.inStock ? "Available to order" : "Not available right now")}</p>
                <details className="mt-3 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-2 font-sans text-sm font-semibold text-foreground">Dish details</summary><p className="text-sm text-muted-foreground">{product.description}</p>{product.ingredients.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Ingredients: {product.ingredients.join(", ")}</p>}</details>
                <AddToRequest product={product} />
              </div>
            </li>
          })}
        </ul>
      ) : state.status === "ready" ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-8 text-center font-sans text-sm text-muted-foreground" role="status">
          {products.length > 0 ? "No published items match these filters yet." : "No dishes are published yet. Please check back soon."}
        </p>
      ) : state.status === "unavailable" ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-8 text-center" role="status">
          <p className="font-sans text-sm text-muted-foreground">The menu is not available right now. Please try again in a few minutes, or message us on WhatsApp.</p>
          <WhatsAppButton className="mt-4" />
        </div>
      ) : (
        <>
          <p className="sr-only" role="status">Loading the menu.</p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Menu item placeholders">
            {placeholderCards.map((card) => <li key={card} aria-hidden="true" className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
              <div className="aspect-[4/3] skeleton" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 skeleton rounded" />
                <div className="h-3 w-full skeleton rounded" />
                <div className="h-3 w-2/3 skeleton rounded" />
                <div className="flex items-center gap-2 pt-1"><div className="h-3 w-12 skeleton rounded" /><div className="h-3 w-20 skeleton rounded" /></div>
                <div className="h-11 w-full skeleton rounded-xl" />
              </div>
            </li>)}
          </ul>
        </>
      )}

    </div>
  )
}
