# Custom Admin Plan

> **Brand**: Yummy Spot
> **Status**: Implemented, awaiting the first real end-to-end test
> **Replaces**: the earlier Payload CMS plan. Payload and all other CMS products were rejected; see "Why custom" below.

The owner manages orders, the menu, photos and a few settings from `/admin`, a small client-rendered area of the same Next.js site. It uses Supabase Auth to sign in and talks to Supabase directly under Row Level Security, so it costs no extra Worker CPU and needs no extra infrastructure.

---

## Why custom instead of a headless CMS

| Question | Answer |
| :--- | :--- |
| Cost | Everything must run on free tiers. Payload on Cloudflare needs the paid Workers plan and its Cloudflare path is built around D1 and R2. |
| Runtime fit | Payload's Cloudflare template recommends the paid plan (bundle size). Next.js `cacheComponents` is not fully supported by Payload and also hangs the Workers runtime. |
| Scope | The kitchen needs orders, products, categories and a handful of settings, not a general-purpose CMS. |
| Maintenance | One Next.js app, one database, no extra service to patch. |

---

## Screens

| Route | Purpose |
| :--- | :--- |
| `/admin/login` | Email and password sign-in (Supabase Auth). Public signups are disabled. |
| `/admin/orders` | Filter by New, In progress, Completed, Closed, All; search by name, phone or reference; live updates via Realtime; colour-coded status badges and totals in the list; on phones the list and the order detail are separate views with a back button; order detail with items, customer, notes; only valid status buttons; Reject and Cancel are styled as destructive; reject-with-reason; private notes; "Message customer on WhatsApp" link. |
| `/admin/products` | List with quick In stock and Published toggles; create and edit with category, prices, unit, lead time, dietary and labels, ingredients, allergens, photos (up to 6). |
| `/admin/categories` | Create and edit, display order, visibility, featured, optional photo. |
| `/admin/settings` | Pause or resume order requests (with a message), contact details, social links, pickup address, delivery areas. |

Not built yet: banners, gallery and reviews screens (tables exist), TOTP sign-in.

---

## Owner workflows

### Add a dish
1. Products, Add product.
2. Fill name, category, short description, price, unit and notice needed in hours.
3. Add photos. They upload directly to Cloudinary (resized automatically); add a short description for each.
4. Tick **Published**. The dish appears on `/menu` on the next page load (the browser fetches the catalog, there is no cache to clear).

### Mark a dish sold out or change a price
Products, untick **In stock** in the list, or Edit and change the price. Customers cannot add an out-of-stock dish, and the database rejects it even if a stale page tries.

### Handle an order
1. Orders, New. Open the request.
2. Confirm, or Reject with a reason. Use the WhatsApp link to message the customer.
3. Move it through Start preparing, Mark ready, Out for delivery or pickup, Mark completed.
4. Add private notes if needed.

### Pause orders
Settings, untick **Accept online order requests**. The order form shows your message and the API refuses new requests.

---

## Security model

- Real protection is **Row Level Security** with `public.is_admin()`. The client-side gate in `AdminShell` only decides what to render.
- Admins are Supabase Auth users who are also listed in `admin_users`. Signed-in users who are not listed see "No admin access".
- Orders are never writable from the browser. Admins may only change `status`, `owner_notes` and `rejection_reason`; the database trigger refuses invalid status changes.
- `/api/admin/media/sign` verifies the caller with `is_admin()` using their own token before returning a Cloudinary upload signature. The Cloudinary API secret never leaves the server.
- No secret is exposed to the browser. See `.env.example` for which variables are public and which are secret.

---

## Image handling

Admin picks a file, the browser requests a signature, then uploads straight to Cloudinary. The upload is limited to common image formats and capped at 1600 px when stored. The product record keeps a media asset object (`publicId`, `url`, `alt`, size). The storefront renders it through `MediaImage`, which asks Cloudinary for a resized version. See `docs/PRODUCT_MODEL.md`, section 3.

---

## Future, only when needed (see `FREE_TIER_NOTES.md`)

TOTP for admin sign-in, new-order alerts, scheduled backups and keep-alive, banner, gallery and review screens, deleting unused Cloudinary photos.
