import { cn } from "@/lib/utils"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

/** Base animated placeholder for content that is still loading. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />
}

export function SkeletonImage({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("aspect-[4/3] w-full rounded-xl", className)} {...props} />
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border border-border p-4", className)} {...props}>
      <SkeletonImage />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
    </div>
  )
}

export function SkeletonProductCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-surface p-4", className)} {...props}>
      <SkeletonImage />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/3" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}
