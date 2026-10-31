import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache"

/**
 * Free-tier setup: every storefront page is prerendered and catalog data is fetched in the
 * browser, so prerendered routes are served straight from Workers Static Assets.
 * No R2, D1 or Durable Objects are needed.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})
