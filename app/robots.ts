import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"

/**
 * robots.txt Generator
 *
 * Auto-generates /robots.txt for search engine crawlers.
 * Restricts indexing of non-public routes.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",      /* API routes — not for indexing */
          "/admin/",    /* Owner admin (also noindex) */
          "/_next/",    /* Next.js internals */
          "/private/",  /* Future: authenticated content */
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
