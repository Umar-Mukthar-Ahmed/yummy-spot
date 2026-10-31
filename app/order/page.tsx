import type { Metadata } from "next"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"
import { OrderForm } from "@/components/order/order-form"

export const metadata: Metadata = {
  title: "Your order request",
  description: "Review your selected dishes and send an order request to the kitchen.",
  robots: { index: false, follow: false },
}

/** Multi-item order request page. Requests are stored for the kitchen to review in the admin. */
export default function OrderPage() {
  return (
    <Section spacing="md">
      <Container>
        <header className="mb-7 max-w-2xl sm:mb-9">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Order request &middot; no payment online</p>
          <Heading as="h1" size="4xl">Your order request</Heading>
          <Text variant="muted" size="lg" className="mt-3">Send your request and the kitchen will confirm availability, timing and the final price.</Text>
        </header>
        <OrderForm />
      </Container>
    </Section>
  )
}
