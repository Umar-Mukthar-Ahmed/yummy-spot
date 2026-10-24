# User Flows & Customer Journey Specifications

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Document Version**: 1.0.0
> **Scope**: Conversational Commerce, State Transitions, Mobile Ergonomics, Accessibility

---

## 1. Primary Flow: Discovery to WhatsApp Order

### 1.1 Flowchart

```
[ Customer Arrives on Homepage (/) ]
                 │
                 ▼
     [ Evaluates Hero & Trust Badges ]
     (100% Homemade, Pure Ghee, No Preservatives)
                 │
                 ├──────────────────────────────────────────────┐
                 │                                              │
        (Clicks Category)                           (Uses Quick Search)
                 │                                              │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                       [ Explores Category Showcase Page ]
                       (/menu#category-biryani-mandi)
                                        │
                                        ▼
                         [ Opens Product Detail Page (PDP) ]
                         (/menu#product-mutton-mandi-platter)
                                        │
         ┌──────────────────────────────┴──────────────────────────────┐
         │                                                             │
  [ Evaluates Ingredients & Allergens ]          [ Checks Lead Time & Availability ]
         │                                                             │
         └──────────────────────────────┬──────────────────────────────┘
                                        │
                                        ▼
                        [ Adjusts Portion Quantity (+/-) ]
                                        │
                                        ▼
                  [ Clicks "Order via WhatsApp" CTA ]
                                        │
                                        ▼
           [ Browser opens https://wa.me/XXXXX?text=... ]
                                        │
                                        ▼
                [ WhatsApp Chat Opens with Pre-Filled Message ]
                                        │
                                        ▼
                [ Customer Taps Send → Kitchen Confirms Slot ]
```

### 1.2 Step Details & Decision Points

| Step | User Action | Friction Gate | UX Solution |
| :---: | :--- | :--- | :--- |
| **1** | Lands on Homepage | Does this feel like a real home kitchen? | "Generational Family Kitchen" badge, hygiene photos |
| **2** | Browses Categories | Which category fits today's mood? | Clear category titles, prep-time badges |
| **3** | Views Category Page | Can I get this today or pre-order? | Badges: `Ready (4h)` vs `Weekend Pre-Order (12h)` |
| **4** | Inspects Product Detail | Are there allergens? How much does it serve? | Prominent allergen checklist, explicit "Serves 2-3" |
| **5** | Selects Quantity | Do I need extras? | Live price calculation, optional kitchen notes |
| **6** | Clicks WhatsApp CTA | Will I have to re-type everything? | 100% pre-formatted message with dish, qty, total |
| **7** | Handoff to WhatsApp | How do I pay? Is my delivery confirmed? | Kitchen owner replies with UPI QR + delivery slot |

---

## 2. Custom Catering & Event Concierge Flow

```
[ Customer visits /custom-order ]
              │
              ▼
[ Interactive Multi-Step Concierge Form ]
  ├── Step 1: Occasion (Wedding, Birthday, Housewarming, Pooja)
  ├── Step 2: Guest Count (e.g., 20-50 guests)
  ├── Step 3: Desired Date & Time Slot
  ├── Step 4: Culinary Preferences (Veg, Non-Veg, Sweets, Snacks)
  └── Step 5: Budget Range & Custom Notes
              │
              ▼
[ Form compiles into a structured WhatsApp dispatch payload ]
              │
              ▼
[ Taps "Submit Inquiry via WhatsApp" ]
              │
              ▼
[ Kitchen owner receives structured briefing & replies with quotation ]
```

---

## 3. Seasonal & Festival Discovery Flow

```
[ Customer sees Announcement Banner or Hero Festival Banner ]
("Diwali Artisan Sweet Boxes — Pre-Orders Now Live! Limited Batches")
                             │
                             ▼
     [ Clicks Banner → Lands on /menu#category-festival-specials ]
                             │
                             ▼
           [ Reviews Curated Festival Hampers & Boxes ]
                             │
                             ▼
         [ Selects "Royal Saffron Mithai Hamper (1kg)" ]
                             │
                             ▼
     [ Taps "Pre-Order for Festival Date" via WhatsApp ]
```

---

## 4. Returning Customer Accelerated Flow

```
[ Customer opens bookmark: /menu#category-biryani-mandi ]
                          │
                          ▼
        [ Locates Favorite Dish Instantly ]
                          │
                          ▼
[ Taps "Quick Order" on Product Card (skipping full PDP) ]
                          │
                          ▼
[ Instant WhatsApp Deep-Link → Order in under 10 seconds ]
```

---

## 5. Mobile-First Interaction Layout

```
+-------------------------------------------------------------------+
|  [Header: Logo, Search Icon, Hamburger Menu]                     |
+-------------------------------------------------------------------+
|                                                                   |
|   [ Full-Width Touch-Friendly Product Gallery Carousel ]          |
|                                                                   |
|   Signature Slow-Cooked Mutton Mandi Platter                     |
|   ₹1,250 per box (Serves 2-3)                                    |
|                                                                   |
|   [ Batch: Weekend Only ] [ Lead Time: 12 Hours ]                |
|                                                                   |
|   ★ Ingredients: A2 Ghee, Aged Basmati, Prime Mutton...          |
|   ★ Allergens: Contains Dairy (Ghee), Cashews                    |
|                                                                   |
+-------------------------------------------------------------------+
|  [ FLOATING STICKY BOTTOM BAR — Always Visible ]                 |
|  [ Qty: - 1 + ]    [ 💬  Order on WhatsApp — ₹1,250 ]           |
+-------------------------------------------------------------------+
```

**Key Mobile Mechanics:**
1. **Persistent Floating CTA Bar**: WhatsApp button stays locked to the viewport bottom — zero scrolling to order.
2. **Thumb-Zone Placement**: Full-width button, minimum 48px touch target height.
3. **Native App Switch**: `whatsapp://send` protocol opens WhatsApp directly without browser redirect.

---

## 6. WhatsApp Message Templates

### 6.1 Standard Catalog Order

```
*NEW ORDER — YUMMY SPOT* 🍲
---------------------------------------
*Dish:* Gulab Jamun in Saffron Syrup
*Portion:* 2 (per box)
*Estimated Price:* ₹700.00
*Prep Lead Time:* 4 hours

*Customer Details:*
• Name: [Customer Name]
• Delivery Area: [Neighborhood]

*Special Request:* Please ensure light sugar syrup.
---------------------------------------
Please confirm kitchen slot and share UPI QR. Thank you!
```

### 6.2 Custom Catering Inquiry

```
*CUSTOM CATERING INQUIRY — YUMMY SPOT* 🎉
---------------------------------------
*Event:* Housewarming Lunch
*Date:* 15th November 2026
*Guests:* 35 Adults
*Menu:* Weekend Mandi Platter + Ghee Sweets

*Budget:* ₹15,000–₹20,000
*Dietary:* 10 Pure Veg, 25 Non-Veg (Halal)

*Contact:* [Name] — [Phone]
---------------------------------------
Looking forward to discussing menu and pricing!
```

---

## 7. Conversion Optimization: 5 Critical Friction Points

| # | Friction Point | Root Hesitation | UX Solution |
| :-: | :--- | :--- | :--- |
| **1** | Delivery timing uncertainty | "Will it arrive in 30 min or tomorrow?" | Color-coded **Lead Time Badge** on every product card and PDP |
| **2** | Hygiene & ingredient anxiety | "Is this made in a clean environment?" | **Ingredient Transparency Accordion** listing every raw component; "Pure A2 Ghee" trust badges |
| **3** | Portion sizing confusion | "Will 1 box feed my family?" | Humanized yield: *"Serves 2–3 adults generously (≈950g)"* |
| **4** | Re-typing order into WhatsApp | Customers abandon when blank chat opens | **100% Pre-Populated WhatsApp deep-links** with dish name, qty, price |
| **5** | Out-of-stock disappointment | Gets excited, then told unavailable | CMS toggle transforms button to **"Notify Me for Next Batch"** |

---

## 8. Accessibility Flow & Keyboard Navigation

### WCAG 2.1 Level AA Keyboard Sequence

```
1. [Tab]    → Focus 'Skip to Main Content' anchor
2. [Tab]    → Move through Primary Navigation (Home, Menu, About, Contact)
3. [Tab]    → Enter Menu Grid → Focus ring highlights first category card
4. [Enter]  → Navigate to Category Page
5. [Tab]    → Select Product Card
6. [Enter]  → Open Product Detail Page
7. [Tab]    → Quantity increment button
8. [Space]  → Increment quantity
9. [Tab]    → Focus 'Order via WhatsApp' button
10. [Enter] → Trigger WhatsApp redirect
    aria-label: "Order 2 boxes of Mutton Mandi Platter via WhatsApp"
```

### Accessibility Specifications
- **Focus Rings**: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- **Contrast Ratios**: All text meets minimum 4.5:1 WCAG AA contrast ratio
- **Screen Readers**: Quantity counter uses `aria-live="polite"` for audio feedback on changes
- **Skip Link**: `<a href="#main-content">` always the first focusable element

---

*This specification establishes customer journey principles, conversational handoffs, and conversion heuristics for all Yummy Spot interfaces.*
