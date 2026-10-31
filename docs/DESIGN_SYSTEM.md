# Design System

How Yummy Spot should look and behave. Keep this in step with the code; when this file and the code disagree, fix one of them.

Goal: **professional, attractive, honest, fast and accessible**. Warm and food-focused for customers, plain and efficient for the admin. Not flashy.

## Customer journey and call to action

Home, then Browse the menu, then Add to request, then adjust quantities, then Order request, then details and Turnstile, then Send order request, then confirmation with a reference.

- Customers are guests. There is no customer account, login or profile. Supabase Auth is for `/admin` only.
- The order-request journey is the **primary** action on every page (solid primary button, "Your request" in the header). WhatsApp is the **secondary** fallback (outline button, footer link). Do not give WhatsApp the strongest colour on a page.
- Wording: **order request** (the flow), **your request** (the chosen dishes), **Send order request** (submit). Never cart, basket or checkout. The page must make clear that nothing is paid online.

## Tokens (in `app/globals.css`)

Use the existing tokens (`bg-background`, `bg-surface`, `bg-surface-elevated`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, `text-success`). Do not hard-code hex colours in components. Contrast is verified in both themes; if you change a token, re-run the checks in `docs/TESTING.md`.

- Light `--muted-foreground` is `hsl(25 12% 40%)`, dark is `hsl(30 10% 62%)`. They were darkened/lightened to reach 4.5:1 on cards.
- `--destructive` is darker in light theme and lighter in dark theme so error text stays readable.
- Global element styles live inside `@layer base`, so Tailwind utilities always win.

## Shared components

| Piece | Where | Use |
| :--- | :--- | :--- |
| `buttonClass({ variant, size })` | `components/ui/button.tsx` | Every button and link-button (`primary`, `secondary`, `ghost`, `destructive`; sizes `sm`, `md`, `lg`, all at least 44px tall). Includes focus ring and press feedback. |
| `WhatsAppButton` | `components/ui/whatsapp-button.tsx` | `tone="outline"` by default for the secondary role. |
| `Price` | `components/shared/price.tsx` | Price, sale price (with the original struck through) or "Price on request". |
| `MediaImage` | `components/shared/media-image.tsx` | The only image component for catalog media. Cloudinary assets use Cloudinary resizing; with no photo it renders a neutral block, never a stock picture. |
| `SectionHeading`, `Heading`, `Text`, `Container`, `Section` | `components/home`, `components/shared`, `components/layout` | Page structure and type scale. |
| Admin `PrimaryButton`, `SecondaryButton`, `DangerButton`, `Message`, `Field`, `Checkbox` | `components/admin/ui.tsx` | Admin forms. They reuse `buttonClass`, so storefront and admin buttons share one look. |
| Order `StatusBadge` | `components/admin/orders-admin.tsx` | Colour plus text label (never colour alone). |

## Layout rules

- Page width comes from `Container`; vertical rhythm from `Section` (`spacing` prop).
- Use grids that adapt to the real number of items (`repeat(auto-fit, minmax(...))`) instead of assuming a fixed count. The featured dishes and category tiles do this.
- Do not turn everything into a card. Use a container only where it groups content.
- Menu cards are a compact row (photo left) on phones and vertical cards from the `sm` breakpoint. The add or quantity control is always at the bottom of the card.
- The order page is five numbered steps: Your request, Pickup or delivery, Your details, Date time and notes, Send your request.
- On phones the floating request bar (`components/order/request-bar.tsx`) shows the count and a Review link; from `md` up the header button does that job.

## Motion

CSS only, in `styles/animations.css`. No animation library.

- Animate `transform` and `opacity` only. One-shot entrances (`.enter`, optional stagger with `style={{ "--i": n }}`), a short pop when a count changes (`.animate-pop`, replay by changing the element key), the mobile drawer, message fade-in and the skeleton shimmer.
- Nothing loops except loading indicators. No parallax, no autoplay video, no scroll-triggered hiding.
- Content is never hidden waiting for JavaScript. Entrances are CSS animations, so the page is readable without scripts.
- `prefers-reduced-motion: reduce` switches off entrances, the pop and the shimmer.
- Durations: 150 ms press feedback, 250 to 400 ms UI, 500 ms entrances.
- The admin gets no decorative motion, only feedback (message fade-in, spinner).

## Images and media

- Product and category photos are Cloudinary assets managed in `/admin`. `MediaImage` preserves Cloudinary's responsive delivery; give it a `sizes` value that matches the layout.
- If a dish or category has no photo, show the neutral placeholder. Never substitute a stock photo for a real dish.
- Alt text: the admin-entered description wins, then the product name.
- Above-the-fold images load eagerly (the hero), the rest lazily; reserve space with aspect ratios so nothing shifts.
- **Temporary asset:** the hero photo in `config/food-photography.ts` is an Unsplash stock image. It is an editorial placeholder, not one of the kitchen's dishes. Replace it with real photography and delete the file.

## Honest content

Confirmed by the product itself (safe to show): no account needed, pickup or delivery is chosen when ordering, the kitchen confirms before anything is final, nothing is paid online.

Not confirmed (do not state as fact until the owner confirms, or make them configurable in site settings): no preservatives, home delivery, fresh or traditional ingredients, family recipes, small batches, opening hours, delivery areas, testimonials, the owner's story and photo.

The Story, Testimonials and Gallery sections stay on the home page as honest placeholders so they are ready for real content (`components/home/community-sections.tsx`).

## Accessibility rules

- WCAG 2.1 AA. Text contrast at least 4.5:1 (3:1 for large text) in both themes; touch targets at least 44 by 44 px.
- Visible focus ring on every interactive element; hover and focus states match.
- One `h1` per page and no skipped heading levels; one `main`, one `header`, one `footer`.
- Form errors use `role="alert"` and `aria-invalid`; the first invalid field is focused. Status changes use `role="status"` or `aria-live`.
- The mobile menu is a modal dialog: focus trap, Escape closes it, focus returns to the menu button.
- Colour never carries meaning alone (status badges have text, availability has text).

## Owner decisions still open

- Real kitchen and dish photography, an owner or kitchen photo for the story section, favicon, app icons (`/icons/icon-192.png`, `/icons/icon-512.png`) and the social share image (`/og/default.png`).
- Which claims about ingredients, preservatives and delivery may be published, and where they should live (site settings or fixed copy).
- Opening hours, delivery areas and real customer reviews (with permission).
- Privacy and Terms pages before launch (the form collects phone numbers and addresses), then About, Gallery, Contact and the custom-order form.

## Known visual limitations

- The category tiles on the home page are text tiles, because no real category photos exist yet.
- Placeholder sections show dashed empty states until content exists.
- The hero photo is temporary stock.
