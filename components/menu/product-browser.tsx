"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { categoryNav } from "@/config/navigation"
import type { Product } from "@/types/product"
import { buildOrderMessage, buildWhatsAppUrl, formatPrice } from "@/lib/utils"
import { matchesFuzzyQuery } from "@/lib/search"
import { siteConfig } from "@/config/site"

const dietaryFilters = [
  { slug: "halal", label: "Halal" },
  { slug: "pure-vegetarian", label: "Pure vegetarian" },
  { slug: "gluten-free", label: "Gluten-free" },
  { slug: "dairy-free", label: "Dairy-free" },
  { slug: "sugar-free", label: "Sugar-free" },
] as const

const placeholderCards = Array.from({ length: 8 }, (_, index) => index)
type ProductBrowserProps = { products: Product[] }

/** Shared menu controls and responsive product grid, driven by the catalog data boundary. */
export function ProductBrowser({ products }: ProductBrowserProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterTriggerRef = useRef<HTMLButtonElement>(null)
  const filterDialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim().toLocaleLowerCase()), 150)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function readCategoryHash() {
      const slug = window.location.hash.replace(/^#category-/, "")
      setSelectedCategory(categoryNav.some((item) => item.segment === slug) ? slug : null)
    }
    readCategoryHash()
    window.addEventListener("hashchange", readCategoryHash)
    return () => window.removeEventListener("hashchange", readCategoryHash)
  }, [])

  useEffect(() => {
    if (!filtersOpen) return
    const previousOverflow = document.body.style.overflow
    const trigger = filterTriggerRef.current
    document.body.style.overflow = "hidden"
    filterDialogRef.current?.querySelector<HTMLButtonElement>("button[aria-label='Close filters']")?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false)
      if (event.key !== "Tab" || !filterDialogRef.current) return
      const focusable = Array.from(filterDialogRef.current.querySelectorAll<HTMLElement>("button, input, [tabindex]:not([tabindex='-1'])"))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      if (trigger?.isConnected) trigger.focus()
    }
  }, [filtersOpen])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.shortDescription} ${product.tags.map((tag) => tag.name).join(" ")}`.toLocaleLowerCase()
    const matchesQuery = matchesFuzzyQuery(text, debouncedQuery)
    const matchesDiet = selectedDietary.every((classification) => product.tags.some((tag) => tag.classification === classification))
    const matchesCategory = selectedCategory === null || product.categorySlug === selectedCategory
    return matchesQuery && matchesDiet && matchesCategory
  }), [products, debouncedQuery, selectedDietary, selectedCategory])

  function selectCategory(slug: string | null) {
    setSelectedCategory(slug)
    window.history.replaceState(null, "", slug ? `/menu#category-${slug}` : "/menu")
  }

  function toggleDietary(slug: string) {
    setSelectedDietary((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
  }

  const filters = (
    <fieldset>
      <legend className="mb-3 font-sans text-sm font-semibold text-foreground">Dietary preferences</legend>
      <div className="flex flex-wrap gap-2">
        {dietaryFilters.map((filter) => {
          const active = selectedDietary.includes(filter.slug)
          return <button key={filter.slug} type="button" aria-pressed={active} onClick={() => toggleDietary(filter.slug)} className={`min-h-11 rounded-full border px-4 font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>{filter.label}</button>
        })}
      </div>
    </fieldset>
  )

  return (
    <div>
      <nav aria-label="Menu categories" className="-mx-4 mb-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="list">
          <li><button type="button" id="category-all" aria-pressed={selectedCategory === null} onClick={() => selectCategory(null)} className={`min-h-11 rounded-full border px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCategory === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>All</button></li>
          {categoryNav.map((category) => <li key={category.segment}><button type="button" id={`category-${category.segment}`} aria-pressed={selectedCategory === category.segment} onClick={() => selectCategory(category.segment ?? null)} className={`min-h-11 whitespace-nowrap rounded-full border px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCategory === category.segment ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-surface"}`}>{category.label}</button></li>)}
        </ul>
      </nav>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search menu products</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes and treats…" autoComplete="off" className="min-h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 font-sans text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        <button ref={filterTriggerRef} type="button" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 font-sans text-sm font-semibold text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span aria-hidden="true">☷</span> Dietary filters{selectedDietary.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs text-primary-foreground">{selectedDietary.length}</span>}
        </button>
      </div>

      {visibleProducts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          {visibleProducts.map((product) => {
            const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
            const orderUrl = buildWhatsAppUrl(siteConfig.whatsapp.number, product.whatsappMessageTemplate || buildOrderMessage(product.name))
            return <li id={`product-${product.slug}`} key={product.id} className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {image ? <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" /> : <ImagePlaceholder />}
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl text-foreground">{product.name}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 font-sans text-sm text-muted-foreground">{product.shortDescription}</p>
                <p className="mt-3 font-sans text-sm font-semibold text-foreground">{formatPrice(product.salePrice ?? product.price, product.currency)} <span className="font-normal text-muted-foreground">/ {product.priceUnit}</span></p>
                <a href={orderUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-whatsapp px-4 font-sans text-sm font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Order via WhatsApp</a>
              </div>
            </li>
          })}
        </ul>
      ) : products.length > 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-8 text-center font-sans text-sm text-muted-foreground" role="status">No published items match these filters yet.</p>
      ) : (
        <>
          <p className="sr-only" role="status">Menu item placeholders are shown. Product details will appear when the catalog is published.</p>
          {/* Phase 6: replace these neutral card placeholders with approved CMS catalog entries. */}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Menu item placeholders">
            {placeholderCards.map((card) => <li key={card} aria-hidden="true" className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
              <ImagePlaceholder />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-2 pt-1"><div className="h-3 w-12 animate-pulse rounded bg-muted" /><div className="h-3 w-20 animate-pulse rounded bg-muted" /></div>
                <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </li>)}
          </ul>
        </>
      )}

      <AnimatePresence>
        {filtersOpen && <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)}>
          <motion.section ref={filterDialogRef} role="dialog" aria-modal="true" aria-labelledby="filter-title" className="max-h-[85svh] w-full overflow-y-auto rounded-t-3xl border border-border bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-xl sm:rounded-3xl sm:pb-6" initial={{ y: "12%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "12%", opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 320 }} onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between"><h2 id="filter-title" className="font-serif text-xl text-foreground">Dietary filters</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">×</button></div>
            {filters}
            <button type="button" onClick={() => setFiltersOpen(false)} className="mt-5 min-h-12 w-full rounded-full bg-primary px-5 font-sans text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Show {visibleProducts.length} items</button>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}

/** Neutral, accessible image treatment for catalog items without approved photography. */
function ImagePlaceholder() {
  return <div role="img" aria-label="Product photo placeholder" className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-surface">
    <div aria-hidden="true" className="absolute h-40 w-40 rounded-full border border-border/70 bg-background/40 shadow-inner sm:h-48 sm:w-48" />
    <svg aria-hidden="true" viewBox="0 0 48 48" className="relative h-10 w-10 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="24" cy="24" r="17" /><circle cx="24" cy="24" r="11" /><path d="M15 19c4 2 14 2 18 0M17 29c4-2 10-2 14 0" /></svg>
  </div>
}
