import { getSupabaseBrowser } from "@/lib/supabase/browser"
import { parseMediaAsset } from "@/lib/media"
import { slugify } from "@/lib/utils"
import type {
  DietaryClassification,
  PriceUnit,
  Product,
  ProductImage,
  ProductLabel,
  ProductTag,
} from "@/types/product"

/* ── Shared option lists (also used by the admin forms) ───────── */
export const priceUnits: readonly PriceUnit[] = ["per piece", "per kg", "per box", "per dozen", "per portion", "per pack"]
export const productLabels: readonly ProductLabel[] = ["bestseller", "featured", "isNew", "seasonal", "festive", "customOrder"]
export const dietaryLabels: Record<DietaryClassification, string> = {
  halal: "Halal",
  "pure-vegetarian": "Pure vegetarian",
  "contains-egg": "Contains egg",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  "sugar-free": "Sugar-free",
  "diabetic-friendly": "Diabetic-friendly",
  "postnatal-safe": "Postnatal-safe",
  "immunity-booster": "Immunity booster",
}

export type CatalogCategory = { id: string; slug: string; name: string }
export type Catalog = { categories: CatalogCategory[]; products: Product[] }

export type PublicSettings = {
  acceptingOrders: boolean
  orderNotice: string | null
  deliveryAreas: string[]
}

/* ── Row shapes returned by PostgREST ─────────────────────────── */
type ProductRow = {
  id: string
  category_id: string
  name: string
  slug: string
  short_description: string
  description: string
  labels: string[]
  dietary: string[]
  tags: string[]
  price: number
  sale_price: number | null
  price_unit: PriceUnit
  currency: string
  in_stock: boolean
  availability_note: string | null
  delivery_areas: string[]
  preparation_time_minutes: number
  order_lead_time_hours: number
  ingredients: string[]
  allergens: string[]
  serving_size: string | null
  shelf_life: string | null
  images: unknown
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  categories: { slug: string } | null
}

type CategoryRow = { id: string; slug: string; name: string }

type SettingsRow = { accepting_orders: boolean; order_notice: string | null; delivery_areas: string[] }

const dietaryKeys = new Set<string>(Object.keys(dietaryLabels))
const labelKeys = new Set<string>(productLabels)

function parseImages(productId: string, raw: unknown): ProductImage[] {
  if (!Array.isArray(raw)) return []
  const images: ProductImage[] = []
  raw.forEach((item: unknown, index) => {
    const asset = parseMediaAsset(item)
    if (asset) images.push({ ...asset, id: `${productId}-${index}` })
  })
  return images
}

/** Maps a database row to the storefront Product type. */
export function mapProduct(row: ProductRow): Product {
  const images = parseImages(row.id, row.images)
  const tags: ProductTag[] = [
    ...row.dietary
      .filter((key): key is DietaryClassification => dietaryKeys.has(key))
      .map((key) => ({ id: `diet-${key}`, name: dietaryLabels[key], slug: key, classification: key })),
    ...row.tags.map((name) => ({ id: `tag-${slugify(name)}`, name, slug: slugify(name) })),
  ]
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    categoryId: row.category_id,
    categorySlug: row.categories?.slug ?? "",
    tags,
    labels: row.labels.filter((label): label is ProductLabel => labelKeys.has(label)),
    price: Number(row.price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    priceUnit: row.price_unit,
    currency: row.currency.trim(),
    images,
    thumbnail: images[0]?.url ?? "",
    inStock: row.in_stock,
    availabilityNote: row.availability_note,
    deliveryArea: row.delivery_areas,
    preparationTimeMinutes: row.preparation_time_minutes,
    orderLeadTimeHours: row.order_lead_time_hours,
    ingredients: row.ingredients,
    allergens: row.allergens,
    servingSize: row.serving_size ?? "",
    shelfLife: row.shelf_life ?? "",
    seo: {
      metaTitle: row.meta_title ?? row.name,
      metaDescription: row.meta_description ?? row.short_description,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }
}

/** Fetches published categories and products. Null when Supabase is unconfigured or unreachable. */
async function fetchCatalog(): Promise<Catalog | null> {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order").order("name"),
    supabase.from("products").select("*, categories(slug)").order("name"),
  ])
  if (categories.error || products.error) return null
  return {
    categories: (categories.data as CategoryRow[]).map(({ id, slug, name }) => ({ id, slug, name })),
    products: (products.data as unknown as ProductRow[]).map(mapProduct),
  }
}

let cache: { at: number; promise: Promise<Catalog | null> } | null = null

/** Shares one request between components and reuses it for a minute, so the catalog needs no server cache. */
export function loadCatalog(): Promise<Catalog | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.promise
  const promise = fetchCatalog().catch(() => null)
  cache = { at: Date.now(), promise }
  void promise.then((result) => {
    if (!result && cache?.promise === promise) cache = null
  })
  return promise
}

export async function loadPublicSettings(): Promise<PublicSettings | null> {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("site_settings")
    .select("accepting_orders, order_notice, delivery_areas")
    .eq("id", 1)
    .maybeSingle()
  if (error || !data) return null
  const row = data as SettingsRow
  return { acceptingOrders: row.accepting_orders, orderNotice: row.order_notice, deliveryAreas: row.delivery_areas }
}
