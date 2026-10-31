import type { Metadata } from "next"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"
import { ProductBrowser } from "@/components/menu/product-browser"

export const metadata: Metadata = {
  title: "Our Menu",
  description: "Browse the Yummy Spot menu, search dishes, and explore dietary options from our home kitchen.",
  alternates: { canonical: "/menu" },
}

/** The single source of truth for category navigation, search, filters, and catalog results. */
export default function MenuPage() {
  return <Section spacing="md"><Container>
    <header className="mb-7 max-w-2xl sm:mb-9">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">From our home kitchen</p>
      <Heading as="h1" size="4xl">Explore the menu</Heading>
      <Text variant="muted" size="lg" className="mt-3">Find something made with care, all in one place.</Text>
    </header>
    <ProductBrowser />
  </Container></Section>
}
