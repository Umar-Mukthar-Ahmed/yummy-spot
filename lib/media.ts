import { env } from "@/lib/env"
import type { MediaAsset } from "@/types/media"

/**
 * Cloudinary delivery. Widths snap to a few fixed sizes so the free plan only ever creates a small,
 * predictable set of derived images per asset (each unique transformation counts towards the monthly credits).
 */
const widths = [320, 640, 960, 1280, 1600] as const

function snapWidth(width: number): number {
  return widths.find((candidate) => candidate >= width) ?? 1600
}

export function cloudinaryUrl(publicId: string, width: number, quality?: number): string {
  const q = quality ? `q_${quality}` : "q_auto"
  return `https://res.cloudinary.com/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,${q},c_limit,w_${snapWidth(width)}/${publicId}`
}

/** Tolerant parser for jsonb values coming from the database. */
export function parseMediaAsset(raw: unknown): MediaAsset | null {
  if (typeof raw !== "object" || raw === null) return null
  const record = raw as Record<string, unknown>
  if (typeof record.url !== "string" || !record.url) return null
  const publicId = typeof record.publicId === "string" ? record.publicId : ""
  const asset: MediaAsset = {
    provider: record.provider === "cloudinary" && publicId ? "cloudinary" : "external",
    publicId,
    url: record.url,
    alt: typeof record.alt === "string" ? record.alt : "",
    width: typeof record.width === "number" ? record.width : 1200,
    height: typeof record.height === "number" ? record.height : 900,
  }
  if (record.isPrimary === true) asset.isPrimary = true
  return asset
}

/** Plain URL for places that cannot use next/image (for example an admin thumbnail request). */
export function mediaUrl(asset: Pick<MediaAsset, "provider" | "publicId" | "url">, width: number): string {
  return asset.provider === "cloudinary" ? cloudinaryUrl(asset.publicId, width) : asset.url
}
