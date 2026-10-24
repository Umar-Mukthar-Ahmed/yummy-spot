import type { NextConfig } from "next"

/**
 * Next.js Configuration
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  /* ── React ──────────────────────────────────────────── */
  reactStrictMode: true,

  /* ── Next.js 16 Experimental Features ─────────────── */
  cacheComponents: true,
  partialPrefetching: true,

  /* ── Image Optimization ────────────────────────────── */
  images: {
    /**
     * Modern format priority: AVIF (best compression) → WebP → fallback.
     * This reduces image payload by 30-60% vs JPEG/PNG.
     */
    formats: ["image/avif", "image/webp"],
    /**
     * Declare external image domains when Cloudinary is integrated (Phase 6):
     * remotePatterns: [
     *   { protocol: "https", hostname: "res.cloudinary.com" },
     * ],
     */
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* ── Headers ────────────────────────────────────────── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          /* Prevent content type sniffing */
          { key: "X-Content-Type-Options", value: "nosniff" },
          /* Deny framing to prevent clickjacking */
          { key: "X-Frame-Options", value: "DENY" },
          /* Enable XSS filtering in legacy browsers */
          { key: "X-XSS-Protection", value: "1; mode=block" },
          /* Control referrer info */
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        /* Cache static assets aggressively */
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },

  /* ── Turbopack CSS (Tailwind v4) ────────────────────── */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
