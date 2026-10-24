/**
 * Core Utilities
 *
 * Shared utility functions used across the entire application.
 * Keep this file lean — only add truly generic, reusable helpers.
 *
 * Feature-specific utilities belong in their own feature module.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/* ── Tailwind ────────────────────────────────────────────────── */

/**
 * Merges Tailwind CSS classes intelligently.
 * Resolves conflicts (e.g., px-2 + px-4 → px-4) and handles
 * conditional classes without false/undefined leaking.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/* ── WhatsApp ────────────────────────────────────────────────── */

/**
 * Builds a WhatsApp deep link URL with an optional pre-filled message.
 *
 * @param number - Phone in international format, no '+' (e.g. "919876543210")
 * @param message - Pre-filled message text (will be URI-encoded)
 *
 * @example
 * buildWhatsAppUrl("919876543210", "Hi! I'd like to order Chicken Biryani.")
 * → "https://wa.me/919876543210?text=Hi%21%20I%27d..."
 */
export function buildWhatsAppUrl(number: string, message?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * Generates a pre-filled WhatsApp order message for a product.
 *
 * @param productName - Display name of the product
 * @param quantity    - Optional quantity hint
 */
export function buildOrderMessage(productName: string, quantity?: string): string {
  const qty = quantity ? ` (Qty: ${quantity})` : ""
  return `Hi! I'd like to order: ${productName}${qty}. Please confirm availability and delivery details.`
}

/* ── Formatting ──────────────────────────────────────────────── */

/**
 * Formats a numeric price for display.
 *
 * @param amount   - Numeric amount
 * @param currency - ISO 4217 code (default: "INR")
 * @param locale   - BCP 47 locale (default: "en-IN")
 *
 * @example
 * formatPrice(350) → "₹350"
 */
export function formatPrice(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/* ── String ──────────────────────────────────────────────────── */

/**
 * Converts any text to a URL-safe slug.
 *
 * @example
 * slugify("Desserts & Sweets") → "desserts-sweets"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Truncates a string and appends an ellipsis if over the limit.
 *
 * @example
 * truncate("A very long product description...", 80)
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength).trimEnd()}…`
}

/* ── Math ────────────────────────────────────────────────────── */

/** Clamps a number within [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/* ── Environment ─────────────────────────────────────────────── */

/** True when running in a browser context (not during SSR). */
export const isBrowser = typeof window !== "undefined"

/* ── Async ───────────────────────────────────────────────────── */

/** Creates a debounced version of a function. */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delayMs)
  }
}
