import { cn } from "@/lib/utils"

/**
 * Badge
 *
 * Compact status/label chip for product labels (Bestseller, New, etc.),
 * category tags, availability status, and dietary indicators.
 *
 * @example
 * <Badge>Bestseller</Badge>
 * <Badge variant="accent">New Arrival</Badge>
 * <Badge variant="success">In Stock</Badge>
 * <Badge variant="warning">Limited</Badge>
 * <Badge variant="outline">Seasonal</Badge>
 */

type BadgeVariant =
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "destructive"
  | "outline"

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-muted text-muted-foreground",
  primary:
    "bg-primary/10 text-primary border border-primary/20",
  accent:
    "bg-accent/15 text-accent-foreground border border-accent/25",
  success:
    "bg-success/10 text-success border border-success/20",
  warning:
    "bg-warning/10 text-warning border border-warning/20",
  destructive:
    "bg-destructive/10 text-destructive border border-destructive/20",
  outline:
    "border border-border text-muted-foreground bg-transparent",
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "font-sans text-xs font-medium leading-none",
        "transition-colors duration-150",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
