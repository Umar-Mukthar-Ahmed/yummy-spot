import { z } from "zod"

export const MAX_ORDER_ITEMS = 20

/** Returns an E.164 number ("+" and 8-15 digits) or null. Numbers typed without "+" use the configured country code. */
export function normalizePhone(raw: string, defaultCountryCode: string): string | null {
  const cleaned = raw.trim().replace(/[\s().-]/g, "")
  let candidate: string
  if (cleaned.startsWith("+")) candidate = cleaned
  else if (cleaned.startsWith("00")) candidate = `+${cleaned.slice(2)}`
  else if (defaultCountryCode) candidate = `+${defaultCountryCode}${cleaned.replace(/^0+/, "")}`
  else return null
  return /^\+[1-9]\d{7,14}$/.test(candidate) ? candidate : null
}

const itemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().positive().max(99),
  note: z.string().trim().max(200).optional(),
})

/** Wire format of POST /api/orders. Prices are never sent by the client. */
export const orderRequestSchema = z
  .object({
    idempotencyKey: z.string().min(8).max(100),
    turnstileToken: z.string().min(1).max(2048),
    /** Honeypot: real visitors never see or fill this field. */
    website: z.string().max(200).optional(),
    /** Milliseconds the customer spent on the form (bots submit instantly). */
    elapsedMs: z.number().int().min(0),
    customer: z.object({
      name: z.string().trim().min(2, "Please enter your name").max(80),
      phone: z.string().trim().min(5, "Please enter your phone number").max(30),
      email: z.union([z.literal(""), z.email("Please enter a valid email").max(254)]).optional(),
    }),
    fulfilment: z.object({
      type: z.enum(["delivery", "pickup"]),
      area: z.string().trim().max(120).optional(),
      address: z.string().trim().max(300).optional(),
      requestedFor: z.iso.datetime({ message: "Please choose a date and time" }),
    }),
    notes: z.string().trim().max(500).optional(),
    items: z.array(itemSchema).min(1, "Add at least one item").max(MAX_ORDER_ITEMS),
  })
  .superRefine((value, context) => {
    if (value.fulfilment.type === "delivery" && !value.fulfilment.address) {
      context.addIssue({ code: "custom", path: ["fulfilment", "address"], message: "Please enter a delivery address" })
    }
  })

export type OrderRequest = z.infer<typeof orderRequestSchema>

/** Flattens zod issues to { "customer.name": "message" } for form display. */
export function issuesToErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".")
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}
