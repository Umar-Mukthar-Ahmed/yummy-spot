"use client"

import { useCallback, useEffect, useState } from "react"
import { parseMediaAsset } from "@/lib/media"
import { slugify } from "@/lib/utils"
import type { MediaAsset } from "@/types/media"
import { useAdmin } from "./admin-shell"
import { ImageUploader } from "./image-uploader"
import { adminInput, Checkbox, Field, Message, PrimaryButton, SecondaryButton } from "./ui"

type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  image: unknown
  sort_order: number
  is_active: boolean
  is_featured: boolean
}

type FormState = {
  id: string | null
  name: string
  slug: string
  description: string
  sortOrder: string
  isActive: boolean
  isFeatured: boolean
  images: MediaAsset[]
}

const emptyForm: FormState = { id: null, name: "", slug: "", description: "", sortOrder: "0", isActive: true, isFeatured: false, images: [] }

function toForm(row: CategoryRow): FormState {
  const image = parseMediaAsset(row.image)
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description ?? "", sortOrder: String(row.sort_order),
    isActive: row.is_active, isFeatured: row.is_featured, images: image ? [image] : [],
  }
}

export function CategoriesAdmin() {
  const { supabase } = useAdmin()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    let active = true
    void supabase.from("categories").select("*").order("sort_order").order("name").then(({ data, error }) => {
      if (!active) return
      if (error) setMessage({ kind: "error", text: "Could not load categories." })
      else setCategories(data as CategoryRow[])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [supabase, version])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-foreground">Categories</h1>
        {!form && <PrimaryButton onClick={() => { setMessage(null); setForm({ ...emptyForm, sortOrder: String((categories.at(-1)?.sort_order ?? 0) + 10) }) }}>Add category</PrimaryButton>}
      </div>
      {message && <div className="mt-4"><Message kind={message.kind}>{message.text}</Message></div>}

      {form ? (
        <CategoryForm key={form.id ?? "new"} initial={form} onCancel={() => setForm(null)} onSaved={() => { setForm(null); setMessage({ kind: "success", text: "Category saved." }); reload() }} />
      ) : (
        <ul className="mt-5 space-y-2" role="list">
          {loading && <li className="font-sans text-sm text-muted-foreground">Loading…</li>}
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-elevated p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-semibold text-foreground">{category.name}</p>
                <p className="font-sans text-xs text-muted-foreground">{category.slug} · order {category.sort_order}{category.is_active ? "" : " · hidden"}{category.is_featured ? " · featured" : ""}</p>
              </div>
              <SecondaryButton onClick={() => { setMessage(null); setForm(toForm(category)) }}>Edit</SecondaryButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoryForm({ initial, onCancel, onSaved }: { initial: FormState; onCancel: () => void; onSaved: () => void }) {
  const { supabase } = useAdmin()
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const slug = slugify(form.slug || form.name)
    if (!slug) return setError("Please enter a name.")
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      sort_order: Math.round(Number(form.sortOrder) || 0),
      is_active: form.isActive,
      is_featured: form.isFeatured,
      image: form.images[0] ?? null,
    }
    const { error: saveError } = form.id
      ? await supabase.from("categories").update(payload).eq("id", form.id)
      : await supabase.from("categories").insert(payload)
    setSaving(false)
    if (saveError) {
      setError(saveError.code === "23505" ? "Another category already uses this name or web address." : saveError.message)
      return
    }
    await onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-xl border border-border bg-surface-elevated p-4">
      <h2 className="font-serif text-xl text-foreground">{form.id ? "Edit category" : "New category"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="c-name" label="Name"><input id="c-name" required minLength={2} maxLength={80} value={form.name} onChange={(event) => set("name", event.target.value)} className={adminInput} /></Field>
        <Field id="c-order" label="Display order" hint="Lower numbers appear first."><input id="c-order" type="number" value={form.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} className={adminInput} /></Field>
      </div>
      <Field id="c-desc" label="Description (optional)"><textarea id="c-desc" rows={3} value={form.description} onChange={(event) => set("description", event.target.value)} className={adminInput} /></Field>
      <Field id="c-slug" label="Web address (optional)" hint="Changing this changes menu links for the category."><input id="c-slug" value={form.slug} onChange={(event) => set("slug", event.target.value)} className={adminInput} /></Field>
      <div>
        <p className="mb-1.5 font-sans text-sm font-medium text-foreground">Photo (optional)</p>
        <ImageUploader images={form.images} onChange={(images) => set("images", images)} folder="categories" max={1} defaultAlt={form.name.trim()} />
      </div>
      <div className="flex flex-wrap gap-x-6">
        <Checkbox id="c-active" label="Visible on the menu" checked={form.isActive} onChange={(value) => set("isActive", value)} />
        <Checkbox id="c-featured" label="Featured" checked={form.isFeatured} onChange={(value) => set("isFeatured", value)} />
      </div>
      {error && <Message kind="error">{error}</Message>}
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save category"}</PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </form>
  )
}
