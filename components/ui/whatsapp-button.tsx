import { cn, buildWhatsAppUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { buttonClass } from "@/components/ui/button"

type WhatsAppButtonProps = {
  message?: string
  /** "solid" is the WhatsApp-green button; "outline" is the quieter fallback look used next to a primary action. */
  tone?: "solid" | "outline"
  className?: string
}

/** WhatsApp link, kept as an optional way to contact the kitchen (orders are sent from /order). */
export function WhatsAppButton({
  message = siteConfig.whatsapp.defaultMessage,
  tone = "solid",
  className,
}: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppUrl(siteConfig.whatsapp.number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonClass({ variant: tone === "solid" ? "primary" : "secondary", size: "lg" }),
        tone === "solid" && "bg-whatsapp text-white hover:bg-whatsapp hover:brightness-95",
        className
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-5 w-5 fill-current", tone === "outline" && "text-whatsapp")}>
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.26-1.64a11.9 11.9 0 0 0 5.82 1.48h.01c6.57 0 11.92-5.35 11.92-11.93 0-3.19-1.24-6.19-3.49-8.43ZM12.09 21.8h-.01a9.88 9.88 0 0 1-5.03-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.85 9.85 0 0 1-1.51-5.27c0-5.44 4.43-9.87 9.87-9.87 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.44-4.43 9.87-9.89 9.87Zm5.42-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span>Chat on WhatsApp</span>
    </a>
  )
}
