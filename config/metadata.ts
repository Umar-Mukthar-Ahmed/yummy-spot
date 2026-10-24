/**
 * Metadata Configuration
 *
 * Factory function for constructing page-level Metadata objects.
 * Use this instead of copy-pasting OG/Twitter tags across pages.
 *
 * @example
 * // In any page.tsx:
 * export const metadata = buildMetadata({
 *   title: "Our Menu",
 *   description: "Browse all homemade products.",
 *   canonical: "/menu",
 * })
 */

import type { Metadata } from "next"
import { siteConfig } from "./site"

export type MetadataOptions = {
  /** Page title — will be wrapped in the site title template */
  title?: string
  /** Override the site default description */
  description?: string
  /** Absolute or relative path to the OG image (1200×630) */
  image?: string
  /** Canonical URL path (e.g. "/menu/desserts") */
  canonical?: string
  /** Additional page-specific keywords */
  keywords?: string[]
  /** If true, search engines will not index this page */
  noIndex?: boolean
}

export function buildMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    image = `${siteConfig.url}/og/default.png`,
    canonical,
    keywords = [],
    noIndex = false,
  } = options

  const resolvedTitle = title
    ? { absolute: `${title} | ${siteConfig.name}` }
    : siteConfig.name

  const resolvedUrl = canonical
    ? `${siteConfig.url}${canonical}`
    : siteConfig.url

  const mergedKeywords = [...siteConfig.keywords, ...keywords]

  return {
    title: resolvedTitle,
    description,
    keywords: mergedKeywords,
    ...(canonical && {
      alternates: { canonical: resolvedUrl },
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: resolvedUrl,
      title: title ?? siteConfig.name,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: siteConfig.og.width,
          height: siteConfig.og.height,
          alt: title ?? siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description,
      images: [image],
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  }
}
