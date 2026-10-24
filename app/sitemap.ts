import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"

/**
 * Sitemap Generator
 *
 * Auto-generates /sitemap.xml for search engine crawlers.
 *
 * Static routes are listed below. Dynamic routes (category pages,
 * product pages) will be fetched from the CMS and appended here
 * in Phase 6 (CMS Integration).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @phase Phase 6 — add dynamic product/category URLs from CMS
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
    /* ── Category Pages (static slugs) ───────────────────────── */
    {
      url: `${base}/menu/homemade-meals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/menu/desserts-sweets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/menu/snacks-savouries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/menu/biryani-mandi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/menu/curries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/menu/wellness-foods`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/menu/health-supplements`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/menu/seasonal-specials`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/menu/festival-specials`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
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
