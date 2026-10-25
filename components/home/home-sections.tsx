import Image from "next/image"
import Link from "next/link"
import { categoryNav } from "@/config/navigation"
import { categoryPhotography, featuredPhotography, foodPhotography } from "@/config/food-photography"
import { catalogProducts } from "@/lib/catalog"
import { siteConfig } from "@/config/site"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"
import { HomeReveal, HeroFloat } from "./home-motion"

const trustFeatures = [
  { icon: "leaf", title: "Freshly prepared", note: "Made with care" },
  { icon: "bowl", title: "Traditional recipes", note: "Rooted in home cooking" },
  { icon: "sparkle", title: "No preservatives", note: "Simple ingredients" },
  { icon: "chat", title: "WhatsApp orders", note: "Direct and personal" },
  { icon: "delivery", title: "Home delivery", note: "Delivered with care" },
] as const

const kitchenValues = ["Home cooked with love", "Fresh ingredients", "Traditional recipes", "Small batch cooking", "Family recipes"] as const
const processSteps = [
  { title: "Browse our menu", note: "Choose your favorites", icon: "menu" },
  { title: "Message us", note: "Order on WhatsApp", icon: "chat" },
  { title: "Freshly prepared", note: "Made just for you", icon: "bowl" },
  { title: "Get it delivered", note: "At home or pickup", icon: "delivery" },
] as const
const featuredProducts = catalogProducts.filter((product) => product.labels.includes("featured") || product.labels.includes("bestseller")).slice(0, 6)
const placeholderTiles = Array.from({ length: 6 }, (_, index) => index)

/** Complete editorial homepage sections, with business content sourced from configuration or catalog data. */
export function HomeSections() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <CategoriesSection />
      <FeaturedSection />
      <KitchenStorySection />
      <TestimonialsSection />
      <InstagramSection />
      <HowItWorksSection />
      <FinalOrderSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border-subtle bg-background">
      <Container className="grid min-h-[min(690px,calc(100svh-4rem))] items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-8 lg:py-16">
        <HomeReveal className="relative z-10 max-w-2xl py-5 lg:py-10">
          <Badge variant="outline" className="mb-5 border-primary/25 bg-background/80 px-3 py-1.5 text-primary">
            Homemade <span className="mx-1 text-accent">·</span> Fresh <span className="mx-1 text-accent">·</span> With love
          </Badge>
          <Heading as="h1" size="3xl" className="max-w-[12ch] leading-[0.98] lg:max-w-[14ch]">
            A little more<br className="hidden lg:block" /> <span className="text-primary">made with care.</span>
          </Heading>
          <Text size="lg" variant="muted" className="mt-5 max-w-lg">
            Premium homemade meals, desserts, snacks and traditional wellness foods, prepared with care from our home kitchen.
          </Text>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WhatsAppButton className="w-full px-6 sm:w-auto" />
            <Link href="/menu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/40 bg-background px-6 font-sans text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              Browse menu <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-7 max-w-[16ch] rotate-[-5deg] font-serif text-lg italic leading-tight text-primary sm:mt-9">
            Good food brings people together <span aria-hidden="true">♡</span>
          </p>
        </HomeReveal>
        <div className="relative mx-auto min-h-64 w-full max-w-3xl lg:my-0 lg:-mr-8 lg:w-[calc(100%+2rem)] lg:max-w-none lg:scale-[1.03] lg:origin-left">
          <HeroFloat>
            <div className="relative aspect-[1.28/1] w-full overflow-hidden lg:aspect-[1.12/1] rounded-[2rem] border border-border/70 bg-surface shadow-xl sm:rounded-[2.5rem] lg:rounded-l-[8rem] lg:rounded-r-none">
              <Image src={foodPhotography.biryani.src} alt={foodPhotography.biryani.alt} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent lg:from-background/55" />
            </div>
          </HeroFloat>
        </div>
      </Container>
    </section>
  )
}

function TrustStrip() {
  return (
    <section aria-label="What makes Yummy Spot special" className="relative z-10 -mt-1 border-b border-border-subtle bg-surface/70 py-4 sm:py-5">
      <Container>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="list">
          {trustFeatures.map((feature) => (
            <li key={feature.title} className="flex min-h-16 items-center gap-3 rounded-2xl border border-border-subtle bg-background/75 px-3 py-2.5 sm:px-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><FeatureIcon icon={feature.icon} /></span>
              <span className="min-w-0"><span className="block font-sans text-xs font-semibold leading-tight text-foreground sm:text-sm">{feature.title}</span><span className="mt-1 block font-sans text-[0.7rem] leading-tight text-muted-foreground">{feature.note}</span></span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function CategoriesSection() {
  return (
    <Section spacing="md" aria-labelledby="categories-heading">
      <Container>
        <HomeReveal><SectionHeading eyebrow="Explore our" title="Our categories" description="Find your favorite, all in one place." id="categories-heading" action={<Link href="/menu" className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline">View all categories <span aria-hidden="true" className="ml-2">→</span></Link>} /></HomeReveal>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4" role="list">
          {categoryNav.map((category, index) => (
            <li key={category.segment}>
              <HomeReveal>
                <Link href={category.href} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <Card elevated className="h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className="relative aspect-[1.5/1] overflow-hidden bg-surface">
                      <Image src={categoryPhotography[index]?.src ?? foodPhotography.biryani.src} alt={categoryPhotography[index]?.alt ?? foodPhotography.biryani.alt} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 48vw" className={"object-cover transition-transform duration-500 group-hover:scale-105 " + (index % 2 === 0 ? "object-[center_60%]" : "object-[center_40%]")} />
                    </div>
                    <div className="flex min-h-[4.5rem] items-center justify-between gap-2 px-3 py-3 sm:px-4">
                      <span className="min-w-0"><span className="block font-serif text-sm leading-snug text-foreground sm:text-base">{category.label}</span><span className="mt-1 block font-sans text-xs text-muted-foreground">Explore category</span></span>
                      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">→</span>
                    </div>
                  </Card>
                </Link>
              </HomeReveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

function FeaturedSection() {
  return (
    <Section spacing="md" className="bg-surface" aria-labelledby="featured-heading">
      <Container>
        <HomeReveal><SectionHeading eyebrow="Featured dishes" title="Kitchen favorites" description="A selection from our kitchen." id="featured-heading" action={<Link href="/menu" className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline">View all dishes <span aria-hidden="true" className="ml-2">→</span></Link>} /></HomeReveal>
        {featuredProducts.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4" role="list">
            {featuredProducts.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
          </ul>
        ) : (
          <>
            {/* Phase 6: replace neutral product card placeholders with approved, published CMS records. */}
            <p className="sr-only" role="status">Featured dish placeholders are shown until the menu catalog is published.</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4" role="list" aria-label="Featured dish placeholders">
              {placeholderTiles.map((tile) => <li key={tile} aria-hidden="true"><ProductCardPlaceholder index={tile} /></li>)}
            </ul>
          </>
        )}
      </Container>
    </Section>
  )
}

function FeaturedProductCard({ product }: { product: Product }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0]
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <div className="relative aspect-[1.3/1] overflow-hidden bg-surface">
        {image ? <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 16vw, 48vw" className="object-cover" /> : <Image src={featuredPhotography[0].src} alt={featuredPhotography[0].alt} fill sizes="(min-width: 1024px) 16vw, 48vw" className="object-cover" />}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-serif text-base text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-9 font-sans text-xs text-muted-foreground">{product.shortDescription}</p>
        <p className="mt-2 font-sans text-sm font-semibold text-primary">{formatPrice(product.salePrice ?? product.price, product.currency)}</p>
        <Link href={`/menu?category=${encodeURIComponent(product.categorySlug)}&product=${encodeURIComponent(product.slug)}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-success px-3 font-sans text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View details</Link>
      </div>
    </li>
  )
}

function ProductCardPlaceholder({ index }: { index: number }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <div className="relative aspect-[1.3/1] overflow-hidden bg-surface">
        <Image src={featuredPhotography[index % featuredPhotography.length]!.src} alt={featuredPhotography[index % featuredPhotography.length]!.alt} fill sizes="(min-width: 1024px) 16vw, 48vw" className="object-cover" />
      </div>
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-9 rounded-full bg-muted" />
      </div>
    </div>
  )
}

function KitchenStorySection() {
  return (
    <Section spacing="md" aria-labelledby="story-heading">
      <Container className="grid items-center gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <HomeReveal className="relative">
          <div className="relative aspect-[1.1/1] overflow-hidden rounded-[2rem] border border-border bg-surface shadow-md">
            <Image src={foodPhotography.storyPortrait.src} alt={foodPhotography.storyPortrait.alt} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
          </div>
        </HomeReveal>
        <HomeReveal className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Our story</p>
            <Heading id="story-heading" as="h2" size="3xl" className="max-w-[18ch]">Meet the heart behind Yummy Spot.</Heading>
            <Text variant="muted" className="mt-4 max-w-prose">{siteConfig.description}</Text>
            <p className="mt-4 font-serif text-lg italic text-primary">With love, Yummy Spot</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface/70 p-4 sm:w-56">
            <ul className="space-y-3" role="list">
              {kitchenValues.map((value) => <li key={value} className="flex items-center gap-2.5 font-sans text-xs text-muted-foreground"><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><FeatureIcon icon="leaf" /></span>{value}</li>)}
            </ul>
            <Link href="/about" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/40 px-4 font-sans text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Learn more <span aria-hidden="true" className="ml-2">→</span></Link>
          </div>
        </HomeReveal>
      </Container>
    </Section>
  )
}

function TestimonialsSection() {
  return (
    <Section spacing="md" className="bg-surface" aria-labelledby="testimonials-heading">
      <Container>
        <HomeReveal><SectionHeading eyebrow="Kind words from our customers" title="What our customers say" description="Stories from the Yummy Spot community." id="testimonials-heading" /></HomeReveal>
        {/* Phase 6: replace these cards with verified, permissioned customer reviews from the CMS. */}
        <p className="sr-only" role="status">Review card placeholders are shown until customer reviews are approved.</p>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3" role="list" aria-label="Customer review placeholders">
          {placeholderTiles.slice(0, 3).map((tile) => <li key={tile} aria-hidden="true" className="w-[82vw] max-w-sm shrink-0 snap-start rounded-2xl border border-border bg-background p-5 shadow-sm sm:w-auto sm:max-w-none">
            <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="space-y-2"><div className="h-3 w-full animate-pulse rounded bg-muted" /><div className="h-3 w-5/6 animate-pulse rounded bg-muted" /><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /></div>
            <div className="mt-5 flex items-center gap-3"><div className="h-10 w-10 animate-pulse rounded-full bg-muted" /><div className="space-y-2"><div className="h-3 w-24 animate-pulse rounded bg-muted" /><div className="h-3 w-16 animate-pulse rounded bg-muted" /></div></div>
          </li>)}
        </ul>
      </Container>
    </Section>
  )
}

function InstagramSection() {
  return (
    <Section spacing="md" aria-labelledby="instagram-heading">
      <Container className="grid items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <HomeReveal>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">Follow along</p>
            <Heading id="instagram-heading" as="h2" size="2xl">A little look inside our kitchen.</Heading>
            <Text variant="muted" className="mt-3 max-w-md">Kitchen moments and food photography will be shared here.</Text>
            <Link href="/gallery" className="mt-4 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline">View gallery <span aria-hidden="true" className="ml-2">→</span></Link>
          </HomeReveal>
          {/* Phase 6: replace with approved gallery images and Instagram links. */}
          <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3" role="list" aria-label="Gallery photo placeholders">
            {placeholderTiles.map((tile) => <li key={tile} aria-hidden="true" className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
              <Image src={featuredPhotography[tile % featuredPhotography.length]!.src} alt="" fill sizes="(min-width: 1024px) 12vw, 28vw" className="object-cover transition-transform duration-300 hover:scale-105" />
            </li>)}
          </ul>
        </div>
        <HomeReveal>
          <Link href="/menu?category=seasonal-specials" className="group relative block min-h-64 overflow-hidden rounded-[2rem] border border-border bg-surface shadow-md sm:min-h-72">
            <Image src={foodPhotography.dessert.src} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/35 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-sm flex-col justify-center p-6 text-background sm:p-9">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-background/75">Seasonal selection</p>
              <h3 className="mt-2 font-serif text-3xl leading-tight text-background">Fresh food.<br />Real ingredients.</h3>
              <span className="mt-4 inline-flex min-h-10 w-fit items-center rounded-full border border-background/60 px-4 font-sans text-xs font-semibold text-background">Explore seasonal <span aria-hidden="true" className="ml-2">→</span></span>
            </div>
          </Link>
        </HomeReveal>
      </Container>
    </Section>
  )
}

function HowItWorksSection() {
  return (
    <Section spacing="md" className="border-y border-border-subtle bg-surface" aria-labelledby="how-heading">
      <Container>
        <HomeReveal><SectionHeading eyebrow="Simple. Fresh. Delivered." title="How it works" id="how-heading" /></HomeReveal>
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4" role="list">
          {processSteps.map((step, index) => <li key={step.title} className="relative flex flex-col items-center text-center">
            {index < processSteps.length - 1 && <span aria-hidden="true" className="absolute left-[65%] top-6 hidden w-[70%] border-t border-dashed border-primary/30 sm:block" />}
            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-primary/20 bg-background text-primary shadow-sm"><FeatureIcon icon={step.icon} /></span>
            <span className="mt-3 font-sans text-sm font-semibold text-foreground">{step.title}</span>
            <span className="mt-1 font-sans text-xs text-muted-foreground">{step.note}</span>
          </li>)}
        </ol>
      </Container>
    </Section>
  )
}

function FinalOrderSection() {
  return (
    <section className="relative isolate overflow-hidden bg-foreground py-10 text-background sm:py-14">
      <Image src={foodPhotography.biryani.src} alt="" fill sizes="100vw" className="absolute inset-0 -z-20 object-cover opacity-25" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/55" />
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-background/65">Homemade. Fresh. Delivered.</p>
          <Heading as="h2" size="2xl" className="text-background">Ready for today&apos;s meal?</Heading>
          <Text className="mt-2 text-background/75">Message us directly to ask about the menu and place an order.</Text>
        </div>
        <WhatsAppButton className="shrink-0 bg-success px-7 text-white" />
      </Container>
    </section>
  )
}

function SectionHeading({ eyebrow, title, description, id, action }: { eyebrow: string; title: string; description?: string; id: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <Heading id={id} as="h2" size="2xl">{title}</Heading>
        {description && <Text variant="muted" size="sm" className="mt-2">{description}</Text>}
      </div>
      {action}
    </div>
  )
}

function FeatureIcon({ icon }: { icon: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "h-5 w-5" }
  switch (icon) {
    case "leaf": return <svg {...common}><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c3-5 7-8 12-11" /></svg>
    case "bowl": return <svg {...common}><path d="M4 12h16l-2 7H6l-2-7Z" /><path d="M3 12c1-3 4-5 9-5s8 2 9 5M12 3v2M7 4l1 2M17 4l-1 2" /></svg>
    case "sparkle": return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>
    case "chat": return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-11.4 6.4L4 19l1.1-4.2A7.5 7.5 0 1 1 20 11.5Z" /><path d="M9 9c1 2 2 3 4 4" /></svg>
    case "delivery": return <svg {...common}><path d="M3 7h11v11H3zM14 11h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg>
    case "menu": return <svg {...common}><path d="M5 5h14M5 12h14M5 19h14" /></svg>
    default: return <svg {...common}><path d="M4 12h16M13 5l7 7-7 7" /></svg>
  }
}





