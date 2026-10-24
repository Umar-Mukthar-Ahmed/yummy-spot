import { forwardRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Button — Server Component compatible
 *
 * Primary interactive primitive. Supports multiple visual variants
 * and sizes. Uses forwardRef for composability with third-party libs.
 *
 * @example
 * <Button>Order via WhatsApp</Button>
 * <Button variant="outline" size="sm">View Menu</Button>
 * <Button variant="ghost" size="icon" aria-label="Close"><X /></Button>
 * <Button isLoading>Sending...</Button>
 */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"

type ButtonSize = "sm" | "md" | "lg" | "icon"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and disables interaction */
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-muted",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  ghost:
    "text-foreground hover:bg-surface hover:text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm:   "h-8 px-3 text-sm gap-1.5 rounded-md",
  md:   "h-10 px-4 text-sm gap-2 rounded-lg",
  lg:   "h-12 px-6 text-base gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        className={cn(
          /* Base */
          "inline-flex items-center justify-center font-sans font-medium",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "select-none cursor-pointer",
          /* Variant */
          variantStyles[variant],
          /* Size */
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
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
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="sr-only">Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"
