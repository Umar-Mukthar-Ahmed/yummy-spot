/**
 * Root Loading UI
 *
 * Displayed as a React Suspense fallback during navigation
 * and initial data fetching for the root route segment.
 *
 * Phase 3: Replace with a branded skeleton that mirrors the layout
 * of the actual page being loaded.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[60dvh] items-center justify-center"
      aria-label="Loading page content"
      role="status"
    >
      {/* Branded spinner using primary color */}
      <svg
        className="h-8 w-8 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
