/**
 * Heading
 *
 * Semantic heading component with decoupled visual sizing.
 * Semantic level (h1–h6) is independent of the visual size,
 * enabling correct document hierarchy without sacrificing design.
 *
 * Defaults to Fraunces serif for the premium editorial feel.
 * Pass serif={false} for sans-serif utility headings.
 *
 * @example
 * <Heading as="h1" size="display">Homemade. Premium.</Heading>
 * <Heading as="h2" size="xl">Our Categories</Heading>
 * <Heading as="h3" size="md" serif={false}>Quick Info</Heading>
 */

import { cn } from "@/lib/utils"

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type HeadingSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "display"

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Semantic heading level */
  as?: `h${HeadingLevel}`
  /** Visual size — decoupled from semantic level */
  size?: HeadingSize
  /** Use Fraunces serif. Default: true */
  serif?: boolean
}

const sizeStyles: Record<HeadingSize, string> = {
  xs:      "text-sm",
  sm:      "text-base",
  md:      "text-lg",
  lg:      "text-xl md:text-2xl",
  xl:      "text-2xl md:text-3xl",
  "2xl":   "text-3xl md:text-4xl",
  "3xl":   "text-4xl md:text-5xl",
  "4xl":   "text-5xl md:text-6xl",
  display: "text-5xl md:text-7xl lg:text-8xl",
}

export function Heading({
  as: Tag = "h2",
  size = "xl",
  serif = true,
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        "tracking-tight leading-tight text-foreground",
        serif ? "font-serif" : "font-sans font-semibold",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
