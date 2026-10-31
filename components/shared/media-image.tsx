"use client"

import Image, { type ImageLoaderProps } from "next/image"
import { cloudinaryUrl } from "@/lib/media"
import type { MediaAsset } from "@/types/media"

type MediaImageProps = {
  image: Pick<MediaAsset, "provider" | "publicId" | "url" | "alt"> | null | undefined
  /** Shown when there is no uploaded image yet (approved placeholder photography). */
  fallback: { src: string; alt: string }
  sizes: string
  alt?: string
  className?: string
  priority?: boolean
}

function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  return cloudinaryUrl(src, width, quality)
}

/** next/image wrapper: Cloudinary assets are resized by Cloudinary; other sources use the default pipeline. */
export function MediaImage({ image, fallback, sizes, alt, className, priority }: MediaImageProps) {
  if (image?.provider === "cloudinary" && image.publicId) {
    return <Image src={image.publicId} loader={cloudinaryLoader} alt={alt || image.alt} fill sizes={sizes} className={className} priority={priority ?? false} />
  }
  if (image?.url) {
    return <Image src={image.url} alt={alt || image.alt} fill sizes={sizes} className={className} priority={priority ?? false} unoptimized />
  }
  return <Image src={fallback.src} alt={alt || fallback.alt} fill sizes={sizes} className={className} priority={priority ?? false} />
}
