# Search Engine Optimization (SEO) & Visibility Strategy

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Status**: Production Architecture
> **Scope**: Organic Search, Local SEO, Rich Snippets, Social Graph, Core Web Vitals

---

## 1. Keyword Taxonomy & Search Intent Strategy

### 1.1 Primary Brand Keywords

| Keyword Cluster | Search Intent | Target Route | Profile |
| :--- | :--- | :--- | :--- |
| `homemade food delivery near me` | Commercial / Local | `/`, `/menu` | High volume, high local intent |
| `premium homemade desserts` | Commercial / Product | `/menu#category-desserts-sweets` | High conversion, gift intent; indexed as part of `/menu` |
| `traditional wellness food delivery` | Informational / Commercial | `/menu#category-wellness-foods` | High affinity, low price-sensitivity; indexed as part of `/menu` |
| `authentic slow cooked dum biryani` | Commercial / Product | `/menu#category-biryani-mandi` | High volume on weekends; indexed as part of `/menu` |
| `homemade postpartum food delivery` | High Intent / Niche | `/menu#category-wellness-foods` | Extremely loyal, recurring; indexed as part of `/menu` |
| `pure cow ghee sweets online` | Commercial / Quality | `/menu#category-desserts-sweets` | High trust requirement; indexed as part of `/menu` |

### 1.2 Category-Specific Secondary Keywords

| Category | Slug | Secondary Keywords |
| :--- | :--- | :--- |
| **Homemade Meals** | `homemade-meals` | `daily home cooked lunch`, `wholesome home meal delivery`, `homemade tiffin box` |
| **Desserts & Sweets** | `desserts-sweets` | `pure ghee mysore pak`, `homemade gulab jamun`, `no artificial color sweets`, `diabetic friendly sweets` |
| **Snacks & Savouries** | `snacks-savouries` | `tea time snacks homemade`, `crispy hand rolled murukku`, `homemade samosa delivery` |
| **Biryani & Mandi** | `biryani-mandi` | `homemade mutton mandi platter`, `authentic dum chicken biryani`, `family mandi feast box` |
| **Curries** | `curries` | `traditional homestyle chicken curry`, `slow simmered mutton gravy`, `authentic regional curries` |
| **Wellness Foods** | `wellness-foods` | `postnatal healing food`, `herbal immunity decoctions`, `traditional ayurvedic soups` |
| **Health Supplements** | `health-supplements` | `sprouted multigrain health malt`, `dry fruit energy laddus`, `homemade herbal lactation laddus` |
| **Seasonal Specials** | `seasonal-specials` | `summer mango desserts homemade`, `monsoon evening snack specials` |
| **Festival Specials** | `festival-specials` | `diwali homemade sweet gift hampers`, `eid feast pre order boxes`, `ramadan iftar homemade snacks` |
| **Custom Orders** | `custom-orders` | `small gathering home catering`, `custom artisanal wedding gift boxes` |

### 1.3 Long-Tail Strategy

Target high-intent buyers without competing against food delivery giants:
1. **Ingredient transparency**: `"homemade sweets made with A2 cow ghee"`, `"biryani without artificial colors or MSG"`
2. **Medical & life-stage needs**: `"traditional postpartum food delivery for new mothers"`, `"natural jaggery sweets for diabetics"`
3. **Small-batch pre-orders**: `"weekend mutton mandi pre-order"`, `"festival mithai box delivered to home"`

---

## 2. Metadata Architecture & Templates

### 2.1 Title & Description Matrix

| Route | Title Template | Description Template |
| :--- | :--- | :--- |
| `/` | `Yummy Spot — Homemade. Premium. Delivered.` | Order handcrafted meals, artisanal desserts, slow-cooked mandi, and traditional wellness foods made in small batches with pure ingredients. |
| `/menu` | `Our Handcrafted Menu \| Yummy Spot` | Explore all 10 culinary categories: homestyle meals, pure ghee desserts, slow-dum biryani, and natural wellness supplements prepared fresh to order. |
| `/menu` | `Our Menu \| Yummy Spot` | Keep category names, published product information, and ordering details together on the canonical Menu page. |
| `/about` | `Our Culinary Story & Kitchen Hygiene \| Yummy Spot` | Discover the passion behind Yummy Spot — small-batch kitchen using generational recipes, A2 ghee, and strict hygiene standards. |
| `/contact` | `Contact & Delivery Zones \| Yummy Spot` | Order directly via WhatsApp or verify delivery coverage. Kitchen hours: Mon-Sun 9 AM - 9 PM. |

---

## 3. JSON-LD Structured Data Blueprints

### 3.1 Homepage: Organization + LocalBusiness + WebSite

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yummyspot.com/#organization",
      "name": "Yummy Spot",
      "url": "https://yummyspot.com",
      "description": "Premium homemade meals, artisanal desserts, and traditional wellness foods.",
      "sameAs": ["https://instagram.com/yummyspot", "https://facebook.com/yummyspot"]
    },
    {
      "@type": "FoodEstablishment",
      "@id": "https://yummyspot.com/#localbusiness",
      "name": "Yummy Spot Artisanal Kitchen",
      "priceRange": "$$",
      "servesCuisine": ["Home-style", "Indian", "Arabian", "Artisanal Desserts"],
      "hasMenu": "https://yummyspot.com/menu"
    },
    {
      "@type": "WebSite",
      "url": "https://yummyspot.com",
      "name": "Yummy Spot",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://yummyspot.com/menu?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

### 3.2 Menu: BreadcrumbList + ItemList

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yummyspot.com" },
        { "@type": "ListItem", "position": 2, "name": "Menu", "item": "https://yummyspot.com/menu" }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Yummy Spot Menu",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "url": "https://yummyspot.com/menu#product-mutton-mandi-platter" }
      ]
    }
  ]
}
```

### 3.3 Inline Product: Product + Offer

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "Signature Slow-Cooked Mutton Mandi Platter",
      "description": "Tender grass-fed mutton slow-steamed over spiced fragrant basmati rice.",
      "brand": { "@type": "Brand", "name": "Yummy Spot" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "1250",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}
```

### 3.4 Menu Social Preview

```tsx
import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const title = "Yummy Spot Menu"

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", backgroundColor: "#064e3b", color: "#fef3c7", padding: 60 }}>
      <h1 style={{ fontSize: 56, fontWeight: 800 }}>{title}</h1>
      <p style={{ fontSize: 32, color: "#f59e0b" }}>Order via WhatsApp → Yummy Spot</p>
    </div>,
    { ...size }
  )
}
```

---

## 4. Technical SEO & Core Web Vitals

| Metric | Target | Strategy |
| :--- | :--- | :--- |
| **LCP** | < 1.8s | `<Image priority>` on hero elements; preload critical AVIF; zero render-blocking JS |
| **CLS** | < 0.05 | Explicit `width`/`height` on all images; reserve layout height for banners |
| **INP** | < 150ms | No heavyweight JS on first click; 150ms debounce on search; instant routing |
| **TTFB** | < 150ms | Cloudflare static assets (prerendered pages served from the edge) |

### Image Optimization Rules
1. Negotiate `AVIF` then `WebP` automatically via `next/image`
2. Default `quality={80}` for ~60% size reduction with high visual fidelity
3. `loading="lazy"` on all below-fold images
4. `next/font/google` with `display: "swap"` to eliminate FOUT

---

## 5. Sitemap Priority Guide

```
Priority 1.0  ──►  Homepage (/)
Priority 0.9  ──►  Menu Hub (/menu) & Category Pages
Priority 0.8  ──►  Product Detail Pages
Priority 0.7  ──►  Custom Orders (/custom-order)
Priority 0.6  ──►  About, Gallery, Contact
Priority 0.3  ──►  Legal Pages (/privacy, /terms)
```

---

## 6. Local SEO & Google Business Profile

1. **NAP Consistency**: Name, Address, Phone must match exactly between footer, contact page, schema, and Google Business Profile.
2. **Business Categories**: Primary: *"Catering Food and Drink Supplier"*; Secondary: *"Confectionery Store"*, *"Meal Delivery Service"*
3. **Delivery Radius**: List serviced pin codes and residential communities in footer and schema markup.
4. **Google Reviews**: Post-delivery WhatsApp message prompts satisfied customers to leave a 5-star review.

---

*This SEO plan ensures supreme organic search placement, crystal-clear social sharing cards, and elite Core Web Vitals rankings.*
