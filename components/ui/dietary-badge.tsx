import { Badge } from "@/components/ui/badge"

export type DietaryType =
  | "halal"
  | "pure-veg"
  | "sugar-free"
  | "no-preservatives"
  | "dairy-free"
  | "gluten-free"

const dietaryOptions: Record<DietaryType, { label: string; variant: "success" | "primary" | "accent" | "outline" }> = {
  halal: { label: "Halal", variant: "success" },
  "pure-veg": { label: "Pure Veg", variant: "success" },
  "sugar-free": { label: "Sugar-Free", variant: "primary" },
  "no-preservatives": { label: "No Preservatives", variant: "accent" },
  "dairy-free": { label: "Dairy-Free", variant: "outline" },
  "gluten-free": { label: "Gluten-Free", variant: "outline" },
}

/** A preset Badge for dietary and ingredient attributes. */
export function DietaryBadge({ type }: { type: DietaryType }) {
  const option = dietaryOptions[type]
  return <Badge variant={option.variant}>{option.label}</Badge>
}
