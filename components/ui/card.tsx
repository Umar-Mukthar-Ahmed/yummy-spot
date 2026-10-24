import { cn } from "@/lib/utils"

/**
 * Card — Composable card primitives
 *
 * A compound component pattern: use the sub-components together
 * for full layout control, or use <Card> alone as a styled container.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Saffron Rasmalai</CardTitle>
 *     <CardDescription>Traditional Bengali dessert</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 *   <CardFooter>
 *     <Button>Order via WhatsApp</Button>
 *   </CardFooter>
 * </Card>
 */

/* ── Card Root ───────────────────────────────────────────────── */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Elevated cards use surface-elevated bg with stronger shadow */
  elevated?: boolean
}

export function Card({ className, elevated = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border",
        "transition-shadow duration-200",
        elevated
          ? "bg-surface-elevated shadow-md"
          : "bg-surface shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/* ── Card Header ─────────────────────────────────────────────── */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  )
}

/* ── Card Title ──────────────────────────────────────────────── */
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif text-lg font-semibold leading-snug tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

/* ── Card Description ────────────────────────────────────────── */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "font-sans text-sm text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

/* ── Card Content ────────────────────────────────────────────── */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

/* ── Card Footer ─────────────────────────────────────────────── */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 pt-0", className)}
      {...props}
    />
  )
}
