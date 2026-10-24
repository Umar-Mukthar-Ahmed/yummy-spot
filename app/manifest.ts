import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"

/**
 * Web App Manifest
 *
 * Auto-generates /manifest.webmanifest for PWA support.
 * Add PWA icons to /public/icons/ when brand assets are finalised.
 *
 * background_color / theme_color must match the CSS variables
 * defined in app/globals.css for visual consistency.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 * @phase Phase 9 — add service worker, offline page, install prompt
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Yummy Spot",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "hsl(36 22% 97%)",  /* --background light */
    theme_color: "hsl(22 65% 38%)",        /* --primary light */
    categories: ["food", "shopping", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
