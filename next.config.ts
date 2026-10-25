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
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    /** Allow the approved Unsplash food photos used until brand photography is ready. */
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /** Consolidate any indexed category/product URLs onto the single Menu page. */
  async redirects() {
    return [
      { source: "/menu/:category/:product", destination: "/menu?category=:category&product=:product", permanent: true },
      { source: "/menu/homemade-meals", destination: "/menu?category=homemade-meals", permanent: true },
      { source: "/menu/desserts-sweets", destination: "/menu?category=desserts-sweets", permanent: true },
      { source: "/menu/snacks-savouries", destination: "/menu?category=snacks-savouries", permanent: true },
      { source: "/menu/biryani-mandi", destination: "/menu?category=biryani-mandi", permanent: true },
      { source: "/menu/curries", destination: "/menu?category=curries", permanent: true },
      { source: "/menu/wellness-foods", destination: "/menu?category=wellness-foods", permanent: true },
      { source: "/menu/health-supplements", destination: "/menu?category=health-supplements", permanent: true },
      { source: "/menu/seasonal-specials", destination: "/menu?category=seasonal-specials", permanent: true },
      { source: "/menu/festival-specials", destination: "/menu?category=festival-specials", permanent: true },
    ]
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
