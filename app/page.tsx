import Link from "next/link"
import { categoryNav } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"

/** Editorial marketing homepage. Catalog and review content will come from the CMS in Phase 6. */
export default function HomePage() {
  const featuredCategories = categoryNav.slice(0, 6)

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border-subtle bg-surface">
        <Container className="grid min-h-[min(760px,calc(100svh-4rem))] items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="accent" className="mb-6">Homemade · Premium · Delivered</Badge>
            <Heading as="h1" size="display" className="max-w-[12ch] leading-[1.02]">
              A little more <span className="text-primary">made with care.</span>
            </Heading>
            <Text size="lg" variant="muted" className="mt-6 max-w-xl">
              {siteConfig.description}
            </Text>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/menu" className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Explore the menu
                <span aria-hidden="true" className="ml-2">↗</span>
              </Link>
              <WhatsAppButton />
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-muted-foreground" role="list">
              <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />Made at home</li>
              <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />Order directly on WhatsApp</li>
            </ul>
          </div>

          <div aria-hidden="true" className="relative mx-auto flex aspect-[1/0.86] w-full max-w-xl items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-background p-6 shadow-lg sm:p-10">
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-primary/20 sm:h-64 sm:w-64" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/20 blur-2xl sm:h-72 sm:w-72" />
            <div className="relative grid aspect-square w-[82%] place-items-center rounded-full border border-primary/20 bg-surface shadow-inner">
              <div className="absolute inset-[8%] rounded-full border border-dashed border-primary/30" />
              <div className="relative grid h-[62%] w-[62%] place-items-center rounded-full bg-primary/10 text-center">
                <span className="max-w-[10ch] font-serif text-3xl leading-tight text-primary sm:text-5xl">{siteConfig.name}</span>
              </div>
              <span className="absolute -right-3 top-[18%] rounded-full border border-border bg-surface-elevated px-4 py-2 font-sans text-xs text-muted-foreground shadow-sm sm:right-0">From our kitchen</span>
              <span className="absolute -bottom-2 left-[3%] rounded-full border border-border bg-surface-elevated px-4 py-2 font-sans text-xs text-muted-foreground shadow-sm">Made for sharing</span>
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="lg" aria-labelledby="categories-heading">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Find your favorite</p>
              <Heading id="categories-heading" as="h2" size="3xl">A menu for every craving</Heading>
            </div>
            <Link href="/menu" className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Browse all categories <span aria-hidden="true" className="ml-2">↗</span></Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {featuredCategories.map((category, index) => (
              <li key={category.href}>
                <Link href={category.href} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <Card elevated className="h-full overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
                    <CardContent className="flex min-h-36 items-center justify-between gap-4 p-5 sm:min-h-40 sm:p-6">
                      <div>
                        <span className="mb-3 block font-sans text-xs tracking-[0.15em] text-muted-foreground">0{index + 1}</span>
                        <Heading as="h3" size="lg" className="transition-colors group-hover:text-primary">{category.label}</Heading>
                      </div>
                      <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">↗</span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface" aria-labelledby="specials-heading">
        <Container>
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Worth a closer look</p>
            <Heading id="specials-heading" as="h2" size="3xl">Kitchen favorites</Heading>
            <Text variant="muted" className="mt-3">A rotating selection from the kitchen, coming soon.</Text>
          </div>
          {/* Phase 6: replace this content with featured product records from the CMS. */}
          <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center sm:px-10 sm:py-14">
            <p className="font-serif text-xl text-foreground">The next batch is taking shape.</p>
            <p className="mx-auto mt-2 max-w-prose font-sans text-sm text-muted-foreground">Featured dishes and availability will appear here once the menu is connected.</p>
            <Link href="/menu" className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline">Explore the menu <span aria-hidden="true" className="ml-2">↗</span></Link>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" aria-labelledby="heritage-heading">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-primary/5 p-8 sm:min-h-96">
            <div aria-hidden="true" className="absolute h-56 w-56 rounded-full border border-primary/20 sm:h-72 sm:w-72" />
            <div aria-hidden="true" className="absolute h-40 w-40 rounded-full border border-dashed border-primary/30 sm:h-52 sm:w-52" />
            <p className="relative max-w-[12ch] text-center font-serif text-3xl leading-tight text-primary sm:text-5xl">A kitchen with heart</p>
          </div>
          <div className="max-w-xl">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Our kitchen heritage</p>
            <Heading id="heritage-heading" as="h2" size="3xl">Good food begins with care.</Heading>
            <Text variant="muted" size="lg" className="mt-5">{siteConfig.description}</Text>
            <Link href="/about" className="mt-6 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Get to know us <span aria-hidden="true" className="ml-2">↗</span></Link>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface" aria-labelledby="reviews-heading">
        <Container>
          <div className="mb-8 text-center">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">From our community</p>
            <Heading id="reviews-heading" as="h2" size="3xl">Kind words, when they arrive</Heading>
          </div>
          {/* Phase 6: render verified customer reviews from CMS records; do not publish sample quotes. */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center sm:px-10 sm:py-12">
            <p className="font-sans text-sm text-muted-foreground">Customer stories will be shared here with their permission.</p>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" aria-labelledby="seasonal-heading">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-16">
            <div aria-hidden="true" className="absolute -right-12 -top-24 h-64 w-64 rounded-full border border-primary-foreground/20" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">A little something special</p>
                <Heading id="seasonal-heading" as="h2" size="3xl" className="text-primary-foreground">Seasonal treats, made for the moment.</Heading>
                {/* Phase 6: replace promo copy and availability with the active CMS banner. */}
                <p className="mt-3 max-w-prose font-sans text-sm text-primary-foreground/80">Our seasonal collection will be announced here.</p>
              </div>
              <Link href="/seasonal" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-primary-foreground/50 px-6 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Discover seasonal</Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
