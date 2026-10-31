# Testing and smoke-test checklist

There is no unit-test framework. Quality is checked with the commands below, the SQL suite and the manual smoke test.

## Commands

```
npx tsc --noEmit        # types (strict, exactOptionalPropertyTypes)
npm run lint            # ESLint
npm run build           # Next.js production build
npm run cf:build        # OpenNext build for Cloudflare (see package.json scripts)
npm run cf:preview      # local workerd preview, reads .dev.vars (never commit it)
```

### SQL suite (database rules, RLS, order function)

Needs a throwaway Postgres 16 (for example Docker). Apply in this order: `supabase/tests/00_stubs.sql`, every file in `supabase/migrations/` by name, `supabase/seed.sql`, then `supabase/tests/test.sql`. It prints one `PASS : name` or `FAIL : name` notice per check. Every line must be PASS (currently 50). If the Postgres already has the `anon`, `authenticated` and `service_role` roles, ignore the "role already exists" errors from the stubs file.

## Local end-to-end stack (no accounts needed)

Used for the V1 audit and the polish pass. None of it lives in the repo.

- Postgres 16 and PostgREST in Docker with the project migrations applied.
- A small script that fakes the Supabase `/auth/v1` endpoints (two fixed users, one admin) and proxies `/rest/v1` to PostgREST. It has no Realtime, so the admin shows WebSocket 404 errors in the console and does not live-update.
- Cloudflare's published Turnstile test keys (always pass).
- Run the dev server with `NODE_OPTIONS=--use-system-ca` behind a corporate TLS proxy.

This proves the app, the database rules and the browser behaviour. It does **not** prove the real services (see below).

## Manual smoke test (before any production deploy)

Customer, on a phone-sized viewport and a desktop:
1. Home shows the hero with "Browse the menu" as the strongest button and WhatsApp as the outline button.
2. Menu loads dishes; search, category pills and dietary filters work; a dish without a photo shows the neutral block.
3. Add a dish; the quantity controls and the request bar (phones) or header count (desktop) update.
4. Open the order page; try Send with an empty form: errors appear, focus moves to the first problem, no request is sent.
5. Fill the form (delivery and pickup), complete Turnstile, send: "Request sent" with a reference.
6. Turn orders off in admin settings: the order page shows "Requests are paused" and the button is disabled.

Admin:
1. `/admin/login` with a non-admin account shows "No admin access"; with the admin account it opens Orders.
2. The new order appears; Confirm and walk it through valid statuses; Reject asks for a reason.
3. Create a category and a product with a photo; publish; it appears on the storefront.
4. On a phone, the orders list and detail work with the back button.

## Automated checks that were run for the polish pass

A Playwright script (kept outside the repo) drove the installed Edge browser through 7 viewports (320 x 568, 375 x 812, 390 x 844, 768 x 1024, 1024 x 768, 1280 x 800, 1440 x 900), light and dark themes, and `/`, `/menu`, `/order` and `/admin/login`. It checked horizontal overflow, console errors, heading order, landmarks, image alt attributes, touch-target size and text contrast (text over photographs is skipped by the contrast check). It also checked reduced motion (entrances off, nothing looping), keyboard focus indicators, the mobile menu (Escape closes it, focus returns) and the customer and admin journeys.

## What is NOT verified against real services

- **Supabase**: real Auth, real Realtime, real Row Level Security under the hosted project, free-tier limits. (Row Level Security is tested in the SQL suite against real Postgres.)
- **Cloudinary**: real signed uploads, delivery URLs and transformations.
- **Turnstile**: the widget on the real hostname with a real site key and secret.
- **Cloudflare**: the deployed Worker, real CPU limits, and image optimisation of external images in production. A local workerd preview was run, which is not the same as production.
- **Real devices**: touch behaviour and performance on physical phones.

The first real end-to-end run (admin login, category, product, Cloudinary image, storefront, order with Turnstile, status update) must pass before any production deploy.
