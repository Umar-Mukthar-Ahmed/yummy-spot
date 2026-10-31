/** Provider-neutral reference to a stored image. Stored as jsonb in Supabase next to the record that uses it. */
export type MediaProvider = "cloudinary" | "external"

export interface MediaAsset {
  provider: MediaProvider
  /** Provider asset identifier (Cloudinary public_id). Empty for external URLs. */
  publicId: string
  /** Original delivery URL returned at upload time. */
  url: string
  alt: string
  width: number
  height: number
  isPrimary?: boolean
}

/** Folders the admin may upload into; also the allow-list enforced by the signing route. */
export const mediaFolders = ["products", "categories", "gallery"] as const
export type MediaFolder = (typeof mediaFolders)[number]
