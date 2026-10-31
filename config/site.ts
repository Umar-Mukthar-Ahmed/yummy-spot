/**
 * Site Configuration
 *
 * The single source of truth for site-wide metadata, brand identity,
 * social links, and contact information.
 *
 * All values referencing environment variables gracefully fall back
 * to safe defaults for local development.
 *
 * Update production values via environment variables — do NOT
 * hardcode production URLs or phone numbers here.
 */

export const siteConfig = {
  /** Brand */
  name: "Yummy Spot",
  tagline: "Homemade with care.",
  description:
    "Homemade meals, desserts, snacks and traditional wellness foods from our home kitchen. Browse the menu and send an order request online.",

  /** URLs */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  /** SEO keywords */
  keywords: [
    "homemade food",
    "premium desserts",
    "traditional wellness products",
    "homemade meals",
    "artisan food",
    "home kitchen",
  ],

  /**
   * WhatsApp fallback contact (the main flow is the in-app order request)
   * number: International format without the leading '+' (e.g. "919876543210")
   */
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    defaultMessage: "Hi! I have a question about Yummy Spot.",
  },

  /** Social presence — populate when accounts are created */
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  },

  /** OpenGraph image dimensions — keep in sync with /public/og/ assets */
  og: {
    width: 1200,
    height: 630,
  },
} as const

export type SiteConfig = typeof siteConfig
