/** Catalog domain types aligned with the Phase 1 product model. */

export type PriceUnit = "per piece" | "per kg" | "per box" | "per dozen" | "per portion" | "per pack"
export type ProductLabel = "bestseller" | "featured" | "isNew" | "seasonal" | "festive" | "customOrder"
export type DietaryClassification =
  | "halal"
  | "pure-vegetarian"
  | "contains-egg"
  | "gluten-free"
  | "dairy-free"
  | "sugar-free"
  | "diabetic-friendly"
  | "postnatal-safe"
  | "immunity-booster"

export interface ProductImage {
  id: string
  url: string
  alt: string
  width: number
  height: number
  blurDataUrl?: string
  isPrimary?: boolean
}

export interface ProductTag {
  id: string
  name: string
  slug: string
  classification?: DietaryClassification
  colorVariant?: "emerald" | "amber" | "rose" | "slate" | "violet"
}

export interface EntitySEO {
  metaTitle: string
  metaDescription: string
  canonicalUrl?: string
  ogImage?: string
  keywords?: string[]
  noIndex?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: ProductImage
  icon: string
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  productCount?: number
  seo: EntitySEO
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  categoryId: string
  categorySlug: string
  tags: ProductTag[]
  labels: ProductLabel[]
  price: number
  salePrice: number | null
  priceUnit: PriceUnit
  currency: string
  images: ProductImage[]
  thumbnail: string
  inStock: boolean
  availabilityNote: string | null
  deliveryArea: string[]
  preparationTimeMinutes: number
  orderLeadTimeHours: number
  ingredients: string[]
  allergens: string[]
  servingSize: string
  shelfLife: string
  whatsappMessageTemplate: string
  seo: EntitySEO
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}
