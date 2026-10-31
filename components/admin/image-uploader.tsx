"use client"

import { useState } from "react"
import { foodPhotography } from "@/config/food-photography"
import { uploadImage } from "@/lib/media-upload"
import { MediaImage } from "@/components/shared/media-image"
import type { MediaAsset, MediaFolder } from "@/types/media"
import { useAdmin } from "./admin-shell"
import { adminInput, Message, SecondaryButton } from "./ui"

type ImageUploaderProps = {
  images: MediaAsset[]
  onChange: (images: MediaAsset[]) => void
  folder: MediaFolder
  max: number
  /** Alt text used for new uploads; the admin can refine it afterwards. */
  defaultAlt: string
}

/** Pick photos from the phone or computer; they upload straight to Cloudinary and the references are kept on the record. */
export function ImageUploader({ images, onChange, folder, max, defaultAlt }: ImageUploaderProps) {
  const { getToken } = useAdmin()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, max - images.length))
    event.target.value = ""
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const token = await getToken()
      const added: MediaAsset[] = []
      for (const file of files) added.push(await uploadImage(file, folder, token, defaultAlt))
      const next = [...images, ...added]
      onChange(next.map((image, index) => ({ ...image, isPrimary: index === 0 })))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The upload failed.")
    } finally {
      setBusy(false)
    }
  }

  function update(index: number, patch: Partial<MediaAsset>) {
    onChange(images.map((image, position) => (position === index ? { ...image, ...patch } : image)))
  }

  function makeCover(index: number) {
    const picked = images[index]
    if (!picked) return
    const reordered = [picked, ...images.filter((_, position) => position !== index)]
    onChange(reordered.map((image, position) => ({ ...image, isPrimary: position === 0 })))
  }

  function remove(index: number) {
    const rest = images.filter((_, position) => position !== index)
    onChange(rest.map((image, position) => ({ ...image, isPrimary: position === 0 })))
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {images.map((image, index) => (
            <li key={image.publicId || image.url} className="flex gap-3 rounded-xl border border-border bg-surface-elevated p-2">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                <MediaImage image={image} fallback={foodPhotography.biryani} sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="sr-only" htmlFor={`alt-${index}`}>Image description</label>
                <input id={`alt-${index}`} value={image.alt} onChange={(event) => update(index, { alt: event.target.value })} placeholder="Describe the photo" maxLength={140} className={adminInput} />
                <div className="flex flex-wrap items-center gap-2">
                  {index === 0 ? <span className="font-sans text-xs font-medium text-success">Cover photo</span> : <SecondaryButton onClick={() => makeCover(index)}>Make cover</SecondaryButton>}
                  <SecondaryButton onClick={() => remove(index)} aria-label={`Remove photo ${index + 1}`}>Remove</SecondaryButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length < max && (
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background px-5 font-sans text-sm font-semibold text-foreground hover:bg-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
          {busy ? "Uploading…" : images.length === 0 ? "Add photo" : "Add another photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" multiple={max > 1} disabled={busy} onChange={(event) => void onFiles(event)} className="sr-only" />
        </label>
      )}
      <p className="font-sans text-xs text-muted-foreground">Up to {max} {max === 1 ? "photo" : "photos"}. Large photos are resized automatically.</p>
      {error && <Message kind="error">{error}</Message>}
    </div>
  )
}
