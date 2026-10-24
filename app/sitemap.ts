import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"

/**
 * Sitemap Generator
 *
 * Auto-generates /sitemap.xml for search engine crawlers.
 *
 * Categories and products are sections on /menu, not separate URLs.
 * The CMS can later populate the single menu route and its structured data.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @phase Phase 6 — populate the /menu catalog from the CMS; keep one catalog URL
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url
  const now = new Date()

  return [
    /* ── Core Pages ───────────────────────────────────────────── */
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/menu`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    /* ── Secondary Pages ──────────────────────────────────────── */
    {
      url: `${base}/custom-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    /* ── Legal ────────────────────────────────────────────────── */
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
