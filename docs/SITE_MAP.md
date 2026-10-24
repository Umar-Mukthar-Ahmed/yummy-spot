# Site Map & Route Architecture Specification

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Status**: Production Architecture
> **Framework**: Next.js App Router

---

## 1. Complete URL Architecture

Yummy Spot employs a clean, hierarchical URL design engineered for search engine indexability, brand legibility, and intuitive customer navigation.

```
/
├── menu/
│   ├── [category-slug]/
│   │   └── [product-slug]/
├── about/
├── gallery/
├── contact/
├── custom-order/
├── seasonal/
├── privacy/
├── terms/
├── sitemap.xml
├── robots.txt
└── manifest.webmanifest
```

### 1.1 Route Mapping Table

| URL Route | Next.js File System Path | Page Purpose | Render Strategy | Primary Content Entity |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Home | ISR (revalidate: 3600) | Hero, featured categories, testimonials |
| `/menu` | `app/menu/page.tsx` | All Categories | ISR (revalidate: 3600) | 10 Category cards, search |
| `/menu/[category-slug]` | `app/menu/[category]/page.tsx` | Category Showcase | ISR (revalidate: 86400) | Products, filters |
| `/menu/[category-slug]/[product-slug]` | `app/menu/[category]/[product]/page.tsx` | Product Detail | ISR (revalidate: 86400) | Photos, price, ingredients, WhatsApp CTA |
| `/about` | `app/about/page.tsx` | Our Story | SSG | Kitchen origins, founder bio |
| `/gallery` | `app/gallery/page.tsx` | Visual Gallery | ISR (revalidate: 3600) | Photo grid, kitchen snaps |
| `/contact` | `app/contact/page.tsx` | Contact | SSG | WhatsApp CTA, delivery zones |
| `/custom-order` | `app/custom-order/page.tsx` | Bespoke Catering | SSG + Client Form | Event catering inquiry |
| `/seasonal` | `app/seasonal/page.tsx` | Seasonal Campaigns | ISR (revalidate: 3600) | Active festival drops |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy | SSG | Legal |
| `/terms` | `app/terms/page.tsx` | Terms of Service | SSG | Legal |
| `/sitemap.xml` | `app/sitemap.ts` | XML Sitemap | ISR (cached 24h) | Auto-generated |
| `/robots.txt` | `app/robots.ts` | Robots Directives | Cached | Crawler rules |
| `/manifest.webmanifest` | `app/manifest.ts` | PWA Manifest | Static JSON | App icons, theme colors |

---

## 2. Dynamic Route Strategy

### 2.1 Category Route: `app/menu/[category]/page.tsx`

```typescript
// app/menu/[category]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

// Pre-render all 10 known categories at build time
export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((cat) => ({ category: cat.slug }))
}

// Dynamic, SEO-rich metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: `${category.name} | Yummy Spot`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category?.isActive) notFound()
  const products = await getProductsByCategory(category.id)
  // render...
}
```

### 2.2 Product Detail Route: `app/menu/[category]/[product]/page.tsx`

```typescript
// app/menu/[category]/[product]/page.tsx
interface ProductPageProps {
  params: Promise<{ category: string; product: string }>
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((prod) => ({
    category: prod.categorySlug,
    product: prod.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { product: productSlug, category: categorySlug } = await params
  const [product, category] = await Promise.all([
    getProductBySlug(productSlug),
    getCategoryBySlug(categorySlug),
  ])
  if (!product || !category) return {}
  return {
    title: `${product.name} — ${category.name} | Yummy Spot`,
    description: product.shortDescription,
  }
}
```

---

## 3. Rendering Strategy: Static vs ISR vs Dynamic

```
+-------------------------------------------------------------------------------+
|                          RENDERING SPECTRUM                                   |
|                                                                               |
|  Pure Static (SSG)        On-Demand ISR              Dynamic / API            |
|  • /about                 • / (revalidate: 3600)     • /api/revalidate        |
|  • /privacy               • /menu (revalidate: 3600) • /api/search            |
|  • /terms                 • /menu/[cat]              • /sitemap.xml           |
|  • /manifest.webmanifest  • /menu/[cat]/[prod]                                |
+-------------------------------------------------------------------------------+
```

| Route | Render Type | Invalidation Trigger |
| :--- | :--- | :--- |
| `/` | ISR (1hr) | `revalidatePath('/')` via CMS webhook |
| `/menu` | ISR (1hr) | `revalidateTag('categories')` |
| `/menu/[category]` | ISR (24hr) | `revalidateTag('category:[slug]')` |
| `/menu/[category]/[prod]` | ISR (24hr) | `revalidateTag('product:[slug]')` |
| `/about`, `/contact` | SSG | Git commit or manual deploy |

---

## 4. Master Category URL Slugs

| # | Exact URL Slug | Display Name | Canonical Route |
| :-: | :--- | :--- | :--- |
| 1 | `homemade-meals` | Homemade Meals | `/menu/homemade-meals` |
| 2 | `desserts-sweets` | Desserts & Sweets | `/menu/desserts-sweets` |
| 3 | `snacks-savouries` | Snacks & Savouries | `/menu/snacks-savouries` |
| 4 | `biryani-mandi` | Biryani & Mandi | `/menu/biryani-mandi` |
| 5 | `curries` | Curries | `/menu/curries` |
| 6 | `wellness-foods` | Traditional Wellness Foods | `/menu/wellness-foods` |
| 7 | `health-supplements` | Homemade Health Supplements | `/menu/health-supplements` |
| 8 | `seasonal-specials` | Seasonal Specials | `/menu/seasonal-specials` |
| 9 | `festival-specials` | Festival Specials | `/menu/festival-specials` |
| 10 | `custom-orders` | Custom Orders | `/custom-order` |

---

## 5. Redirect Strategy

Add to `next.config.ts` when slugs need renaming:

```typescript
async redirects() {
  return [
    { source: '/seasonal', destination: '/menu/seasonal-specials', permanent: false },
    { source: '/biryani',  destination: '/menu/biryani-mandi',     permanent: true  },
    { source: '/sweets',   destination: '/menu/desserts-sweets',   permanent: true  },
    { source: '/wellness', destination: '/menu/wellness-foods',    permanent: true  },
    { source: '/order',    destination: '/menu',                   permanent: true  },
  ]
}
```

---

## 6. XML Sitemap Priority Guide

| Page Type | Priority | Change Frequency |
| :--- | :---: | :--- |
| Homepage | 1.0 | weekly |
| Menu Hub + Category Pages | 0.9 | weekly |
| Product Detail Pages | 0.8 | weekly |
| Custom Order | 0.75 | monthly |
| About, Gallery, Contact | 0.6 | monthly |
| Legal Pages | 0.3 | yearly |

---

## 7. Page Hierarchy Diagram

```
                              [ / (Home) ]
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
  [ /about ]                  [ /menu ]               [ /custom-order ]
  [ /gallery ]                     │                  [ /contact ]
  [ /privacy ]      ┌──────────────┴──────────────┐   [ /terms ]
  [ /terms ]        │        (10 Categories)       │
               [ /menu/homemade-meals ]            │
               [ /menu/desserts-sweets ]           │
               [ /menu/biryani-mandi ] ────────────┼──► [ /menu/biryani-mandi/[product] ]
               [ /menu/curries ]                   │
               [ /menu/wellness-foods ]            │
               [ /menu/health-supplements ]        │
               [ /menu/seasonal-specials ]         │
               [ /menu/festival-specials ]         │
               ...                                 │
                                                   ▼
                          [ /menu/[category]/[product] ]
```

---

*This site map defines the routing structure, edge-caching profile, and dynamic parameter boundaries for Yummy Spot.*
