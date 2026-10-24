import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"

/**
 * 404 Not Found
 *
 * Displayed when no matching route is found.
 * Full brand styling will be applied in Phase 3.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <Container>
      <main
        className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center"
        aria-labelledby="not-found-title"
      >
        <Text
          as="span"
          size="xs"
          variant="muted"
          className="uppercase tracking-[0.2em]"
        >
          404
        </Text>

        <Heading as="h1" size="2xl" id="not-found-title">
          Page not found
        </Heading>

        <Text variant="muted" className="max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>

        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 font-sans text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Return home
        </Link>
      </main>
    </Container>
  )
}
