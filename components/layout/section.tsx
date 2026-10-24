/**
 * Section
 *
 * Semantic page section wrapper with consistent vertical spacing.
 * Pair with <Container> for full layout control:
 *
 * @example
 * <Section spacing="lg">
 *   <Container>
 *     <h2>Our Menu</h2>
 *   </Container>
 * </Section>
 */

import { cn } from "@/lib/utils"

type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl"
type SectionTag = "section" | "div" | "article" | "aside" | "main" | "header" | "footer"

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** HTML element to render. Default: "section" */
  as?: SectionTag
  /** Vertical padding preset. Default: "lg" */
  spacing?: SectionSpacing
}

const spacingStyles: Record<SectionSpacing, string> = {
  none: "",
  sm:   "py-8 md:py-12",
  md:   "py-12 md:py-16",
  lg:   "py-16 md:py-24",
  xl:   "py-20 md:py-32",
}

export function Section({
  as: Tag = "section",
  className,
  spacing = "lg",
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(spacingStyles[spacing], className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
