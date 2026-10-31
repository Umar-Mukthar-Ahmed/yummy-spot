"use client"

import { useCallback, useEffect, useState } from "react"
import { dietaryLabels, priceUnits, productLabels } from "@/lib/catalog"
import { parseMediaAsset } from "@/lib/media"
import { formatPrice, slugify } from "@/lib/utils"
import type { MediaAsset } from "@/types/media"
import type { DietaryClassification } from "@/types/product"
import { useAdmin } from "./admin-shell"
import { ImageUploader } from "./image-uploader"
import { adminInput, Checkbox, Field, Message, PrimaryButton, SecondaryButton } from "./ui"
import { MediaImage } from "@/components/shared/media-image"

type ProductRow = {
  id: string
  category_id: string
  name: string
  slug: string
  short_description: string
  description: string
  labels: string[]
  dietary: string[]
  price: number
  sale_price: number | null
  price_unit: string
  currency: string
  in_stock: boolean
  availability_note: string | null
  preparation_time_minutes: number
  order_lead_time_hours: number
  ingredients: string[]
  allergens: string[]
  serving_size: string | null
  shelf_life: string | null
  images: unknown
  is_published: boolean
  published_at: string | null
}

type CategoryOption = { id: string; name: string }

type FormState = {
  id: string | null
  categoryId: string
  name: string
  slug: string
  shortDescription: string
  description: string
  labels: string[]
  dietary: string[]
  price: string
  salePrice: string
  priceUnit: string
  inStock: boolean
  availabilityNote: string
  prepMinutes: string
  leadHours: string
  ingredients: string
  allergens: string
  servingSize: string
  shelfLife: string
  images: MediaAsset[]
  isPublished: boolean
  publishedAt: string | null
}

const emptyForm = (categoryId: string): FormState => ({
  id: null, categoryId, name: "", slug: "", shortDescription: "", description: "", labels: [], dietary: [],
  price: "", salePrice: "", priceUnit: "per piece", inStock: true, availabilityNote: "", prepMinutes: "60", leadHours: "4",
  ingredients: "", allergens: "", servingSize: "", shelfLife: "", images: [], isPublished: false, publishedAt: null,
})

function toForm(row: ProductRow): FormState {
  const images = Array.isArray(row.images) ? row.images.flatMap((item: unknown) => parseMediaAsset(item) ?? []) : []
  return {
    id: row.id, categoryId: row.category_id, name: row.name, slug: row.slug, shortDescription: row.short_description,
    description: row.description, labels: row.labels, dietary: row.dietary, price: String(row.price),
    salePrice: row.sale_price === null ? "" : String(row.sale_price), priceUnit: row.price_unit, inStock: row.in_stock,
    availabilityNote: row.availability_note ?? "", prepMinutes: String(row.preparation_time_minutes),
    leadHours: String(row.order_lead_time_hours), ingredients: row.ingredients.join(", "), allergens: row.allergens.join(", "),
    servingSize: row.serving_size ?? "", shelfLife: row.shelf_life ?? "", images, isPublished: row.is_published, publishedAt: row.published_at,
  }
}

const list = (value: string) => value.split(/[,\n]/).map((part) => part.trim()).filter(Boolean)
const toggle = (values: string[], value: string) => (values.includes(value) ? values.filter((item) => item !== value) : [...values, value])

export function ProductsAdmin() {
  const { supabase } = useAdmin()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    let active = true
    void Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("categories").select("id, name").order("sort_order").order("name"),
    ]).then(([productResult, categoryResult]) => {
      if (!active) return
      if (productResult.error || categoryResult.error) setMessage({ kind: "error", text: "Could not load products." })
      else {
        setProducts(productResult.data as ProductRow[])
        setCategories(categoryResult.data as CategoryOption[])
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [supabase, version])

  async function quickUpdate(id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from("products").update(values).eq("id", id)
    if (error) setMessage({ kind: "error", text: error.message })
    else reload()
  }

  const categoryName = (id: string) => categories.find((category) => category.id === id)?.name ?? ""

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-foreground">Products</h1>
        {!form && (
          <PrimaryButton disabled={categories.length === 0} onClick={() => { setMessage(null); setForm(emptyForm(categories[0]?.id ?? "")) }}>Add product</PrimaryButton>
        )}
      </div>
      {message && <div className="mt-4"><Message kind={message.kind}>{message.text}</Message></div>}

      {form ? (
        <ProductForm
          key={form.id ?? "new"}
          initial={form}
          categories={categories}
          onCancel={() => setForm(null)}
          onSaved={() => { setForm(null); setMessage({ kind: "success", text: "Product saved." }); reload() }}
        />
      ) : (
        <ul className="mt-5 space-y-2" role="list">
          {loading && <li className="font-sans text-sm text-muted-foreground">Loading…</li>}
          {!loading && products.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center font-sans text-sm text-muted-foreground">No products yet. Add your first dish.</li>}
          {products.map((product) => {
            const covers = Array.isArray(product.images) ? product.images.flatMap((item: unknown) => parseMediaAsset(item) ?? []) : []
            const cover = covers.find((item) => item.isPrimary) ?? covers[0]
            return (
            <li key={product.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-elevated p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                <MediaImage image={cover} alt="" sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-sans text-sm font-semibold text-foreground">{product.name}</p>
                <p className="font-sans text-xs text-muted-foreground">{categoryName(product.category_id)} · {product.price > 0 ? `${formatPrice(product.sale_price ?? product.price, product.currency.trim())} ${product.price_unit}` : "Price on request"}</p>
              </div>
              <Checkbox id={`stock-${product.id}`} label="In stock" checked={product.in_stock} onChange={(value) => void quickUpdate(product.id, { in_stock: value })} />
              <Checkbox id={`pub-${product.id}`} label="Published" checked={product.is_published} onChange={(value) => void quickUpdate(product.id, { is_published: value, published_at: value ? (product.published_at ?? new Date().toISOString()) : product.published_at })} />
              <SecondaryButton onClick={() => { setMessage(null); setForm(toForm(product)) }}>Edit</SecondaryButton>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ProductForm({ initial, categories, onCancel, onSaved }: { initial: FormState; categories: CategoryOption[]; onCancel: () => void; onSaved: () => void }) {
  const { supabase } = useAdmin()
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const price = Number(form.price || 0)
    const salePrice = form.salePrice.trim() === "" ? null : Number(form.salePrice)
    if (!Number.isFinite(price) || price < 0) return setError("Price must be zero or more. Use 0 for “price on request”.")
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)) return setError("Sale price must be lower than the price.")

    const slug = slugify(form.slug || form.name)
    if (!slug) return setError("Please enter a name.")

    setSaving(true)
    const payload = {
      category_id: form.categoryId,
      name: form.name.trim(),
      slug,
      short_description: form.shortDescription.trim(),
      description: form.description.trim(),
      labels: form.labels,
      dietary: form.dietary,
      price,
      sale_price: salePrice,
      price_unit: form.priceUnit,
      in_stock: form.inStock,
      availability_note: form.availabilityNote.trim() || null,
      preparation_time_minutes: Math.max(0, Math.round(Number(form.prepMinutes) || 0)),
      order_lead_time_hours: Math.max(0, Math.round(Number(form.leadHours) || 0)),
      ingredients: list(form.ingredients),
      allergens: list(form.allergens),
      serving_size: form.servingSize.trim() || null,
      shelf_life: form.shelfLife.trim() || null,
      images: form.images,
      is_published: form.isPublished,
      published_at: form.isPublished ? (form.publishedAt ?? new Date().toISOString()) : form.publishedAt,
    }
    const { error: saveError } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload)
    setSaving(false)
    if (saveError) {
      setError(saveError.code === "23505" ? "Another product already uses this name or web address. Change the name or the web address." : saveError.message)
      return
    }
    await onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-5 rounded-xl border border-border bg-surface-elevated p-4">
      <h2 className="font-serif text-xl text-foreground">{form.id ? "Edit product" : "New product"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-name" label="Name"><input id="p-name" required minLength={3} maxLength={120} value={form.name} onChange={(event) => set("name", event.target.value)} className={adminInput} /></Field>
        <Field id="p-category" label="Category">
          <select id="p-category" required value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)} className={adminInput}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
      </div>
      <Field id="p-short" label="Short description" hint="Up to 200 characters, shown on the menu card."><input id="p-short" required maxLength={200} value={form.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} className={adminInput} /></Field>
      <Field id="p-desc" label="Full description"><textarea id="p-desc" rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} className={adminInput} /></Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="p-price" label="Price" hint="Use 0 for “price on request”."><input id="p-price" type="number" inputMode="decimal" min={0} step="0.01" required value={form.price} onChange={(event) => set("price", event.target.value)} className={adminInput} /></Field>
        <Field id="p-sale" label="Sale price (optional)"><input id="p-sale" type="number" inputMode="decimal" min={0} step="0.01" value={form.salePrice} onChange={(event) => set("salePrice", event.target.value)} className={adminInput} /></Field>
        <Field id="p-unit" label="Sold">
          <select id="p-unit" value={form.priceUnit} onChange={(event) => set("priceUnit", event.target.value)} className={adminInput}>
            {priceUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="p-lead" label="Notice needed (hours)"><input id="p-lead" type="number" min={0} value={form.leadHours} onChange={(event) => set("leadHours", event.target.value)} className={adminInput} /></Field>
        <Field id="p-prep" label="Preparation (minutes)"><input id="p-prep" type="number" min={0} value={form.prepMinutes} onChange={(event) => set("prepMinutes", event.target.value)} className={adminInput} /></Field>
        <Field id="p-note" label="Availability note"><input id="p-note" maxLength={120} value={form.availabilityNote} onChange={(event) => set("availabilityNote", event.target.value)} className={adminInput} /></Field>
      </div>

      <fieldset>
        <legend className="mb-1 font-sans text-sm font-medium text-foreground">Dietary</legend>
        <div className="flex flex-wrap gap-x-4">
          {(Object.keys(dietaryLabels) as DietaryClassification[]).map((key) => <Checkbox key={key} id={`d-${key}`} label={dietaryLabels[key]} checked={form.dietary.includes(key)} onChange={() => set("dietary", toggle(form.dietary, key))} />)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1 font-sans text-sm font-medium text-foreground">Labels</legend>
        <div className="flex flex-wrap gap-x-4">
          {productLabels.map((label) => <Checkbox key={label} id={`l-${label}`} label={label} checked={form.labels.includes(label)} onChange={() => set("labels", toggle(form.labels, label))} />)}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-ing" label="Ingredients" hint="Separate with commas."><textarea id="p-ing" rows={2} value={form.ingredients} onChange={(event) => set("ingredients", event.target.value)} className={adminInput} /></Field>
        <Field id="p-all" label="Allergens" hint="Separate with commas."><textarea id="p-all" rows={2} value={form.allergens} onChange={(event) => set("allergens", event.target.value)} className={adminInput} /></Field>
        <Field id="p-serv" label="Serving size"><input id="p-serv" value={form.servingSize} onChange={(event) => set("servingSize", event.target.value)} className={adminInput} /></Field>
        <Field id="p-shelf" label="Shelf life"><input id="p-shelf" value={form.shelfLife} onChange={(event) => set("shelfLife", event.target.value)} className={adminInput} /></Field>
      </div>

      <Field id="p-slug" label="Web address (optional)" hint="Leave empty to create it from the name."><input id="p-slug" value={form.slug} onChange={(event) => set("slug", event.target.value)} className={adminInput} /></Field>

      <div>
        <p className="mb-1.5 font-sans text-sm font-medium text-foreground">Photos</p>
        <ImageUploader images={form.images} onChange={(images) => set("images", images)} folder="products" max={6} defaultAlt={form.name.trim()} />
      </div>

      <div className="flex flex-wrap gap-x-6">
        <Checkbox id="p-stock" label="In stock" checked={form.inStock} onChange={(value) => set("inStock", value)} />
        <Checkbox id="p-pub" label="Published (visible on the menu)" checked={form.isPublished} onChange={(value) => set("isPublished", value)} />
      </div>

      {error && <Message kind="error">{error}</Message>}
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save product"}</PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </form>
  )
}
