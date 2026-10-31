# User Flows & Customer Journey Specifications

> **Brand**: Yummy Spot
> **Tagline**: *Homemade. Premium. Delivered.*
> **Scope**: Order-request flow, owner flow, mobile ergonomics, accessibility
> **Status**: Reflects the implemented flow. WhatsApp is a fallback contact, not the checkout.

---

## 1. Primary flow: discovery to order request

```
[ Home (/) ] ──► [ Menu (/menu) ] ──► filter by category / dietary / search
                         │
                         ▼
          [ Read dish details, lead time, availability ]
                         │
                         ▼
             [ "Add to request" (+ / - quantity) ]
                         │      (repeat for more dishes)
                         ▼
        [ Floating bar: "N items in your request · Review" ]
                         │
                         ▼
                    [ /order ]
   items, quantities, estimated total, name, phone,
   delivery or pickup, wanted time, notes, Turnstile
                         │
                         ▼
          [ "Request received" with a reference ]
                         │
                         ▼
 [ Kitchen confirms availability, timing and the final price ]
            (by phone or WhatsApp, started from /admin)
```

### Step details and friction solutions

| Step | Customer question | Solution in the product |
| :---: | :--- | :--- |
| 1 | Is this a real home kitchen? | Story, trust strip, real photography uploaded by the owner |
| 2 | Can I get it today? | Lead time and availability note on each dish; the form sets the earliest selectable time from the longest lead time in the basket |
| 3 | Is it sold out? | "Not available right now" replaces the add button; the database also refuses it |
| 4 | What will it cost? | Estimated total shown; items priced `0` show "Ask for today's price" and the total says the kitchen confirms the final price |
| 5 | Do I have to type everything again? | The request is saved in the browser while they browse |
| 6 | Is it safe to leave my number? | A short privacy note on the form; details are used only to prepare and deliver the order |
| 7 | What happens next? | Confirmation shows a reference and says the kitchen will contact them |

### Error states the customer can see

| Situation | Message |
| :--- | :--- |
| Dish became unavailable | Names the dishes and asks the customer to remove them |
| Not enough notice | Shows the earliest possible time |
| Too many requests | Asks them to try again later |
| Orders paused by the owner | Shows the owner's message |
| Turnstile failed | Asks them to try again; the widget resets |
| Server unreachable | Asks them to check the connection |

---

## 2. Owner flow (admin)

```
[ /admin/login ] ──► [ Orders: New ] ──► open a request
                                            │
                  ┌─────────────────────────┼─────────────────────────┐
                  ▼                         ▼                         ▼
             Confirm                  Reject (reason)             Cancel
                  │                         │
                  ▼                         ▼
        Start preparing ► Mark ready ►  message customer on WhatsApp
                  ▼
   Out for delivery (delivery) or Completed (pickup) ► Completed
```

Customers are messaged from the admin with a pre-filled WhatsApp link to the customer's own number. The owner decides when to open a chat; customers cannot spam the owner's WhatsApp through the order form.

---

## 3. Custom catering and events (planned)

A guided `/custom-order` form for larger events is planned (Phase 5). Until then, custom orders can be requested through the **Custom Orders** category, the order notes field, or the WhatsApp fallback button.

---

## 4. Seasonal and festival discovery

Announcement banner and hero links point to `/menu?category=seasonal-specials` or `festival-specials`. Banner content will be editable in the admin when the banner screen is built.

---

## 5. Returning customers

The request is stored in the browser, so a returning customer can continue where they left off. Category deep links (for example `/menu?category=biryani-mandi`) can be bookmarked.

---

## 6. Mobile ergonomics

- A floating bottom bar shows the number of items and links to `/order`; it hides on `/order` and `/admin`.
- Every control is at least 44 px; quantity steppers are 44 px circles.
- The datetime picker, tel keyboard and email keyboard use native inputs.
- The Turnstile widget is mobile-friendly and unobtrusive.

---

## 7. Owner replies on WhatsApp (templates in the admin)

The "Message customer on WhatsApp" button builds a short message from the order status: confirmed, ready, out for delivery, rejected (with the reason you typed), cancelled, or a neutral greeting. Edit wording in `customerMessage()` in `components/admin/orders-admin.tsx`.

---

## 8. Accessibility

Keyboard sequence for ordering:

```
1. [Tab]    Skip link, then primary navigation
2. [Tab]    Search, category chips, dietary filters
3. [Tab]    Dish cards ("Dish details", then "Add to request")
4. [Enter]  Add to request; quantity stepper appears (aria-live announces the number)
5. [Tab]    "N items in your request" link
6. [Enter]  Open /order; fields have labels, errors use role="alert"
7. [Tab]    Submit ("Send order request" stays disabled until Turnstile passes)
```

- Focus rings are visible in light and dark themes.
- Errors are announced with `role="alert"`; success uses `role="status"`.
- Text meets WCAG AA contrast using the design tokens.
