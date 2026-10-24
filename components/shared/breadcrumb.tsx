import Link from "next/link"

export type BreadcrumbItem = {
  label: string
  href: string
  isCurrent?: boolean
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  structured?: boolean
  className?: string
}

/** Accessible breadcrumb navigation with optional BreadcrumbList JSON-LD. */
export function Breadcrumb({ items, structured = false, className }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  }
  const jsonLdText = JSON.stringify(jsonLd).replace(/</g, "\\u003c")

  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-2 font-sans text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              {item.isCurrent ? (
                <span aria-current="page" className="font-medium text-foreground">{item.label}</span>
              ) : (
                <Link className="min-h-11 inline-flex items-center rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={item.href}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText }} />}
    </>
  )
}
