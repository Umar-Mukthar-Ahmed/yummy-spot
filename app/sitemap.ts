import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { plannedRoutes } from "@/config/navigation"

type Entry = {
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
}

const pages: Entry[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/menu", changeFrequency: "weekly", priority: 0.9 },
  { path: "/custom-order", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about", changeFrequency: "monthly", priority: 0.65 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.65 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
]

/**
 * Sitemap Generator
 *
 * Auto-generates /sitemap.xml for search engine crawlers.
 * Pages listed in `plannedRoutes` (config/navigation.ts) are skipped until they exist.
 * Categories and products are sections on /menu, not separate URLs; /order and /admin are noindex.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @phase Phase 7 — add structured data to the single /menu catalog URL
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return pages
    .filter((page) => !plannedRoutes.has(page.path))
    .map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
}
