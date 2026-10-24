import { cn } from "@/lib/utils"

/**
 * Divider
 *
 * Horizontal or vertical visual separator.
 * Supports an optional centered text label for section breaks.
 *
 * @example
 * <Divider />
 * <Divider label="or" />
 * <Divider orientation="vertical" className="h-6" />
 */

type DividerProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
  /** Optional centered text label */
  label?: string
}

export function Divider({
  className,
  orientation = "horizontal",
  label,
  ...props
}: DividerProps) {
  if (label) {
    return (
      <div
        role="separator"
        aria-label={label}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="font-sans text-xs text-muted-foreground select-none whitespace-nowrap">
          {label}
        </span>
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-border"
          : "h-full w-px bg-border",
        className
      )}
      {...props}
    />
  )
}
