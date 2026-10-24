"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"

/**
 * Error Boundary — Client Component (required by Next.js)
 *
 * Catches unhandled runtime errors within the route segment tree.
 * Provides a recovery action and navigation back to safety.
 *
 * In Phase 8, replace the console.error with a monitoring service call
 * (e.g., Sentry.captureException(error)).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    /* Phase 8: Replace with Sentry.captureException(error) */
    console.error("[Error Boundary]", error)
  }, [error])

  return (
    <Container>
      <main
        className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center"
        aria-labelledby="error-title"
      >
        <Text
          as="span"
          size="xs"
          variant="muted"
          className="uppercase tracking-[0.2em]"
        >
          Error
        </Text>

        <Heading as="h1" size="2xl" id="error-title">
          Something went wrong
        </Heading>

        <Text variant="muted" className="max-w-sm">
          An unexpected error occurred. Try refreshing the page — if the
          issue persists, please contact us via WhatsApp.
        </Text>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 font-sans text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 font-sans text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Return home
          </Link>
        </div>
      </main>
    </Container>
  )
}
