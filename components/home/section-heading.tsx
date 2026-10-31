import { Heading } from "@/components/shared/heading"
import { Text } from "@/components/shared/text"

/** Eyebrow + title + optional description, with an optional action link on the right. */
export function SectionHeading({ eyebrow, title, description, id, action }: { eyebrow: string; title: string; description?: string; id: string; action?: React.ReactNode }) {
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
