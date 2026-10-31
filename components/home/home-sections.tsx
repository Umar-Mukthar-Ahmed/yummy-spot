import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import { foodPhotography } from "@/config/food-photography"
import { siteConfig } from "@/config/site"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { buttonClass } from "@/components/ui/button"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"
import { SectionHeading } from "./section-heading"
import { CategoriesSection, FeaturedSection, SeasonalBanner } from "./catalog-sections"
import { GallerySection, StorySection, TestimonialsSection } from "./community-sections"

/** Facts about how the app works. Nothing here describes the food, ingredients or delivery promises. */
const ordering = [
  { title: "No account needed", note: "Just send a request", icon: "user" },
  { title: "Pickup or delivery", note: "Choose at the order step", icon: "bag" },
  { title: "Kitchen confirms", note: "Before anything is final", icon: "check" },
  { title: "Nothing paid online", note: "A request, not a checkout", icon: "card" },
] as const

/** Only statements that describe how the app works; no claims about the kitchen that the owner has not confirmed. */
const processSteps = [
  { title: "Browse the menu", note: "Pick the dishes you like." },
  { title: "Build your request", note: "Add dishes and adjust quantities." },
  { title: "Send it to the kitchen", note: "Choose pickup or delivery and a time." },
  { title: "The kitchen confirms", note: "Availability, timing and the final price. Nothing is charged online." },
] as const

const stagger = (index: number) => ({ "--i": index }) as CSSProperties

/** Home: brand → featured food → categories → how requesting works → send a request. */
export function HomeSections() {
  return (
    <>
      <HeroSection />
      <OrderingStrip />
      <FeaturedSection />
      <CategoriesSection />
      <SeasonalBanner />
      <StorySection />
      <TestimonialsSection />
      <GallerySection />
      <HowItWorksSection />
      <FinalOrderSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="border-b border-border-subtle bg-background">
      <Container className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
        <div className="max-w-xl">
          <p className="enter font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">From our home kitchen</p>
          <Heading as="h1" size="3xl" className="enter mt-3 leading-[1.05]" style={stagger(1)}>
            A little more <span className="text-primary">made with care.</span>
          </Heading>
          <Text size="lg" variant="muted" className="enter mt-5 max-w-lg" style={stagger(2)}>
            {siteConfig.description}
          </Text>
          <div className="enter mt-7 flex flex-col gap-3 sm:flex-row" style={stagger(3)}>
            <Link href="/menu" className={buttonClass({ size: "lg", className: "w-full sm:w-auto" })}>
              Browse the menu <span aria-hidden="true">&rarr;</span>
            </Link>
            <WhatsAppButton tone="outline" className="w-full sm:w-auto" />
          </div>
          <p className="enter mt-5 font-sans text-sm text-muted-foreground" style={stagger(4)}>
            No account needed. The kitchen confirms your request before anything is final.
          </p>
        </div>
        {/* Temporary editorial photo (Unsplash); replace with real kitchen photography. */}
        <div className="enter relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface shadow-lg lg:aspect-[5/4]" style={stagger(2)}>
          <Image src={foodPhotography.biryani.src} alt={foodPhotography.biryani.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
        </div>
      </Container>
    </section>
  )
}

function OrderingStrip() {
  return (
    <section aria-label="How ordering works" className="border-b border-border-subtle bg-surface/60 py-4">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4" role="list">
          {ordering.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><StripIcon icon={item.icon} /></span>
              <span className="min-w-0">
                <span className="block font-sans text-sm font-semibold leading-tight text-foreground">{item.title}</span>
                <span className="mt-0.5 block font-sans text-xs leading-tight text-muted-foreground">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function StripIcon({ icon }: { icon: (typeof ordering)[number]["icon"] }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "h-5 w-5" }
  switch (icon) {
    case "user": return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></svg>
    case "bag": return <svg {...common}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
    case "check": return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>
    case "card": return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M3 4l18 16" /></svg>
  }
}

function HowItWorksSection() {
  return (
    <Section spacing="md" className="border-y border-border-subtle bg-surface" aria-labelledby="how-heading">
      <Container>
        <SectionHeading eyebrow="Order request" title="How it works" id="how-heading" />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {processSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4 lg:flex-col lg:gap-3">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-sans text-sm font-bold text-primary-foreground">{index + 1}</span>
              <span>
                <span className="block font-serif text-lg leading-snug text-foreground">{step.title}</span>
                <span className="mt-1 block font-sans text-sm text-muted-foreground">{step.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}

function FinalOrderSection() {
  return (
    <Section spacing="md" aria-labelledby="final-heading">
      <Container>
        <div className="rounded-3xl border border-border bg-surface px-6 py-10 text-center sm:px-12 sm:py-14">
          <Heading id="final-heading" as="h2" size="2xl">Ready to send an order request?</Heading>
          <Text variant="muted" className="mx-auto mt-3 max-w-xl">
            Browse the menu, add your dishes and send a request. Have a question first? Message us on WhatsApp.
          </Text>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/menu" className={buttonClass({ size: "lg", className: "w-full sm:w-auto" })}>
              Browse the menu <span aria-hidden="true">&rarr;</span>
            </Link>
            <WhatsAppButton tone="outline" className="w-full sm:w-auto" />
          </div>
        </div>
      </Container>
    </Section>
  )
}
