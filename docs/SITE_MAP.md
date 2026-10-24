# Site Map & Route Architecture Specification

> **Brand**: Yummy Spot
> **Framework**: Next.js App Router
> **Catalog route**: `/menu`

---

## 1. URL Architecture

The catalog has one canonical route. Categories, seasonal offerings, search, filters, and product details live on the Menu page. Category links use in-page anchors such as `/menu#category-biryani-mandi`; anchors aid navigation and are not separate indexed pages.

```
/
├── menu/ (categories, search, dietary filters, products, seasonal items)
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

| URL | App Router file | Purpose | Content |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Home | Hero and featured category links |
| `/menu` | `app/menu/page.tsx` | Single Menu experience | Category sections, global search and filters, inline product details |
| `/about` | `app/about/page.tsx` | Our Story | Kitchen origins, founder bio |
| `/gallery` | `app/gallery/page.tsx` | Visual Gallery | Photo grid |
| `/contact` | `app/contact/page.tsx` | Contact | Contact details and WhatsApp CTA |
| `/custom-order` | `app/custom-order/page.tsx` | Bespoke orders | Custom order inquiry |
| `/privacy`, `/terms` | `app/privacy/page.tsx`, `app/terms/page.tsx` | Legal | Policy content |
| `/sitemap.xml` | `app/sitemap.ts` | XML Sitemap | Canonical route list |

Legacy category URLs permanently redirect to the matching `/menu#category-:category` section. Legacy product URLs permanently redirect to the matching `/menu#product-:product` inline card.

## 2. Menu Content and SEO

`/menu` is the canonical URL for the catalog and retains its page metadata. Category names are semantic section headings with stable IDs derived from `config/navigation.ts`. Category links from the home page, footer, and Menu directory point to those IDs. Product cards render their details inline and link to WhatsApp for ordering.

The XML sitemap includes `/menu` once. It omits category and product fragment URLs because fragments are not separate search destinations. CMS-backed products and categories will be rendered and described on the same page; structured data should be added to `/menu` as part of the SEO phase.

## 3. Category Section IDs

| Slug | Display name | Section ID |
| :--- | :--- | :--- |
| `homemade-meals` | Homemade Meals | `category-homemade-meals` |
| `desserts-sweets` | Desserts & Sweets | `category-desserts-sweets` |
| `snacks-savouries` | Snacks & Savouries | `category-snacks-savouries` |
| `biryani-mandi` | Biryani & Mandi | `category-biryani-mandi` |
| `curries` | Curries | `category-curries` |
| `wellness-foods` | Traditional Wellness Foods | `category-wellness-foods` |
| `health-supplements` | Homemade Health Supplements | `category-health-supplements` |
| `seasonal-specials` | Seasonal Specials | `category-seasonal-specials` |
| `festival-specials` | Festival Specials | `category-festival-specials` |
| `custom-order` | Custom Orders | `category-custom-order` |

`config/navigation.ts` remains the category source of truth. CMS integration can replace the static records without introducing separate collection pages.

## 4. Sitemap Priority Guide

| Page type | Priority | Change frequency |
| :--- | :---: | :--- |
| Homepage | 1.0 | weekly |
| Menu | 0.9 | weekly |
| Custom Order | 0.75 | monthly |
| About, Gallery, Contact | 0.6 | monthly |
| Legal pages | 0.3 | yearly |
