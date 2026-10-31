/**
 * Environment Variable Validation
 *
 * Validates and exports typed PUBLIC environment variables using Zod.
 * Any misconfigured variable logs a warning at startup.
 *
 * Server-only secrets are NOT here; they live in lib/server-env.ts.
 *
 * EXTENSION POINTS:
 * When new integrations are added, uncomment the relevant section:
 *   - Supabase (Phase 6)
 *   - Cloudinary (Phase 6)
 *   - Analytics (Phase 8)
 *
 * USAGE:
 *   import { env } from "@/lib/env"
 *   const url = env.NEXT_PUBLIC_APP_URL
 *
 * NEVER use process.env.VARIABLE_NAME directly — always import from here.
 */

import { z } from "zod"

/* ── Schema ──────────────────────────────────────────────────── */
const envSchema = z.object({
  /* Node environment */
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /* App URL — used for absolute URL generation (OG images, sitemap, etc.) */
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),

  /* WhatsApp business number (international format, no +) */
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default(""),

  /* Social links */
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().default(""),
  NEXT_PUBLIC_FACEBOOK_URL:  z.string().default(""),

  /* Supabase: the anon key is public by design; access is enforced by RLS. */
  NEXT_PUBLIC_SUPABASE_URL:      z.string().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default(""),

  /* Cloudflare Turnstile site key (public) */
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default(""),

  /* Cloudinary cloud name (public; it appears in every image URL). The API secret is server-only. */
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default(""),

  /* Digits only; prefixed to phone numbers typed without "+" */
  NEXT_PUBLIC_DEFAULT_COUNTRY_CODE: z.string().regex(/^\d{0,3}$/).default(""),

  /* Server-only secrets (service role key, Turnstile secret) live in lib/server-env.ts, never here. */

  // ── Future: Analytics ───────────────────────────────────────
  // NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
})

/* ── Validation ──────────────────────────────────────────────── */
const parsed = envSchema.safeParse({
  NODE_ENV:                      process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER:   process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_INSTAGRAM_URL:     process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  NEXT_PUBLIC_FACEBOOK_URL:      process.env.NEXT_PUBLIC_FACEBOOK_URL,
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_DEFAULT_COUNTRY_CODE: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE,
})

if (!parsed.success) {
  console.warn(
    "⚠️  Environment variable validation failed:\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  )
}

/* ── Exports ─────────────────────────────────────────────────── */
export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV:                    "development" as const,
      NEXT_PUBLIC_APP_URL:         "http://localhost:3000",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "",
      NEXT_PUBLIC_INSTAGRAM_URL:   "",
      NEXT_PUBLIC_FACEBOOK_URL:    "",
      NEXT_PUBLIC_SUPABASE_URL:    "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "",
      NEXT_PUBLIC_DEFAULT_COUNTRY_CODE: "",
    }

export type Env = z.infer<typeof envSchema>
