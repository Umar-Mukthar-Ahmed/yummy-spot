# Content Management System (CMS) Architecture & Operational Plan

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Status**: Production Architecture
> **Target Audience**: Product Architects, Full-Stack Engineers, and Non-Technical Business Owners

---

## 1. CMS Strategic Objectives

The primary business goal of the CMS implementation is to empower the kitchen owner and culinary team to independently manage their digital presence without developer intervention, while preserving the ultra-fast static loading speeds, strict TypeScript type guarantees, and SEO advantages of Next.js App Router.

### Core Tenets:
1. **Zero-Code Operations**: Adding seasonal specials, updating daily batch stock, tweaking prices, and posting festival banners must be achievable from a smartphone or tablet in under 2 minutes.
2. **Instant Revalidation**: Price changes or "Out of Stock" statuses must reflect on the live storefront immediately via on-demand ISR (Incremental Static Regeneration), avoiding full website rebuilds.
3. **Structured Media**: High-resolution food photography must be auto-optimized, auto-cropped for mobile viewports, and converted to modern AVIF/WebP formats with low-quality image placeholders (LQIP).
4. **Operational Simplicity**: Clean, uncluttered UI stripped of developer jargon, presenting only relevant fields with helpful hints and input validations.

---

## 2. Editable Content Types Inventory

Every customer-facing aspect of Yummy Spot is mapped to an isolated, structured content type:

| Content Type Identifier | Scope | Business Owner Purpose | Update Frequency |
| :--- | :--- | :--- | :--- |
| `announcementBanner` | Site-wide | Urgent notices (holiday schedules, weather delays, batch booking deadlines) | Multiple times weekly |
| `heroSection` | Homepage | Headline, seasonal tagline, high-resolution hero food montage | Monthly or per campaign |
| `featuredCollections` | Homepage | Curated category showcase carousel (4-6 selected categories) | Bi-weekly |
| `featuredProducts` | Homepage | "Chef's Special" and "Today's Bestsellers" shelf | Weekly |
| `productCatalog` | Catalog / PDP | Comprehensive product records: pricing, lead time, ingredients, allergens | Daily (stock/price updates) |
| `categoryMetadata` | Category Pages| Description, culinary origins, category-level lead time advisories | Monthly |
| `mediaGallery` | Gallery Page | Behind-the-scenes kitchen snaps, packaging highlights, customer event trays | Weekly |
| `customerReviews` | Homepage & About| Verifiable customer reviews, neighborhood tags, star ratings | Monthly |
| `aboutKitchenStory` | About Page | Personal founder story, quality philosophy, hygiene standards | Seasonal / Quarterly |
| `businessContact` | Site-wide | WhatsApp telephone number, email, pickup address, operating hours, delivery radius | Infrequently |
| `seasonalCampaigns`| Landing Pages | Festival specials (Ramadan, Eid, Diwali, New Year feast boxes) | Seasonal (4-6 times/year) |
| `pageSeoMetadata` | Per-Page | Title tags, meta descriptions, OpenGraph social preview images | As needed |

---

## 3. Headless CMS Evaluation & Technology Selection

A comprehensive comparative evaluation was conducted across three industry-standard headless platforms suitable for modern Next.js deployments: **Sanity.io**, **Payload CMS**, and **Contentful**.

### 3.1 Comparative Assessment Matrix

| Evaluation Dimension | Sanity.io | Payload CMS (v3) | Contentful |
| :--- | :--- | :--- | :--- |
| **Hosting Model** | Fully managed cloud backend; open-source studio UI | Self-hosted (runs directly inside Next.js or Node container) | Fully managed proprietary cloud |
| **Pricing & Cost Scaling** | Generous free tier; pricing scales with API bandwidth/seats | **100% Free & Open-Source** (self-hosted with SQLite, Postgres, or MongoDB) | Expensive tier jump after small free tier limit |
| **Next.js Alignment** | Deep Next.js integration via `@sanity/client` and Live Content API | **Native Next.js App Router embed**; zero external servers needed | REST/GraphQL client; slower webhook-driven loops |
| **Media Handling** | Superb built-in CDN with dynamic image hotspot cropping | Local disk storage or AWS S3 / Cloudflare R2 adapters | Proprietary image CDN with asset size constraints |
| **Admin UI Experience** | Intuitive, clean desk UI; mobile-friendly studio | Sleek React-based dashboard; highly customizable | Industrial enterprise interface; overly complex for small kitchens |
| **TypeScript Integration** | TypeGen CLI generates types from schemas | **End-to-end type safety** (schemas and types generated directly from code) | Requires external codegen CLI toolchains |
| **Deployment Simplicity** | Studio deployed to Vercel or Sanity Cloud | Embedded in the same Next.js application repository | Separate web app portal |

### 3.2 Evaluation Summary & Final Recommendation

- **Contentful**: Eliminated due to aggressive enterprise pricing cliffs, rigid content modeling limits on free tiers, and lack of deep App Router co-location.
- **Sanity.io**: Exceptional cloud-hosted candidate with zero infrastructure maintenance. Ideal if the business desires complete decoupling and wants an out-of-the-box hosted media CDN without managing cloud buckets.
- **Payload CMS**: The standout technical recommendation for Yummy Spot.
  - **Single Repository & Zero Added Infrastructure**: Payload v3 runs as a route handler (`/admin`) natively inside the Next.js App Router codebase.
  - **Zero Monthly Subscription Overhead**: Runs on the existing hosting platform (e.g. Vercel + Neon Postgres or Supabase, or VPS with SQLite).
  - **Instant Local & Production Parity**: Database migrations and schemas are checked into Git version control.

> **Selected CMS Architecture**:
> - **Primary Recommendation**: **Payload CMS v3** (Native Next.js App Router integration, PostgreSQL or MongoDB storage, S3/R2 media adapter).
> - **Alternative Cloud Option**: **Sanity.io** (if the owner requests a separate isolated SaaS studio with zero database operations).

---

## 4. Content Schema Specifications

Below are the field configurations and validation boundaries for each primary content model.

### 4.1 `announcementBanner` (Global Single Instance)
```
Fields:
├── isVisible: Boolean (Default: false)
├── text: String (Max 90 chars, plain text)
├── linkText: String (Optional, e.g. "Order Now")
├── linkUrl: String (Optional, e.g. "/menu#category-seasonal-specials")
├── variant: Select ["emerald" (info), "amber" (warning), "rose" (urgent)]
└── scheduleExpiry: DateTime (Optional - auto-hides after date)
```

### 4.2 `product` (Collection)
```
Fields:
├── name: String (Required, 3-120 chars)
├── slug: Slug (Generated from name, unique)
├── shortDescription: Text (Required, max 200 chars)
├── description: RichText / Markdown (Cooking style, heritage, instructions)
├── category: Relationship -> Category (Required, Single)
├── labels: Multi-Select ["bestseller", "featured", "isNew", "seasonal", "festive", "customOrder"]
├── tags: Relationship -> ProductTag[]
├── pricing: Group
│   ├── price: Number (Required, Min 1)
│   ├── salePrice: Number (Optional, must be < price)
│   ├── priceUnit: Select ["per piece", "per kg", "per box", "per dozen", "per portion"]
│   └── currency: String (Default: "INR")
├── availability: Group
│   ├── inStock: Boolean (Default: true)
│   ├── availabilityNote: String (e.g., "Fridays only")
│   ├── preparationTimeMinutes: Number (Default: 60)
│   └── orderLeadTimeHours: Number (Default: 4)
├── foodDetails: Group
│   ├── ingredients: Array of Strings
│   ├── allergens: Array of Strings
│   ├── servingSize: String (e.g., "Serves 2-3 adults")
│   └── shelfLife: String (e.g., "Consume within 4 hours")
├── media: Group
│   ├── images: Array of Uploads (Min 1, Max 6)
│   └── thumbnail: Upload (1:1 aspect ratio)
└── seo: Group (metaTitle, metaDescription, ogImage)
```

### 4.3 `category` (Collection)
```
Fields:
├── name: String (Required, unique)
├── slug: Slug (Generated from name)
├── description: Text (Rich culinary context)
├── iconName: String (Lucide icon identifier)
├── image: Upload (Hero banner image)
├── sortOrder: Number (Display sort index)
├── isActive: Boolean (Default: true)
├── isFeatured: Boolean (Default: false)
└── seo: Group (metaTitle, metaDescription, ogImage)
```

### 4.4 `mediaGallery` (Collection)
```
Fields:
├── title: String (e.g., "Fresh Dum Biryani Handi Pot")
├── image: Upload (Required, High-res photo)
├── categoryTag: Select ["kitchen-prep", "packaging", "festivals", "events"]
├── associatedProduct: Relationship -> Product (Optional)
├── caption: Text (Optional)
└── sortOrder: Number
```

### 4.5 `customerReview` (Collection)
```
Fields:
├── reviewerName: String (Required, e.g., "Priya & Anand R.")
├── locationNeighborhood: String (e.g., "Koramangala, Bangalore")
├── rating: Number (Integer, 1 to 5, Default: 5)
├── reviewText: Text (Required, max 300 chars)
├── orderedProduct: Relationship -> Product (Optional)
├── isVerifiedOrder: Boolean (Default: true)
└── isFeatured: Boolean (Default: false)
```

---

## 5. Non-Technical Owner Operating Workflows

Step-by-step procedures designed for the kitchen owner using a mobile device or desktop browser.

### 5.1 Workflow A: Adding a New Seasonal Product

```
[ Log in at /admin ]
         │
         ▼
[ Tap 'Products' -> 'Create New' ]
         │
         ▼
[ Enter Product Name: "Handmade Saffron Rasmalai" ]
         │
         ▼
[ Select Category: "Desserts & Sweets" ]
         │
         ▼
[ Enter Price: "450", Unit: "per box", Lead Time: "6 hours" ]
         │
         ▼
[ Upload Photos: Drag & drop 2 phone photos ] (Auto-compressed to WebP)
         │
         ▼
[ Dietary Info: Add ingredients ("Cow milk, saffron, cardamom, pistachio") ]
         │
         ▼
[ Tap 'Publish' ]
         │
         ▼
* Instant Webhook fires -> Next.js clears the cached /menu catalog *
Live on site within 1.5 seconds!
```

### 5.2 Workflow B: Updating Daily Inventory & Changing Prices

1. **Step 1**: Open phone browser, visit `https://yummyspot.com/admin`.
2. **Step 2**: Tap **Products**, type the dish name into the quick-search bar (e.g., `"Mandi"`).
3. **Step 3**:
   - To mark as sold out: Flip the **In Stock** switch from `ON` to `OFF`.
   - To update price: Change the numeric value in the **Price** field.
4. **Step 4**: Tap **Save Changes**.
5. **Outcome**: The product page immediately reflects the updated price or switches the CTA to "Pre-Order for Next Batch".

### 5.3 Workflow C: Adding a New Kitchen Snap to the Gallery

1. **Step 1**: In the admin menu, select **Gallery**.
2. **Step 2**: Tap **Upload Image** and select a freshly taken kitchen photo from the phone camera roll.
3. **Step 3**: Set the tag (e.g. `kitchen-prep` or `packaging`).
4. **Step 4**: (Optional) Link it to an existing product so customers viewing the gallery can tap "Order This Dish".
5. **Step 5**: Tap **Publish**.

---

## 6. Integration Architecture (Next.js + Cache Revalidation)

The data flow utilizes Next.js App Router on-demand Incremental Static Regeneration (ISR) combined with cache tags for instant updates without rebuilding the application.

```
+-----------------------------------------------------------------------------+
|                               CMS DASHBOARD                                 |
|                      (Owner publishes price change)                         |
+--------------------------------------+--------------------------------------+
                                       |
                                       | Webhook POST /api/revalidate
                                       | Payload: { secret, tag: "product:mutton-mandi" }
                                       v
+-----------------------------------------------------------------------------+
|                         NEXT.JS API ROUTE                                   |
|                        (app/api/revalidate/route.ts)                        |
|                                                                             |
| 1. Authenticate secret token                                                |
| 2. Call revalidateTag('products')                                           |
| 3. Call revalidateTag('category:biryani-mandi')                             |
| 4. Call revalidatePath('/menu')                                             |
+--------------------------------------+--------------------------------------+
                                       |
                                       | Cache Invalidation Signal
                                       v
+-----------------------------------------------------------------------------+
|                         NEXT.JS CACHE & EDGE CDN                            |
|                                                                             |
| Next request serves freshly purged data with zero server downtime!          |
+-----------------------------------------------------------------------------+
```

### 6.1 Revalidation Webhook Handler Code Specification

```typescript
// app/api/revalidate/route.ts  (Phase 6 implementation)
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization')
    const secret = process.env.CMS_REVALIDATION_SECRET

    if (!secret || authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { model, slug, categorySlug } = body

    if (model === 'product') {
      revalidateTag('products')
      if (categorySlug) revalidateTag(`category:${categorySlug}`)
      if (slug && categorySlug) {
        revalidatePath(`/menu/${categorySlug}/${slug}`)
      }
    } else if (model === 'category') {
      revalidateTag('categories')
      if (slug) revalidatePath(`/menu/${slug}`)
    } else if (model === 'banner' || model === 'hero') {
      revalidateTag('global-content')
      revalidatePath('/')
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    )
  }
}
```

---

## 7. Phased Implementation Strategy

| Phase | Milestone Title | Key Deliverables | Duration | Technical Gate |
| :---: | :--- | :--- | :--- | :--- |
| **Phase 4** | **CMS Setup & Modeling** | Deploy Payload CMS v3 at `/admin`; configure database; setup Cloudflare R2; implement authentication | 1.5 Weeks | Admin panel accessible; image uploads render correctly |
| **Phase 5** | **Content Migration** | Seed 10 categories; seed 30 initial products; connect ISR webhooks | 1 Week | Price update in CMS updates live page in < 2 seconds |
| **Phase 6** | **Owner Training** | Video walkthrough; printed cheat sheet; PWA shortcut on owner's phone; 7-day support | 3 Days | Owner creates a test dish and updates stock independently |

---

*This CMS architecture balances enterprise-grade type safety and performance with extreme non-technical operational simplicity.*
