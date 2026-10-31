# Free-Tier Notes

Yummy Spot is designed to cost **nothing to operate** apart from the domain name. This file records what each service gives us for free, what could push us onto a paid plan, and what we have deliberately not added. Update it whenever the stack changes.

**Rules**

- Never enter billing details or upgrade any plan without an explicit decision by the owner.
- Never add a Cloudflare product (R2, D1, Durable Objects, Queues, Hyperdrive, Cron, KV) without first writing down why the free-tier design cannot work without it.
- Secrets live only in local env files (gitignored) and Cloudflare Worker secrets. Never in Git, never in the browser bundle, never in chat.

## Services in use

| Service | Plan | Used for | Cost |
| :--- | :--- | :--- | :--- |
| Cloudflare Workers (via OpenNext) | Workers **Free** | Hosting the Next.js site and the two API routes | $0 |
| Cloudflare Turnstile | Free | Spam protection on order requests | $0 |
| Supabase | **Free** project | PostgreSQL, Auth (admin login), Realtime (live order list) | $0 |
| Cloudinary | **Free** plan | Product, category and gallery images (upload, resize, delivery) | $0 |
| Domain name | Paid by the owner | Custom domain on Cloudflare | Only paid item |

## Known limits

Status: **verified** = read from the provider's docs on 2026-10-31. **verify** = from memory, check the provider's pricing page before relying on it.

### Cloudflare Workers Free (verified, developers.cloudflare.com/workers/platform/limits)

| Limit | Value | Why it matters here |
| :--- | :--- | :--- |
| Requests | 100,000 per day (error 1027 after that) | Order API and any page served by the Worker count |
| CPU time | 10 ms per request (error 1102 if exceeded) | Time waiting on Supabase or Turnstile does not count; our own code must stay light |
| Startup time | 1 second | Keep the server bundle lean |
| Memory | 128 MB | Fine |
| Subrequests | 50 per request | `/api/orders` makes about 2 |
| Worker size | 64 MiB uncompressed (older OpenNext docs still say 3 MiB compressed) | Our build is about 7.1 MiB, 1.5 MiB gzipped |
| Environment variables | 64 per Worker, 5 KB each | We use about 15 |

Turnstile: free and unlimited verifications (verify the current widget count limit).

### Supabase Free (verify, pricing page could not be loaded during the audit)

- About 500 MB database, plenty for a home kitchen's orders and catalog.
- Free projects **pause after roughly a week of inactivity**. A paused project makes the menu and orders fail until it is resumed in the dashboard.
- **No automatic backups** on the free plan. Export orders and products periodically (SQL editor, Table Editor CSV export, or `pg_dump`).
- Limits on monthly active users, Realtime connections and egress exist; this site uses a tiny fraction.
- Supabase Storage is **not used** (images are on Cloudinary).

### Cloudinary Free (verify)

- The free plan is **credit-based**: storage, transformations and bandwidth all draw from one monthly allowance.
- Our design keeps usage low: uploads are capped at 1600 px when stored, and delivery widths snap to five sizes (320, 640, 960, 1280, 1600) so each image produces only a handful of derived versions. See `lib/media.ts`.
- Check the usage dashboard weekly for the first month. If the allowance runs out, image delivery can be blocked until the cycle resets.
- Photos removed in the admin are not deleted from Cloudinary yet; they only consume storage.
- If URL transformations return errors, check Cloudinary Settings > Security and make sure "Strict transformations" is off.

## What would force a paid plan

| Trigger | Symptom | Cheaper fix first |
| :--- | :--- | :--- |
| More than 100k Worker requests per day | Site returns Cloudflare error 1027 | Check which routes hit the Worker; static assets do not count |
| Worker CPU above 10 ms | Error 1102 on a route | Profile the route; keep work in Postgres or the browser |
| Supabase project paused | Menu empty, orders fail | Resume in the dashboard; add a keep-alive later |
| Cloudinary credits exhausted | Images stop loading | Compress and reduce photo count; limit widths |
| Need for point-in-time backups | Data-loss risk | Scheduled export to a free location |

## Deliberately not added (yet)

TOTP/MFA for admin, Telegram or email alerts, scheduled keep-alive and backups, R2, D1, Durable Objects, Queues, Hyperdrive, Workers Cron, Payload or any other CMS, analytics, error monitoring services. Each of these has a free option, but none is needed to run the core order flow. Add them one at a time, and record the decision below.

## Operations checklist

- Weekly: Cloudinary credit usage, Supabase project status, Cloudflare Workers request graph.
- Monthly: export orders and products from Supabase.
- Whenever a limit above is approached: write what happened and the fix in the log below.

## Change log

| Date | Change |
| :--- | :--- |
| 2026-10-31 | Initial stack recorded: Cloudflare Workers Free + Turnstile, Supabase Free, Cloudinary Free. `cacheComponents` and `partialPrefetching` turned off because they hang in the Workers runtime. Catalog is fetched in the browser, so no ISR cache infrastructure is needed. |
| 2026-10-31 | V1 quality audit: no new services. Order form now validates in the browser with the same schema as the API, so a typo no longer uses up the single-use Turnstile token. Duplicate order replies from `create_order()` now include `needsPriceQuote`. |
| 2026-11-01 | UI/UX polish pass: no new services. Removed the `motion` npm package (all motion is CSS now), which shrinks the client bundle; the Cloudflare upload is about 7.0 MiB raw / 1.4 MiB gzip, a little smaller than before. |
