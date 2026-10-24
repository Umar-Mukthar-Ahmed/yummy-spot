/**
 * Text
 *
 * Polymorphic text primitive with size, variant, and leading presets.
 * Uses Manrope sans-serif. Use Heading for serif display text.
 *
 * @example
 * <Text size="sm" variant="muted">Made fresh daily.</Text>
 * <Text as="span" size="xs" variant="primary">New Arrival</Text>
 * <Text as="label" size="sm" leading="normal">Field label</Text>
 */

import { cn } from "@/lib/utils"

type TextTag = "p" | "span" | "div" | "label" | "small" | "strong" | "em" | "li"
type TextSize = "xs" | "sm" | "base" | "lg" | "xl"
type TextVariant = "default" | "muted" | "primary" | "accent" | "destructive"
type TextLeading = "tight" | "snug" | "normal" | "relaxed" | "loose"

type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: TextTag
  size?: TextSize
  variant?: TextVariant
  leading?: TextLeading
}

const sizeStyles: Record<TextSize, string> = {
  xs:   "text-xs",
  sm:   "text-sm",
  base: "text-base",
  lg:   "text-lg",
  xl:   "text-xl",
}

const variantStyles: Record<TextVariant, string> = {
  default:     "text-foreground",
  muted:       "text-muted-foreground",
  primary:     "text-primary",
  accent:      "text-accent",
  destructive: "text-destructive",
}

const leadingStyles: Record<TextLeading, string> = {
  tight:   "leading-tight",
  snug:    "leading-snug",
  normal:  "leading-normal",
  relaxed: "leading-relaxed",
  loose:   "leading-loose",
}

export function Text({
  as: Tag = "p",
  size = "base",
  variant = "default",
  leading = "relaxed",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        "font-sans",
        sizeStyles[size],
        variantStyles[variant],
        leadingStyles[leading],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
