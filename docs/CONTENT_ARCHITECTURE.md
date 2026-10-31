# Content Architecture & Information Architecture Blueprint

> **Brand**: Yummy Spot  
> **Tagline**: *Homemade. Premium. Delivered.*  
> **Document Version**: 1.0.0  
> **Status**: Production Architecture  
> **Scope**: Complete Information Architecture, Taxonomy, Search, Navigation, and Content Management Schema  
>
> **Note**: This is the original design blueprint. Ordering is now an in-app **order request** (see `docs/USER_FLOW.md`) with WhatsApp kept as a fallback contact, and content is managed in the custom admin (see `docs/CMS_PLAN.md`). Where this blueprint says "order via WhatsApp", read "add to request / send order request". Implemented routes are listed in `docs/SITE_MAP.md`.

---

## 1. Executive Summary & Brand Positioning

**Yummy Spot** is a digital storefront for a premium home-based artisanal culinary kitchen. Unlike commercial restaurants or cloud kitchens operating under high-turnover fast-food models, Yummy Spot operates on small-batch, crafted-to-order culinary principles:
- **Zero Industrial Additives**: Pure ingredients, authentic ghee, stone-ground spices, and generational recipes.
- **Made-to-Order Freshness**: Items are cooked per order batch with designated preparation lead times (ranging from 4 hours to 48 hours for festival or custom orders).
- **Request-based Commerce**: Product discovery, catalog browsing, dietary vetting, and customization occur on the web application; the customer sends an order request, and the owner confirms availability, timing, payment and delivery with them directly (phone or **WhatsApp**, started from the admin).

The content architecture must reflect trust, craftsmanship, hygiene, transparency (ingredients, allergens, shelf life), and clear ordering mechanics so customers understand how and when their food is made.

---

## 2. Content Hierarchy

The website follows an intuitive, shallow discovery funnel designed to minimize cognitive load while educating customers on batch availability and artisan preparation.

```
                                  +-------------------+
                                  |     Homepage      |
                                  |        (/)        |
                                  +---------+---------+
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
+--------v--------+                +--------v--------+                +--------v--------+
| Menu / Catalog  |                | Brand Stories   |                | Utility / Legal |
|     (/menu)     |                |  (/about, etc)  |                | (/privacy, etc) |
+--------+--------+                +--------+--------+                +--------+--------+
         |                                  |                                  |
         |---> Category sections            |---> /about (Kitchen Story)       |---> /privacy
         |     (#category-{slug})           |---> /gallery (Kitchen Visuals)   |---> /terms
         |                                  |---> /contact (WhatsApp/Direct)   |---> /sitemap.xml
         +---> Inline product details       |---> /custom-order (Catering)     |---> /robots.txt
                                              |---> Seasonal section on /menu     +-----------------
```

### 2.1 Route & Hierarchy Specifications

| Hierarchy Level | Route Pattern | Page Type | Primary Objective | Key Secondary Actions |
| :--- | :--- | :--- | :--- | :--- |
| **L0: Root** | `/` | Marketing Homepage | Brand storytelling, featured categories, seasonal specials, instant WhatsApp order CTA | Client-side search, testimonial reviews, kitchen hygiene credentials |
| **L1: Catalog** | `/menu` | Single Menu experience | All configured categories, global product search and dietary filters, product details, and seasonal items | Scroll to a category, expand details, add to request |
| **L1: Brand Story** | `/about` | Editorial Story | The culinary founder journey, hygiene standards, traditional ingredients, source farms | WhatsApp inquiry, read testimonials |
| **L1: Visual Gallery** | `/gallery` | Media Wall | High-resolution kitchen prep, packaging, customer events, behind-the-scenes video snippets | Click-through to relevant product PDP |
| **L1: Custom Concierge**| `/custom-order` | Guided Inquiry | Multi-step form for wedding boxes, party trays, corporate gifts, festival hampers (planned) | Submitted as an order request with notes |
| **L1: Contact Hub** | `/contact` | Communications | WhatsApp primary link, operating kitchen hours, delivery zones, Google Maps service radius | FAQ accordion, direct phone link |
| **L1: Regulatory** | `/privacy`, `/terms` | Legal Policy | Food safety compliance, cancellation policies, delivery liability, data privacy | Return to catalog |

---

## 3. Navigation Design

Navigation is engineered for immediate access to food items and zero-friction WhatsApp order handoffs across both mobile and desktop screens.

### 3.1 Primary Desktop Navigation (Header)

The top navigation stays sticky with backdrop-blur styling, guaranteeing instant visibility of the primary conversion button.

```
+---------------------------------------------------------------------------------------------------------+
| [Logo: YUMMY SPOT]    Menu v    About    Gallery    Custom Orders    Contact    [Search]  [ Order via WhatsApp ] |
+---------------------------------------------------------------------------------------------------------+
```

1. **Brand Identity**: Clickable SVG wordmark & artisan icon linking to `/`.
2. **Mega-Menu Dropdown (`Menu v`)**:
   - Displays 10 categories categorized under two thematic clusters: *Daily & Comfort Foods* and *Artisan & Wellness*.
   - Includes quick thumbnail previews of today's "Special of the Day".
3. **Story Links**: Quick access to `/about` and `/gallery`.
4. **Bespoke Services**: `/custom-order` (Catering & Hampers).
5. **Support Link**: `/contact`.
6. **Global Search Trigger**: Opens floating Command Palette / Search Modal (`Cmd + K` / `Ctrl + K`).
7. **Primary Call-To-Action (CTA)**: High-contrast emerald button with WhatsApp SVG icon, triggering direct WhatsApp chat with the owner using default greeting.

### 3.2 Mobile Navigation Drawer

On viewports `< 768px`, the desktop navigation collapses into an animated slide-over drawer triggered by a hamburger button.

```
+--------------------------------------------+
| [X] Close                  [Yummy Spot]    |
+--------------------------------------------+
|  [Search our homemade specialties...     ] |
+--------------------------------------------+
|  * Home                                    |
|  * Menu & Catalog                          |
|    - Homemade Meals                        |
|    - Biryani & Mandi (Weekend Feasts)      |
|    - Desserts & Sweets                     |
|    - Snacks & Savouries                    |
|    - Curries & Gravies                     |
|    - Traditional Wellness Foods            |
|    - Homemade Health Supplements           |
|    - Seasonal Specials (Active)            |
|    - Festival Specials                     |
|    - Custom Orders                         |
|  * About Our Kitchen                       |
|  * Food Gallery & Kitchen Snaps            |
|  * Custom Catering & Gift Hampers          |
|  * Contact & Delivery Areas                |
+--------------------------------------------+
|  [ Order Directly via WhatsApp (Online)  ] |
|  Operating Hours: Mon - Sun (9 AM - 9 PM)  |
+--------------------------------------------+
```

### 3.3 Persistent Mobile Quick-Bar (Bottom Navigation)

Mobile shoppers benefit from a persistent bottom utility bar fixed to the viewport base:
- **Home** (`/`)
- **Menu** (`/menu`)
- **Search** (Opens bottom sheet filter drawer)
- **WhatsApp Order** (Pulsing high-priority icon with direct link)

### 3.4 Footer Navigation Groups

The footer is structured into 4 logical columns optimized for SEO link equity and customer confidence.

```
+------------------------------------------------------------------------------------------------------+
| YUMMY SPOT                     EXPLORE MENU            ABOUT & KITCHEN           ORDER & LEGAL       |
| Pure homemade delicacies,      * Homemade Meals        * Our Culinary Journey    * How to Order      |
| crafted in small batches       * Biryani & Mandi       * Kitchen Hygiene & Prep  * Delivery Zones    |
| with authentic ingredients.    * Desserts & Sweets     * Artisan Gallery         * Custom Catering   |
| Delivered fresh to your door.  * Wellness Foods        * Customer Testimonials   * Privacy Policy    |
|                                * Health Supplements    * Contact Us              * Terms of Service  |
| [WhatsApp] [Instagram] [FB]    * All 10 Categories ->                            * FSSAI / Safety    |
+------------------------------------------------------------------------------------------------------+
| (c) 2026 Yummy Spot. All handcrafted rights reserved. | Powered by Small-Batch Passion.              |
+------------------------------------------------------------------------------------------------------+
```

---

## 4. Category Taxonomy & Hierarchy

Yummy Spot organizes its culinary offerings into **10 definitive categories**, structured with an extensible parent-child architecture that supports future catalog growth without breaking URL routes.

### 4.1 Master Category Table

| Category ID | Slug | Display Title | Culinary Profile | Target Order Model | Extensible Child Subcategories |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cat_meals` | `homemade-meals` | Homemade Meals | Balanced daily lunches and dinners, comforting home-style combos | Daily prep, 4-hour lead time | Lunch Trays, Executive Boxes, Tiffin Combos, Diet-Friendly Meals |
| `cat_desserts` | `desserts-sweets` | Desserts & Sweets | Traditional milk sweets, puddings, halwas, artisanal brownies | Small batch, 6-hour lead time | Ghee Sweets, Milk Desserts, Baked Treats, Sugar-Free Sweets |
| `cat_snacks` | `snacks-savouries` | Snacks & Savouries | Crisp evening tea-time savouries, samosas, spiced nuts, murukkus | Pantry shelf-stable & fresh fry | Tea-Time Bites, Traditional Savouries, Roasted Nuts & Seeds |
| `cat_biryani` | `biryani-mandi` | Biryani & Mandi | Dum biryanis, aromatic long-grain rice, slow-cooked Mandi platters | Weekend batches, pre-book 12h | Dum Biryani, Arabian Mandi, Weekend Family Platters, Raita & Salans |
| `cat_curries` | `curries` | Curries & Gravies | Rich slow-simmered gravies, traditional vegetarian and non-vegetarian curries | Fresh batch, 4-hour lead time | Signature Meat Gravies, Veg Delicacies, Coastal Curries, Base Masalas |
| `cat_wellness` | `wellness-foods` | Traditional Wellness Foods | Postpartum recipes, immunity broths, herbal decoctions, botanical remedies | Made-to-order, 24-hour lead | Herbal Soups, Postnatal Care, Traditional Porridges, Digestive Brews |
| `cat_supplements`| `health-supplements`| Homemade Health Supplements | Sprouted health mixes, botanical protein balls, herbal seeds, dry fruit laddus | Pantry stockable, 48-hour lead| Sprouted Malt Powders, Energy Laddus, Seed Mixes, Herbal Honey Blends |
| `cat_seasonal` | `seasonal-specials` | Seasonal Specials | Monsoon pakoras, summer mango delights, winter warmth soups | Limited availability, seasonal | Summer Mango Harvest, Monsoon Specials, Winter Delights |
| `cat_festival` | `festival-specials` | Festival Specials | Festive mithai boxes, Eid hampers, Diwali celebration packs | Pre-orders only, 48-hour lead | Eid Feasts, Diwali Hampers, New Year Celebration Boxes |
| `cat_custom` | `custom-orders` | Custom Orders | Bulk family gatherings, small-scale parties, customized dietary batches | Bespoke quote via WhatsApp | Party Trays, Corporate Lunch Packs, Custom Gift Hampers |

### 4.2 Parent-Child Category Hierarchy (Future-Proof Architecture)

To allow the kitchen to expand without database migrations, categories support recursive hierarchical relationships:

```
[ Root: /menu ]
   |
   +-- [ Category: Desserts & Sweets ] (`/menu#category-desserts-sweets`)
   |      |
   |      +-- [ Subcategory: Ghee Sweets ] (within `#category-desserts-sweets`)
   |      +-- [ Subcategory: Baked Treats ] (within `#category-desserts-sweets`)
   |      +-- [ Subcategory: Sugar-Free ] (within `#category-desserts-sweets`)
   |
   +-- [ Category: Traditional Wellness Foods ] (`/menu#category-wellness-foods`)
   |      |
   |      +-- [ Subcategory: Postnatal Care ] (within `#category-wellness-foods`)
   |      +-- [ Subcategory: Immunity Broths ] (within `#category-wellness-foods`)
   |
   +-- [ Category: Biryani & Mandi ] (`/menu#category-biryani-mandi`)
          |
          +-- [ Subcategory: Dum Biryanis ] (within `#category-biryani-mandi`)
          +-- [ Subcategory: Arabian Mandi ] (within `#category-biryani-mandi`)
```

> **Architectural Rule**: Product discovery stays on `/menu`; search and dietary filters apply across category sections. Category anchors are navigation aids, not separate SEO routes.

---

## 5. Breadcrumb Design & Algorithmic Rules

Breadcrumbs reinforce customer wayfinding and inject automated `BreadcrumbList` schema markup for enhanced Google Search rich snippets.

### 5.1 Breadcrumb Matrix

| Route Level | Route Pattern | Breadcrumb Trail Visual | Canonical JSON-LD Link Path |
| :--- | :--- | :--- | :--- |
| **Homepage** | `/` | *None displayed (Root)* | `[{"@type": "ListItem", "position": 1, "name": "Home", "item": "/"}]` |
| **Menu Hub** | `/menu` | `Home > Menu` | `Home (pos 1) > Menu (pos 2)` |
| **Custom Order** | `/custom-order` | `Home > Custom Order` | `Home (1) > Custom Order (2)` |
| **Brand Story** | `/about` | `Home > About Our Kitchen` | `Home (1) > About Our Kitchen (2)` |
| **Gallery** | `/gallery` | `Home > Food Gallery` | `Home (1) > Food Gallery (2)` |
| **Contact** | `/contact` | `Home > Contact Us` | `Home (1) > Contact Us (2)` |
| **Legal** | `/privacy` / `/terms` | `Home > Legal > Privacy Policy` | `Home (1) > Legal (2) > Privacy (3)` |

### 5.2 Implementation Logic

```typescript
// Algorithmic Breadcrumb Generator (Client/Server helper)
export interface BreadcrumbSegment {
  name: string;
  href: string;
  isCurrent: boolean;
}

export function generateBreadcrumbs(pathname: string, entityTitle?: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ name: 'Home', href: '/', isCurrent: pathname === '/' }];
  if (pathname === '/') return segments;

  const parts = pathname.split('/').filter(Boolean);
  let accumulatedPath = '';

  parts.forEach((part, index) => {
    accumulatedPath += `/${part}`;
    const isLast = index === parts.length - 1;
    let label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
    // Override slug with human-friendly entity title on terminal node
    if (isLast && entityTitle) {
      label = entityTitle;
    }

    segments.push({
      name: label,
      href: accumulatedPath,
      isCurrent: isLast,
    });
  });

  return segments;
}
```

---

## 6. Search Structure & Client-Side Fuzzy Engine

Given Yummy Spot's curated catalog size (~50 to 250 active SKUs), search is executed client-side using an in-memory fuzzy index (e.g. MiniSearch or Fuse.js) with zero server latency, instant keyboard interactions, and rich multi-faceted filtering.

### 6.1 Search Weighting Configuration

```typescript
export const searchIndexConfig = {
  keys: [
    { name: 'name', weight: 1.0 },           // Exact & partial product titles
    { name: 'categoryTitle', weight: 0.8 },   // Category associations
    { name: 'tags', weight: 0.7 },            // 'gluten-free', 'kids-favorite', 'immunity'
    { name: 'ingredients', weight: 0.5 },     // 'almonds', 'saffron', 'country chicken'
    { name: 'shortDescription', weight: 0.4 },// Summary teasers
    { name: 'description', weight: 0.2 },     // Deep body content
  ],
  threshold: 0.35, // Balanced between exactness and forgiving typos
  minMatchCharLength: 2,
};
```

### 6.2 Filter Taxonomy Matrix

Users can drill down into matching results via 4 orthogonal facet dimensions:

```
+-----------------------------------------------------------------------------------+
| [ Search: "halwa"                                                              ]  |
+-----------------------------------------------------------------------------------+
| CATEGORY FILTER         DIETARY TAGS             AVAILABILITY     PRICE RANGE     |
| [x] Desserts & Sweets   [x] Pure Ghee            [x] In Stock     (o) Under $15   |
| [ ] Snacks              [ ] Sugar-Free / Diabetic[ ] Pre-Order    ( ) $15 - $30   |
| [ ] Festival Specials   [ ] Gluten-Free          [ ] Weekend Only ( ) $30+        |
| [ ] All Categories      [ ] Halal Certified                                       |
+-----------------------------------------------------------------------------------+
| Results: 4 matching artisanal delicacies found                                   |
+-----------------------------------------------------------------------------------+
```

1. **Category**: Single or multi-select of the 10 categories.
2. **Dietary & Lifestyle Tags**:
   - `Halal`: Hand-slaughtered, 100% halal meats.
   - `Pure Vegetarian`: Zero eggs, zero animal gelatin.
   - `Nut-Free`: Prepared in isolated sanitized vessels.
   - `Sugar-Free / Natural Jaggery`: Sweetened exclusively with organic palm jaggery or dates.
   - `Postnatal Friendly`: Formulated for lactation and restorative care.
3. **Availability & Lead Time**:
   - `Ready Today`: Standard 4-hour prep window.
   - `Weekend Special`: Batch-cooked exclusively Friday through Sunday.
   - `Advance Pre-Order (24h+)`: Slow-cure or complex multi-step processes.
4. **Price Tiers**:
   - Tier 1: Low-ticket daily snacking (e.g., `< ₹250 / $10`).
   - Tier 2: Standard meals & medium dessert boxes (e.g., `₹250 - ₹750 / $10 - $25`).
   - Tier 3: Premium mandi platters, wellness kits, festival gift boxes (e.g., `₹750+ / $25+`).

---

## 7. Content Relationship Architecture

This model maps how products, categories, tags, labels, and SEO nodes interconnect across the digital storefront.

### 7.1 Entity Relationship Diagram

```
+------------------+         Belongs to (1:N)         +-------------------+
|     Category     |<---------------------------------|      Product      |
|------------------|                                  |-------------------|
| id               |                                  | id                |
| name, slug       |                                  | name, slug        |
| description      |                                  | categoryId        |
| icon, image      |                                  | price, salePrice  |
| sortOrder        |                                  | preparationTime   |
+--------+---------+                                  | inStock (boolean) |
         |                                            +---+-----+-----+---+
         | Has SEO (1:1)                                  |     |     |   |
         v                                                |     |     |   |
+------------------+                                      |     |     |   |
|   Category SEO   |                                      |     |     |   |
|------------------|                                      |     |     |   |
| metaTitle        |                                      |     |     |   |
| metaDescription  |                                      |     |     |   |
| ogImage          |                                      |     |     |   |
+------------------+                                      |     |     |   |
                                                          |     |     |   |
      +---------------------------------------------------+     |     |   |
      | Has Many (M:N)                                          |     |   |
      v                                                         |     |   |
+------------------+       Has Many (M:N)                       |     |   |
|   Product Tag    |<-------------------------------------------+     |   |
|------------------|                                                  |   |
| id, name, slug   |                                                  |   |
| badgeVariant     |                                                  |   |
+------------------+                                                  |   |
                                                                      |   |
      +---------------------------------------------------------------+   |
      | Has Many (M:N)                                                    |
      v                                                                   |
+------------------+       Has 1:1 Computed                               |
|  Product Label   |                                                      |
|------------------|                                                      |
| bestseller       |                                                      |
| seasonal/festive |                                                      |
| customOrder      |                                                      |
+------------------+                                                      |
                                                                          v
                                                              +-------------------+
                                                              |  WhatsApp Action  |
                                                              |-------------------|
                                                              | prefilledTemplate |
                                                              | formattedText     |
                                                              | directUrl         |
                                                              +-------------------+
```

### 7.2 Relational Content Schema

```
[ Category: Biryani & Mandi ]
       |
       +---> [ Product: Slow-Cooked Mutton Mandi Platter ]
                   |
                   +---> Tags: ["Slow-Cooked", "Premium-Cut", "Feast-Platter", "Halal"]
                   |
                   +---> Labels: ["Bestseller", "Weekend Special"]
                   |
                   +---> Availability: { inStock: true, orderLeadTimeHours: 12, days: ["Fri", "Sat", "Sun"] }
                   |
                   +---> WhatsApp Message:
                   |     "Hi Yummy Spot! I'd like to pre-order Slow-Cooked Mutton Mandi Platter (2-Person Box)..."
                   |
                   +---> SEO Node:
                         { title: "Slow-Cooked Mutton Mandi Platter | Yummy Spot", ... }
```

---

## 8. CMS Editable Regions Blueprint

To guarantee that non-technical business owners can operate the storefront without touching code or triggering redeployments, every customer-facing surface area is broken into bounded CMS regions.

| Page / Surface | CMS Region ID | Editable Field | Data Type | Owner Constraints & Help Guidelines |
| :--- | :--- | :--- | :--- | :--- |
| **Global** | `global_announcement` | Banner Text | Rich Text (short) | Max 80 characters. Highlight holidays, kitchen closures, or discounts. |
| **Global** | `global_announcement` | Is Visible | Boolean | Toggle on/off instantaneously across all pages. |
| **Global** | `global_announcement` | Link URL | Text (URL/Slug) | Optional link target (e.g. `/menu#category-seasonal-specials`). |
| **Global** | `global_contact` | WhatsApp Primary Number | String (E.164) | International format without `+` (e.g. `919876543210`). |
| **Global** | `global_contact` | Operating Hours | String | Displayed in headers, drawer, and contact pages. |
| **Global** | `global_contact` | Kitchen Address / Zone | String | City, neighborhoods served, and postal codes. |
| **Homepage**| `home_hero` | Eyebrow Badge | String | e.g., "100% Homemade With Pure Ghee & Love". |
| **Homepage**| `home_hero` | Main Heading (H1) | String | Emotional hook (max 60 chars). |
| **Homepage**| `home_hero` | Subtitle | Text | Narrative paragraph (max 160 chars). |
| **Homepage**| `home_hero` | Primary CTA Label & Target | String pair | e.g. "Explore Today's Menu" -> `/menu`. |
| **Homepage**| `home_hero` | Hero Showcase Images | Image Array (1-4) | High-res culinary close-ups, min 1200x800px. |
| **Homepage**| `home_hero` | Highlighted Categories | Category Ref[] | Reorder and select 4 to 6 categories for top shelf. |
| **Homepage**| `home_featured_prods`| Highlighted Products | Product Ref[] | Curate up to 8 bestsellers for the front page. |
| **Homepage**| `home_seasonal_banner`| Campaign Banner Image | Image Asset | 1920x600px desktop, auto-cropped for mobile. |
| **Homepage**| `home_seasonal_banner`| Campaign Title & Dates | String | e.g. "Ramadan & Eid Delicacies — Pre-Orders Open". |
| **Homepage**| `home_testimonials` | Customer Quotes | Array of Objects | Customer Name, Neighborhood, Rating (1-5), Quote text. |
| **Menu Hub**| `menu_header` | Intro Paragraph | Text | Context on batch preparation and freshness guarantee. |
| **Category**| `cat_metadata` | Category Description | Rich Text | Detailed culinary origin and serving suggestions. |
| **Category**| `cat_metadata` | Lead Time Notice | String | e.g. "All biryanis require 12 hours advance booking." |
| **Product** | `product_core` | Title & Short Teaser | String pair | Clear dish name and sensory single-line summary. |
| **Product** | `product_pricing` | Base Price & Sale Price | Number | Regular price and optional promotional price. |
| **Product** | `product_pricing` | Price Unit | Enum | `per piece`, `per kg`, `per box`, `per dozen`. |
| **Product** | `product_inventory`| Stock Status & Lead Time | Enum + Number | `In Stock`, `Out of Stock`, `Pre-Order Only`; Prep hours. |
| **Product** | `product_culinary` | Ingredients & Allergens | String Arrays | Clear lists for dietary safety. |
| **Product** | `product_media` | Gallery Photos | Image Array | Minimum 1, max 6 photographs showing dish and packaging. |
| **About**   | `about_story` | Founder Narrative | Rich Text (long) | The personal journey, inspiration, and kitchen heritage. |
| **About**   | `about_pillars` | Quality Commitments | Array of Objects | Icon, Heading ("No Artificial Colors"), Description. |
| **Gallery** | `gallery_grid` | Media Grid Items | Image Array | Photos with captions, tagging related product SKUs. |
| **Custom**  | `custom_order_info`| Minimum Lead Times | String | Notice on large party catering requirements. |
| **SEO**     | `seo_per_page` | Meta Title & Description | String pair | Custom title and meta description override per route. |

---

## 9. Content Lifecycle & Freshness Rules

To guarantee that customers never experience disappointment by ordering items that cannot be fulfilled:
1. **Daily Availability Cutoff**: Meals categorized under `cat_meals` feature an automated morning cutoff notice (e.g. *"Orders for today's lunch close at 10:30 AM"*).
2. **Weekend Pre-Order Batches**: `cat_biryani` items display countdown indicators for weekend slots (Friday/Saturday/Sunday pickup/delivery).
3. **Out-of-Stock Graceful State**: When a product's `inStock` toggle is disabled in the CMS, the primary button changes from **"Order via WhatsApp"** to **"Ask for Next Batch on WhatsApp"**, retaining customer intent without a broken experience.

---

*This architecture document serves as the binding blueprint for data schema definitions, UI design, and client-side state. Backend and admin decisions are recorded in `docs/ARCHITECTURE.md` and `docs/CMS_PLAN.md`.*
