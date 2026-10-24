/**
 * Types — Barrel Export
 *
 * Re-exports all domain type definitions for convenient single-path imports.
 *
 * @example
 * import type { NavItem, ThemeMode, JsonLdProduct } from "@/types"
 *
 * Extend by adding new type modules here as the project grows:
 *   - types/product.ts    (Phase 4 — product catalog)
 *   - types/order.ts      (Phase 4 — WhatsApp ordering)
 *   - types/cms.ts        (Phase 6 — CMS content types)
 *   - types/analytics.ts  (Phase 8 — event tracking)
 */

export type * from "./site"
export type * from "./seo"
