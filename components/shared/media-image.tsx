"use client"

import Image, { type ImageLoaderProps } from "next/image"
import { cloudinaryUrl } from "@/lib/media"
import type { MediaAsset } from "@/types/media"

type MediaImageProps = {
  image: Pick<MediaAsset, "provider" | "publicId" | "url" | "alt"> | null | undefined
  sizes: string
  /** Used only when the uploaded image has no description of its own. */
  alt?: string
  className?: string
  priority?: boolean
}

function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  return cloudinaryUrl(src, width, quality)
}

/** next/image wrapper: Cloudinary assets are resized by Cloudinary. Without a photo it shows a neutral block, never a stand-in picture. */
export function MediaImage({ image, sizes, alt, className, priority }: MediaImageProps) {
  const description = image?.alt || alt || ""

  if (image?.provider === "cloudinary" && image.publicId) {
    return <Image src={image.publicId} loader={cloudinaryLoader} alt={description} fill sizes={sizes} className={className} loading={priority ? "eager" : "lazy"} />
  }
  if (image?.url) {
    return <Image src={image.url} alt={description} fill sizes={sizes} className={className} loading={priority ? "eager" : "lazy"} unoptimized />
  }
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-surface text-muted-foreground">
      <svg viewBox="0 0 24 24" className="h-8 w-8 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    </div>
  )
}
