/**
 * Type Definitions — SEO & Structured Data
 *
 * TypeScript types for JSON-LD schemas used throughout the site.
 * All schemas follow the Schema.org vocabulary.
 *
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

/* ── Organization ────────────────────────────────────────────── */
export type JsonLdOrganization = {
  "@context": "https://schema.org"
  "@type": "Organization"
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: {
    "@type": "ContactPoint"
    telephone?: string
    contactType: string
    availableLanguage?: string[]
  }
  sameAs?: string[]
}

/* ── LocalBusiness ───────────────────────────────────────────── */
export type JsonLdLocalBusiness = {
  "@context": "https://schema.org"
  "@type": "LocalBusiness" | "FoodEstablishment" | "HomeAndConstructionBusiness"
  name: string
  description?: string
  url?: string
  telephone?: string
  image?: string | string[]
  address?: {
    "@type": "PostalAddress"
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  openingHours?: string[]
  priceRange?: string
  servesCuisine?: string[]
  menu?: string
  hasMap?: string
}

/* ── Product ─────────────────────────────────────────────────── */
export type JsonLdProduct = {
  "@context": "https://schema.org"
  "@type": "Product"
  name: string
  description?: string
  image?: string | string[]
  brand?: {
    "@type": "Brand"
    name: string
  }
  offers?: {
    "@type": "Offer"
    price?: string | number
    priceCurrency?: string
    availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock"
    url?: string
    seller?: {
      "@type": "Organization"
      name: string
    }
  }
  aggregateRating?: {
    "@type": "AggregateRating"
    ratingValue: string | number
    reviewCount: string | number
  }
}

/* ── BreadcrumbList ──────────────────────────────────────────── */
export type JsonLdBreadcrumb = {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item?: string
  }>
}

/* ── WebSite (with SearchAction) ─────────────────────────────── */
export type JsonLdWebSite = {
  "@context": "https://schema.org"
  "@type": "WebSite"
  name: string
  url: string
  potentialAction?: {
    "@type": "SearchAction"
    target: {
      "@type": "EntryPoint"
      urlTemplate: string
    }
    "query-input": string
  }
}

/* ── ItemList ────────────────────────────────────────────────── */
export type JsonLdItemList = {
  "@context": "https://schema.org"
  "@type": "ItemList"
  name: string
  description?: string
  numberOfItems?: number
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    url?: string
    name?: string
  }>
}

/** Union of all supported JSON-LD schema types */
export type JsonLdSchema =
  | JsonLdOrganization
  | JsonLdLocalBusiness
  | JsonLdProduct
  | JsonLdBreadcrumb
  | JsonLdWebSite
  | JsonLdItemList
