# Product & Category Data Model Specification

> **Brand**: Yummy Spot  
> **Tagline**: *Homemade. Premium. Delivered.*  
> **Document Version**: 1.0.0  
> **Status**: Production Architecture  
> **Target Scope**: TypeScript Definitions, Database Entities, Zod Validation Schemas, and WhatsApp Message Serialization  

---

## 1. Domain Modeling Philosophy

Unlike conventional restaurant or fast-food databases optimized for fast inventory turnover and immediate table/driver dispatches, **Yummy Spot's** data model addresses the unique realities of an artisan, home-based culinary operation:
1. **Batch Preparation Windows**: Dishes have preparation lead times (`preparationTimeMinutes`, `orderLeadTimeHours`) rather than instantaneous dispatch.
2. **Dynamic Packaging & Yield**: Prices are tied to artisanal units (`per piece`, `per kg`, `per box`, `per dozen`) rather than generic menu items.
3. **Ingredient & Allergen Transparency**: High sensitivity to homemade integrity (pure cow ghee, cold-pressed oils, zero chemical preservatives, nut/gluten warnings).
4. **Conversational Checkout Handoff**: Every product record houses pre-computed WhatsApp deep-link generation logic, serializing variants, portions, and special kitchen notes into URL-encoded strings.

---

## 2. Category Model

Categories form the high-level taxonomy of Yummy Spot. Each category acts as an SEO landing zone and a thematic grouping for artisanal offerings.

### 2.1 Category Entity Fields

| Field Name | Type | Required | Description | Example / Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Yes | Unique immutable identifier | `cat_biryani_mandi` |
| `name` | `string` | Yes | Human-readable category title | `"Biryani & Mandi"` |
| `slug` | `string` | Yes | URL-safe kebab-case slug | `"biryani-mandi"` (Indexed, unique) |
| `description` | `string` | Yes | Editorial culinary story and serving notes | `"Slow-dum long-grain basmati and wood-smoked Mandi platters..."` |
| `image` | `ProductImage` | Yes | Hero banner / card visual | 16:9 or 4:3 high-res photography |
| `icon` | `string` | Yes | Lucide icon token or custom SVG identifier | `"UtensilsCrossed"` / `"Flame"` |
| `sortOrder` | `number` | Yes | Manual display priority in menus | `10` (Lower integers appear first) |
| `isActive` | `boolean` | Yes | Controls public visibility across site | `true` |
| `isFeatured` | `boolean` | Yes | Flags for homepage shelf highlighting | `true` (Max 6 featured on homepage) |
| `productCount` | `number` | No | Cached count of active products | `14` (Computed at build / ISR) |
| `seo` | `CategorySEO` | Yes | Category-level meta tags | `metaTitle`, `metaDescription`, `ogImage` |
| `createdAt` | `string` | Yes | ISO 8601 UTC creation timestamp | `"2026-01-15T08:00:00.000Z"` |
| `updatedAt` | `string` | Yes | ISO 8601 UTC last update timestamp | `"2026-10-24T06:30:00.000Z"` |

---

## 3. Product Model

The Product entity contains all culinary, commercial, visual, dietary, and operational metadata for a single artisan SKU.

### 3.1 Field Groupings & Specifications

#### Group A: Core Identity
- `id` (`string`): Unique SKU identifier (e.g., `prod_mutton_mandi_01`).
- `name` (`string`): Full culinary name (e.g., `"Signature Slow-Cooked Mutton Mandi Platter"`).
- `slug` (`string`): URL-safe kebab-case slug (e.g., `"mutton-mandi-platter"`).
- `description` (`string`): Markdown-capable detailed sensory description, cooking method, and cultural heritage.
- `shortDescription` (`string`): Plain-text teaser (120-160 characters) used for category grid cards and social cards.

#### Group B: Classification & Tagging
- `categoryId` (`string`): Foreign key referencing `Category.id`.
- `categorySlug` (`string`): Denormalized category slug for zero-lookup URL construction (`/menu/[categorySlug]/[slug]`).
- `tags` (`ProductTag[]`): Array of faceted tags (e.g., `["halal", "slow-cooked", "pure-ghee", "feast"]`).
- `labels` (`ProductLabel[]`): Promotional and temporal flags (e.g., `bestseller`, `featured`, `isNew`, `seasonal`, `festive`, `customOrder`).

#### Group C: Pricing & Commercials
- `price` (`number`): Standard base price in decimal currency (e.g., `1200.00`).
- `salePrice` (`number | null`): Promotional discounted price. Must be `< price` when present.
- `priceUnit` (`PriceUnit`): Granular pricing unit: `'per piece' | 'per kg' | 'per box' | 'per dozen' | 'per portion'`.
- `currency` (`string`): ISO 4217 currency code (e.g., `"INR"`, `"AED"`, `"USD"`).

#### Group D: Media & Photography
- `images` (`ProductImage[]`): Ordered array of high-resolution image objects. First item serves as the main hero photo.
- `thumbnail` (`string`): Optimized 1:1 square webp/avif asset URL for quick-load cards and cart drawers.

#### Group E: Kitchen Availability & Fulfillment
- `inStock` (`boolean`): Master availability toggle. When `false`, order CTA transforms into an advance inquiry.
- `availabilityNote` (`string | null`): Operational caveat (e.g., `"Available Friday to Sunday only"`, `"Pre-orders close 24h prior"`).
- `deliveryArea` (`string[]`): Neighborhoods or postal clusters eligible for fresh delivery (e.g., `["South Zone", "Central City", "Metro Radius 15km"]`).
- `preparationTimeMinutes` (`number`): Active kitchen preparation duration (e.g., `120`).
- `orderLeadTimeHours` (`number`): Minimum advance notice required by the home kitchen before dispatch (e.g., `12` or `24`).

#### Group F: Culinary, Nutrition & Food Safety
- `ingredients` (`string[]`): Full transparent list of raw ingredients (e.g., `["Long-grain aged basmati", "Prime tender mutton", "Pure A2 cow ghee", "Cardamom", "Dried lime", "Saffron"]`).
- `allergens` (`string[]`): Standard allergen disclosures (e.g., `["Tree Nuts (Cashews, Almonds)", "Dairy (Ghee)"]`).
- `servingSize` (`string`): Clear portion context (e.g., `"Serves 2 to 3 adults (approx. 900g net)"`).
- `shelfLife` (`string`): Freshness guarantee and storage directions (e.g., `"Consume within 4 hours of delivery. Keep refrigerated up to 24 hours."`).

#### Group G: Conversational Commerce & WhatsApp
- `whatsappMessageTemplate` (`string`): Parameterized string template generating the customer's pre-filled message upon checkout click.

#### Group H: SEO & Canonicalization
- `metaTitle` (`string`): Custom title override (`"Mutton Mandi Platter | Homemade Feast | Yummy Spot"`).
- `metaDescription` (`string`): Custom meta description optimized for CTR.
- `canonicalUrl` (`string`): Self-referencing or master URL.
- `ogImage` (`string | null`): Specific 1200x630 social share banner.

#### Group I: Timestamps
- `createdAt` (`string`): ISO 8601 creation timestamp.
- `updatedAt` (`string`): ISO 8601 modification timestamp.
- `publishedAt` (`string | null`): ISO 8601 publish date for scheduled drops.

---

## 4. Production TypeScript Interfaces

Below are the complete, production-grade TypeScript interfaces to be integrated into the application codebase (e.g., at [`types/product.ts`](file:///C:/Users/mukthar/Downloads/yummy-spot/types/product.ts)).

```typescript
/**
 * Yummy Spot - Core Catalog & Product Domain Types
 * @version 1.0.0
 */

// ============================================================================
// Enums & Primitive Unions
// ============================================================================

export type PriceUnit =
  | 'per piece'
  | 'per kg'
  | 'per box'
  | 'per dozen'
  | 'per portion'
  | 'per pack';

export type ProductLabel =
  | 'bestseller'
  | 'featured'
  | 'isNew'
  | 'seasonal'
  | 'festive'
  | 'customOrder';

export type DietaryClassification =
  | 'halal'
  | 'pure-vegetarian'
  | 'contains-egg'
  | 'gluten-free'
  | 'dairy-free'
  | 'sugar-free'
  | 'diabetic-friendly'
  | 'postnatal-safe'
  | 'immunity-booster';

// ============================================================================
// Media & Asset Models
// ============================================================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  isPrimary?: boolean;
}

// ============================================================================
// Tag & Taxonomy Models
// ============================================================================

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  classification?: DietaryClassification;
  colorVariant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';
}

// ============================================================================
// SEO Models
// ============================================================================

export interface EntitySEO {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export type CategorySEO = EntitySEO;
export type ProductSEO = EntitySEO;

// ============================================================================
// Category Model
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ProductImage;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount?: number;
  seo: CategorySEO;
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

// ============================================================================
// Product Model
// ============================================================================

export interface Product {
  // Core
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;

  // Classification
  categoryId: string;
  categorySlug: string;
  tags: ProductTag[];
  labels: ProductLabel[];

  // Pricing
  price: number;
  salePrice: number | null;
  priceUnit: PriceUnit;
  currency: string;

  // Media
  images: ProductImage[];
  thumbnail: string;

  // Availability & Kitchen Lead Times
  inStock: boolean;
  availabilityNote: string | null;
  deliveryArea: string[];
  preparationTimeMinutes: number;
  orderLeadTimeHours: number;

  // Food Composition & Transparency
  ingredients: string[];
  allergens: string[];
  servingSize: string;
  shelfLife: string;

  // Conversational Ordering
  whatsappMessageTemplate: string;

  // Search Engine Optimization
  seo: ProductSEO;

  // Audit Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ============================================================================
// WhatsApp Message Builder Types
// ============================================================================

export interface WhatsAppOrderPayload {
  product: Pick<Product, 'id' | 'name' | 'price' | 'currency' | 'priceUnit'>;
  quantity: number;
  customerName?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  requestedDate?: string;
}
```

---

## 5. Zod Runtime Validation Schemas

To prevent corrupted data entering the application via CMS webhooks or JSON files, runtime schemas enforce data contracts:

```typescript
import { z } from 'zod';

export const ProductImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  alt: z.string().min(3),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataUrl: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const ProductTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  colorVariant: z.enum(['emerald', 'amber', 'rose', 'slate', 'violet']).optional(),
});

export const ProductSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(10),
  shortDescription: z.string().min(10).max(250),
  categoryId: z.string().min(1),
  categorySlug: z.string().min(1),
  tags: z.array(ProductTagSchema),
  labels: z.array(
    z.enum(['bestseller', 'featured', 'isNew', 'seasonal', 'festive', 'customOrder'])
  ),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable(),
  priceUnit: z.enum(['per piece', 'per kg', 'per box', 'per dozen', 'per portion', 'per pack']),
  currency: z.string().length(3).default('INR'),
  images: z.array(ProductImageSchema).min(1),
  thumbnail: z.string().url(),
  inStock: z.boolean(),
  availabilityNote: z.string().nullable(),
  deliveryArea: z.array(z.string()).min(1),
  preparationTimeMinutes: z.number().int().nonnegative(),
  orderLeadTimeHours: z.number().int().nonnegative(),
  ingredients: z.array(z.string()).min(1),
  allergens: z.array(z.string()),
  servingSize: z.string().min(2),
  shelfLife: z.string().min(2),
  whatsappMessageTemplate: z.string().min(5),
  seo: z.object({
    metaTitle: z.string().min(5).max(70),
    metaDescription: z.string().min(20).max(160),
    canonicalUrl: z.string().url().optional(),
    ogImage: z.string().url().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
}).refine(
  (data) => data.salePrice === null || data.salePrice < data.price,
  {
    message: "Sale price must be strictly lower than regular price",
    path: ["salePrice"],
  }
);
```

---

## 6. Data Relationships Architecture

The relational structure demonstrates how entities interconnect with zero circular dependencies:

```
+-----------------------------------------------------------------------------------------+
|                                    CATEGORY ENTITY                                      |
| id: "cat_biryani_mandi"                                                                 |
| name: "Biryani & Mandi"                                                                 |
| slug: "biryani-mandi"                                                                   |
| sortOrder: 4                                                                            |
| seo: { metaTitle: "Homemade Dum Biryani & Mandi | Yummy Spot", ... }                    |
+--------------------------------------------+--------------------------------------------+
                                             | 1
                                             |
                                             | Has Many (1:N)
                                             |
                                             v N
+-----------------------------------------------------------------------------------------+
|                                     PRODUCT ENTITY                                      |
| id: "prod_mutton_mandi_01"                                                              |
| categoryId: "cat_biryani_mandi"                                                         |
| categorySlug: "biryani-mandi"                                                           |
| name: "Signature Slow-Cooked Mutton Mandi Platter"                                      |
| price: 1350.00 | salePrice: 1250.00 | priceUnit: "per box" | currency: "INR"            |
| inStock: true | orderLeadTimeHours: 12                                                  |
| ingredients: ["Prime Mutton", "Aged Basmati", "A2 Ghee", "Arabian Spices"]              |
| allergens: ["Dairy (Ghee)", "Tree Nuts (Cashew/Almond)"]                                |
| servingSize: "Serves 2-3 Adults (1.1kg net box)"                                        |
+-----------+--------------------+-------------------+--------------------+---------------+
            |                    |                   |                    |
            | M:N                | M:N               | 1:N                | 1:1 Computed
            v                    v                   v                    v
   +-----------------+  +-----------------+  +-----------------+  +-----------------------+
   |   ProductTag    |  |  ProductLabel   |  |  ProductImage   |  |   WhatsApp Message    |
   |-----------------|  |-----------------|  |-----------------|  |-----------------------|
   | halal           |  | bestseller      |  | hero_mandi.webp |  | URL-encoded template  |
   | slow-cooked     |  | weekendSpecial  |  | detail_pot.webp |  | with live price, qty, |
   | premium-meat    |  +-----------------+  +-----------------+  | and customer notes    |
   +-----------------+                                            +-----------------------+
```

---

## 7. WhatsApp Message Templating Engine

Conversational commerce is the financial heartbeat of Yummy Spot. When a customer taps **"Order via WhatsApp"**, the client invokes a pure builder function that constructs a formatted, readable, pre-filled WhatsApp link.

### 7.1 Template Generator Implementation

```typescript
/**
 * Generates an automated WhatsApp checkout URL for a product
 */
export function buildWhatsAppOrderUrl(payload: {
  phone: string; // e.g. "919876543210" without '+' or spaces
  product: Product;
  quantity: number;
  deliveryAddress?: string;
  notes?: string;
}): string {
  const { phone, product, quantity, deliveryAddress, notes } = payload;
  
  const unitPrice = product.salePrice ?? product.price;
  const totalPrice = (unitPrice * quantity).toLocaleString('en-IN', {
    style: 'currency',
    currency: product.currency,
  });

  const messageLines = [
    `*NEW ORDER INQUIRY — YUMMY SPOT* 🍲`,
    `--------------------------------------`,
    `*Item:* ${product.name}`,
    `*Quantity:* ${quantity} (${product.priceUnit})`,
    `*Estimated Total:* ${totalPrice}`,
    `*Lead Time:* Requires ${product.orderLeadTimeHours}h advance preparation`,
    ``,
    `*Delivery Preference:*`,
    `📍 ${deliveryAddress?.trim() ? deliveryAddress : '_To be provided via chat_'}`,
    ``,
    `*Special Instructions / Dietary Notes:*`,
    `📝 ${notes?.trim() ? notes : 'Standard preparation'}`,
    `--------------------------------------`,
    `Please confirm kitchen availability, delivery slot, and payment UPI/link. Thank you!`,
  ];

  const fullMessage = messageLines.join('\n');
  const encodedText = encodeURIComponent(fullMessage);

  return `https://wa.me/${phone}?text=${encodedText}`;
}
```

### 7.2 Example Output String

For a customer ordering `2` portions of *Slow-Cooked Mutton Mandi Platter*:

```
*NEW ORDER INQUIRY — YUMMY SPOT* 🍲
--------------------------------------
*Item:* Signature Slow-Cooked Mutton Mandi Platter
*Quantity:* 2 (per box)
*Estimated Total:* ₹2,500.00
*Lead Time:* Requires 12h advance preparation

*Delivery Preference:*
📍 Flat 4B, Emerald Heights, Green Glen Layout

*Special Instructions / Dietary Notes:*
📝 Extra fried onions and spicy tomato chutney please

--------------------------------------
Please confirm kitchen availability, delivery slot, and payment UPI/link. Thank you!
```

---

## 8. Concrete Domain Catalog Example (JSON)

```json
{
  "id": "prod_mutton_mandi_01",
  "name": "Signature Slow-Cooked Mutton Mandi Platter",
  "slug": "mutton-mandi-platter",
  "shortDescription": "Tender grass-fed mutton slow-steamed over spiced fragrant basmati rice with toasted nuts and caramelized onions.",
  "description": "Our signature weekend centerpiece. Prepared in traditional sealed vessels using generational wood-smoked spice blends, long-grain basmati, and tender bone-in mutton cooked until it falls apart effortlessly. Finished with fried golden raisins, whole toasted almonds, and fiery red chili-garlic salan.",
  "categoryId": "cat_biryani_mandi",
  "categorySlug": "biryani-mandi",
  "tags": [
    { "id": "t1", "name": "Halal", "slug": "halal", "colorVariant": "emerald" },
    { "id": "t2", "name": "Slow Cooked", "slug": "slow-cooked", "colorVariant": "amber" },
    { "id": "t3", "name": "Family Feast", "slug": "family-feast", "colorVariant": "violet" }
  ],
  "labels": ["bestseller", "featured"],
  "price": 1350,
  "salePrice": 1250,
  "priceUnit": "per box",
  "currency": "INR",
  "images": [
    {
      "id": "img_01",
      "url": "/images/menu/mutton-mandi-hero.webp",
      "alt": "Signature Slow-Cooked Mutton Mandi Platter served in traditional bronze tray",
      "width": 1200,
      "height": 800,
      "isPrimary": true
    }
  ],
  "thumbnail": "/images/menu/mutton-mandi-thumb.webp",
  "inStock": true,
  "availabilityNote": "Batch cooked exclusively Friday to Sunday. Pre-book 12 hours prior.",
  "deliveryArea": ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield (Special Batch)"],
  "preparationTimeMinutes": 180,
  "orderLeadTimeHours": 12,
  "ingredients": [
    "Aged Royal Basmati Rice",
    "Grass-fed prime mutton",
    "Pure buffalo and cow ghee",
    "Dried black Persian lime",
    "Cardamom",
    "Cloves",
    "Kashmiri saffron",
    "Toasted California almonds and cashews"
  ],
  "allergens": ["Dairy (Ghee)", "Tree Nuts (Almonds, Cashews)"],
  "servingSize": "Serves 2 to 3 adults generously (1.2 kg net)",
  "shelfLife": "Consume immediately upon receipt while piping hot. Can be refrigerated up to 24h at 4°C.",
  "whatsappMessageTemplate": "Hi Yummy Spot! I'd like to order Signature Slow-Cooked Mutton Mandi Platter.",
  "seo": {
    "metaTitle": "Signature Mutton Mandi Platter | Homemade Feast | Yummy Spot",
    "metaDescription": "Authentic homemade mutton mandi platter slow-cooked with aged basmati rice, pure ghee, and aromatic Arabic spices. Order fresh via WhatsApp.",
    "canonicalUrl": "https://yummyspot.com/menu#product-mutton-mandi-platter"
  },
  "createdAt": "2026-02-01T10:00:00.000Z",
  "updatedAt": "2026-10-24T05:30:00.000Z",
  "publishedAt": "2026-02-01T12:00:00.000Z"
}
```

---

## 9. Future Extension Points

The data schema is engineered with extensible joints to support upcoming business expansions without breaking backwards compatibility:

### 9.1 Custom Concierge Orders (`CustomOrderForm`)
Custom catering inquiries (e.g., weddings, baby showers, or corporate hampers) will bind to a dedicated schema extension:
```typescript
export interface CustomOrderRequest {
  eventType: 'wedding' | 'birthday' | 'corporate' | 'pooja' | 'other';
  guestCount: number;
  dietaryRestrictions: DietaryClassification[];
  budgetTier: 'standard' | 'premium' | 'luxury';
  targetDate: string;
  customNotes: string;
}
```

### 9.2 Product Bundles & Curated Hampers (`ProductBundle`)
Allows grouping existing SKUs into discounted combo packs (e.g., *"Weekend Family Feast: 1x Mutton Mandi + 1x Chicken Curry + 1x Ghee Halwa Box"*):
```typescript
export interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  items: Array<{ productId: string; quantity: number }>;
  bundleDiscountPercentage: number;
  seasonalOccasion?: string;
}
```

### 9.3 Kitchen Recipe & Story Logs (`CulinaryStory`)
Rich editorial narratives linked to products highlighting heirloom heritage:
```typescript
export interface CulinaryStory {
  productId: string;
  authorName: string;
  originRegion: string;
  storyMarkdown: string;
  familyHeritageNotes: string;
}
```

---

*This specification establishes the rigid TypeScript contracts and validation standards for all current and future Yummy Spot application layers.*
