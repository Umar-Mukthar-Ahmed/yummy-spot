# Product, Media & Order Data Model

> **Brand**: Yummy Spot
> **Status**: Implemented (Supabase PostgreSQL). Source of truth: `supabase/migrations/*.sql` and `types/product.ts`.

This document describes the data the site runs on. Examples use placeholder values only; the real catalog is entered by the owner in `/admin`.

---

## 1. Principles

1. **Batch cooking, not instant dispatch.** Products carry preparation time and an order lead time in hours. The database rejects an order whose wanted time is earlier than the longest lead time in the basket.
2. **Artisan units.** Prices are tied to a unit: per piece, kg, box, dozen, portion or pack. A price of `0` means "ask for today's price".
3. **Transparency.** Ingredients, allergens, serving size and shelf life are first-class fields.
4. **The database is the authority.** Prices, availability and rate limits for orders are decided inside Postgres (`create_order`), never by the browser.
5. **Replaceable media provider.** Images are stored as small JSON objects, not bare URLs (see section 3).

---

## 2. Catalog tables

### `categories`
`id`, `name` (unique), `slug` (unique, kebab-case), `description`, `image` (media asset or null), `icon`, `sort_order`, `is_active`, `is_featured`, `meta_title`, `meta_description`, timestamps.
Seeded with the 10 categories from `config/navigation.ts` (`supabase/seed.sql`).

### `products`
| Group | Columns |
| :--- | :--- |
| Identity | `id`, `category_id` (restrict delete), `name` (3-120), `slug` (unique), `short_description` (max 200), `description` |
| Classification | `labels[]` (`bestseller`, `featured`, `isNew`, `seasonal`, `festive`, `customOrder`), `dietary[]` (`halal`, `pure-vegetarian`, `contains-egg`, `gluten-free`, `dairy-free`, `sugar-free`, `diabetic-friendly`, `postnatal-safe`, `immunity-booster`), `tags[]` (free text) |
| Pricing | `price`, `sale_price` (must be lower than `price`), `price_unit`, `currency` (default `INR`) |
| Availability | `in_stock`, `availability_note`, `delivery_areas[]`, `preparation_time_minutes`, `order_lead_time_hours` |
| Food facts | `ingredients[]`, `allergens[]`, `serving_size`, `shelf_life` |
| Media | `images` (jsonb array of up to 6 media assets; the first is the cover) |
| SEO | `meta_title`, `meta_description`, `og_image_url` |
| Publishing | `is_published`, `published_at`, timestamps |

Public visitors can read a product only if it is published and its category is active (RLS). The storefront maps rows to the `Product` type with `mapProduct()` in `lib/catalog.ts`.

### `site_settings` (single row, `id = 1`)
`whatsapp_number`, `contact_email`, `address`, `opening_hours`, `delivery_areas[]`, `instagram_url`, `facebook_url`, **`accepting_orders`** (kill switch), `order_notice`. Public read, admin write.

### Other content tables (schema ready, admin screens not built yet)
`banners`, `gallery_items`, `reviews`.

---

## 3. Media asset object

Stored as jsonb on categories, gallery items and (as an array) products:

```json
{
  "provider": "cloudinary",
  "publicId": "yummy-spot/products/abc123",
  "url": "https://res.cloudinary.com/<cloud>/image/upload/v1/yummy-spot/products/abc123.jpg",
  "alt": "Describe the photo",
  "width": 1600,
  "height": 1200,
  "isPrimary": true
}
```

`provider` is `cloudinary` or `external`. Only `lib/media.ts`, `lib/media-server.ts`, `lib/media-upload.ts` and `components/shared/media-image.tsx` interpret it. Cloudinary delivery URLs are built on the fly with fixed widths (320, 640, 960, 1280, 1600) to keep free-plan usage predictable. Replacing Cloudinary later means changing those files and migrating the stored objects.

---

## 4. TypeScript types (`types/product.ts`, `types/media.ts`)

```typescript
export interface MediaAsset {
  provider: "cloudinary" | "external"
  publicId: string
  url: string
  alt: string
  width: number
  height: number
  isPrimary?: boolean
}

export interface ProductImage extends MediaAsset { id: string; blurDataUrl?: string }

export interface Product {
  id: string; name: string; slug: string; description: string; shortDescription: string
  categoryId: string; categorySlug: string
  tags: ProductTag[]; labels: ProductLabel[]
  price: number; salePrice: number | null; priceUnit: PriceUnit; currency: string
  images: ProductImage[]; thumbnail: string
  inStock: boolean; availabilityNote: string | null; deliveryArea: string[]
  preparationTimeMinutes: number; orderLeadTimeHours: number
  ingredients: string[]; allergens: string[]; servingSize: string; shelfLife: string
  seo: EntitySEO
  createdAt: string; updatedAt: string; publishedAt: string | null
}
```

---

## 5. Order tables

### `orders`
`id`, `reference` (for example `YS-7K3M9Q`, unambiguous characters), `status`, customer name, **phone in E.164**, optional email, `fulfilment_type` (`delivery` or `pickup`), `delivery_area`, `delivery_address` (required for delivery), `requested_for`, `notes`, `subtotal`, `currency`, `needs_price_quote`, `idempotency_key` (unique), `items_signature`, `ip_hash` (salted hash, never the raw IP), `owner_notes`, `rejection_reason`, `confirmed_at`, `completed_at`, timestamps.

### `order_items`
`order_id`, `product_id` (set null if the product is later deleted), **snapshots** of `product_name`, `unit_price`, `price_unit`, plus `quantity` (up to 99, decimals allowed for per-kg), `line_total`, `note`.

### `order_events`
Audit trail: from status, to status, acting admin, note, timestamp. Written by a trigger on every status change.

### Status workflow (enforced by a database trigger)

```
new ──► confirmed ──► preparing ──► ready ──► out_for_delivery ──► completed   (delivery)
 │          │             │          └────────────────────────────► completed   (pickup)
 ├─► rejected (reason required)
 └─► cancelled   (also from confirmed and preparing)
```
`completed`, `rejected` and `cancelled` are terminal.

---

## 6. Creating an order: `create_order(payload, ip_hash)`

Called only by `/api/orders` with the service role (`anon` and `authenticated` cannot execute it). In one transaction it:

1. Rejects if `accepting_orders` is off.
2. Returns the existing order for a repeated `idempotencyKey`.
3. Rate-limits: 3 orders per phone per hour, 10 per IP hash per hour.
4. Merges repeated products and rejects unpublished or out-of-stock items.
5. Enforces lead time and a 60-day horizon.
6. Treats the same basket from the same phone within 10 minutes as a double submit.
7. Computes prices from the database and snapshots them.
8. Inserts the order, its items and the first audit event.

Result codes returned to the API: `not_accepting`, `invalid`, `unavailable`, `lead_time`, `rate_limited`; the API maps them to 503, 400, 422, 422 and 429.

### Request body of `POST /api/orders` (validated by `lib/validation/order.ts`)

```json
{
  "idempotencyKey": "uuid",
  "turnstileToken": "token from the widget",
  "website": "",
  "elapsedMs": 8200,
  "customer": { "name": "Example Customer", "phone": "+10000000000", "email": "" },
  "fulfilment": { "type": "delivery", "area": "", "address": "Example address", "requestedFor": "2030-01-01T10:00:00.000Z" },
  "notes": "",
  "items": [{ "productId": "uuid", "quantity": 2 }]
}
```

Prices are never sent by the client. `website` is a honeypot and must stay empty. Phone numbers typed without `+` use `NEXT_PUBLIC_DEFAULT_COUNTRY_CODE`; if it is empty the customer must type the international number.

---

## 7. Access rules (Row Level Security)

| Data | Public (anon) | Admin (signed in and listed in `admin_users`) |
| :--- | :--- | :--- |
| Published products, active categories, settings, visible banners, published gallery and reviews | Read | Full access |
| Orders, order items, order events | **No access** | Read; update only `status`, `owner_notes`, `rejection_reason` |
| `create_order`, `purge_old_orders` | No | No (service role only) |

`purge_old_orders(days)` deletes finished orders older than the retention period; scheduling it is optional and not enabled yet.
