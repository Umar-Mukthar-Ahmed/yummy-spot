/**
 * SEO / Structured Data Utilities
 *
 * Generates typed JSON-LD structured data objects for Schema.org schemas.
 * Renders as a Server Component with zero client JavaScript.
 *
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data
 *
 * @example
 * // In app/layout.tsx or any page.tsx:
 * import { JsonLdScript, createOrganizationSchema } from "@/lib/seo"
 * <JsonLdScript schema={createOrganizationSchema()} />
 */

import type {
  JsonLdOrganization,
  JsonLdLocalBusiness,
  JsonLdProduct,
  JsonLdBreadcrumb,
  JsonLdWebSite,
  JsonLdSchema,
} from "@/types/seo"
import { siteConfig } from "@/config/site"

/* ── Schema Factories ────────────────────────────────────────── */

/**
 * Organization schema — use in root layout for site-wide brand recognition.
 */
export function createOrganizationSchema(
  override: Partial<JsonLdOrganization> = {}
): JsonLdOrganization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.facebook,
    ].filter(Boolean),
    ...override,
  }
}

/**
 * LocalBusiness schema — use on the homepage and contact page.
 */
export function createLocalBusinessSchema(
  override: Partial<JsonLdLocalBusiness> = {}
): JsonLdLocalBusiness {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    ...override,
  }
}

/**
 * WebSite schema with SearchAction — use on the homepage.
 * Enables a search box in Google's rich results.
 */
export function createWebSiteSchema(): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/menu?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * BreadcrumbList schema — use on all pages deeper than the homepage.
 *
 * @example
 * createBreadcrumbSchema([
 *   { name: "Home",      href: "/" },
 *   { name: "Menu",      href: "/menu" },
 *   { name: "Desserts",  href: "/menu/desserts-sweets" },
 * ])
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; href: string }>
): JsonLdBreadcrumb {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  }
}

/* ── Serialization ───────────────────────────────────────────── */

/** Serializes a JSON-LD object to a string safe for dangerouslySetInnerHTML */
export function toJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema)
}

/* ── Server Component ────────────────────────────────────────── */

/**
 * Renders a JSON-LD <script> tag as a Server Component.
 * Zero client JavaScript — parsed only by search engine crawlers.
 *
 * @example
 * <JsonLdScript schema={createOrganizationSchema()} />
 */
export function JsonLdScript({ schema }: { schema: JsonLdSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  )
}
