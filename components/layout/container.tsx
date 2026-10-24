/**
 * Container
 *
 * Provides consistent horizontal padding and max-width constraints
 * for page content. Always wrap page content in Container to ensure
 * consistent layout gutters across all viewport sizes.
 *
 * @example
 * <Container>
 *   <h1>Page Title</h1>
 * </Container>
 *
 * @example
 * <Container size="md">
 *   <article>Narrow content</article>
 * </Container>
 */

import { cn } from "@/lib/utils"

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full"

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Maximum width constraint. Default: "xl" (max-w-7xl) */
  size?: ContainerSize
}

const sizeStyles: Record<ContainerSize, string> = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-5xl",
  xl:   "max-w-7xl",
  full: "max-w-full",
}

export function Container({
  className,
  size = "xl",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
