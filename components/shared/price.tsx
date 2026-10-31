import { formatPrice } from "@/lib/utils"

type PriceProps = {
  price: number
  salePrice?: number | null
  currency: string
  /** Shown after the price, e.g. "per kg". */
  unit?: string
  className?: string
}

/** Price, sale price (with the original struck through) or "Price on request" when the kitchen quotes the price. */
export function Price({ price, salePrice, currency, unit, className }: PriceProps) {
  if (price <= 0) return <span className={className}>Price on request</span>
  const onSale = salePrice != null && salePrice < price
  return (
    <span className={className}>
      <span className="font-semibold text-foreground">
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(onSale ? salePrice : price, currency)}
      </span>
      {onSale && (
        <s className="ml-1.5 font-normal text-muted-foreground">
          <span className="sr-only">Original price </span>
          {formatPrice(price, currency)}
        </s>
      )}
      {unit && <span className="ml-1 font-normal text-muted-foreground">/ {unit}</span>}
    </span>
  )
}
