import Link from "next/link"
import { siteConfig } from "@/config/site"
import { plannedRoutes } from "@/config/navigation"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"
import { SectionHeading } from "./section-heading"

const linkClass = "inline-flex min-h-11 items-center font-sans text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const galleryTiles = Array.from({ length: 6 }, (_, index) => index)

/** Story section. Text only until a real kitchen/owner photo exists; never use a stock portrait here. */
export function StorySection() {
  return (
    <Section spacing="md" aria-labelledby="story-heading">
      <Container className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary">Our story</p>
          <Heading id="story-heading" as="h2" size="2xl" className="max-w-[20ch]">Meet the kitchen behind Yummy Spot.</Heading>
          <Text variant="muted" className="mt-4 max-w-prose">{siteConfig.description}</Text>
          {!plannedRoutes.has("/about") && (
            <Link href="/about" className={`${linkClass} mt-3`}>Read more about us <span aria-hidden="true" className="ml-2">&rarr;</span></Link>
          )}
        </div>
        <figure className="relative overflow-hidden rounded-3xl border border-border bg-surface px-7 py-10 sm:px-10 sm:py-12">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="mb-3 h-9 w-9 text-primary/35" fill="currentColor"><path d="M10 28c0-8 4-14 12-16l1 3c-4 1.5-6 4-6.5 7H21v12H10V28Zm17 0c0-8 4-14 12-16l1 3c-4 1.5-6 4-6.5 7H38v12H27V28Z" /></svg>
          <blockquote className="font-serif text-2xl leading-snug text-foreground sm:text-3xl">Good food brings people together.</blockquote>
          <figcaption className="mt-4 font-sans text-sm text-muted-foreground">{siteConfig.name}</figcaption>
        </figure>
      </Container>
    </Section>
  )
}

/** Reserved for approved customer reviews (the `reviews` table). Shows an honest empty state, never invented quotes. */
export function TestimonialsSection() {
  return (
    <Section spacing="md" className="bg-surface" aria-labelledby="testimonials-heading">
      <Container>
        <SectionHeading eyebrow="Kind words" title="What customers say" id="testimonials-heading" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className={`min-h-32 flex-col justify-between rounded-2xl border border-dashed border-border bg-background/60 p-5 md:min-h-40 ${slot === 0 ? "flex" : "hidden md:flex"}`}>
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-7 w-7 text-primary/30" fill="currentColor"><path d="M10 28c0-8 4-14 12-16l1 3c-4 1.5-6 4-6.5 7H21v12H10V28Zm17 0c0-8 4-14 12-16l1 3c-4 1.5-6 4-6.5 7H38v12H27V28Z" /></svg>
              <p className="font-sans text-sm text-muted-foreground">
                {slot === 0 ? "Customer reviews will appear here once we have permission to share them." : "Reserved for a customer review."}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/** Reserved for kitchen photography and social links. Neutral tiles until real photos are uploaded. */
export function GallerySection() {
  const { instagram, facebook } = siteConfig.social
  const galleryLive = !plannedRoutes.has("/gallery")
  return (
    <Section spacing="md" aria-labelledby="gallery-heading">
      <Container>
        <SectionHeading eyebrow="Follow along" title="A look inside our kitchen" id="gallery-heading" description="Kitchen photos will be shared here once they are ready." action={
          <span className="flex flex-wrap gap-x-5">
            {galleryLive && <Link href="/gallery" className={linkClass}>View gallery <span aria-hidden="true" className="ml-2">&rarr;</span></Link>}
            {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>Instagram</a>}
            {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>Facebook</a>}
          </span>
        } />
        <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6" role="list" aria-label="Photo placeholders">
          {galleryTiles.map((tile) => (
            <li key={tile} aria-hidden="true" className="grid aspect-square place-items-center rounded-2xl border border-dashed border-border bg-surface text-muted-foreground">
              <svg viewBox="0 0 24 24" className="h-7 w-7 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4 4 3 3-2 4 3" /></svg>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
