/**
 * Types — Barrel Export
 *
 * Re-exports all domain type definitions for convenient single-path imports.
 *
 * @example
 * import type { NavItem, ThemeMode, JsonLdProduct } from "@/types"
 *
 * Extend by adding new type modules here as the project grows:
 *   - types/product.ts    (catalog: products, categories, tags)
 *   - types/media.ts      (provider-neutral image references)
 *   - types/analytics.ts  (Phase 8 — event tracking)
 */

export type * from "./site"
export type * from "./seo"
