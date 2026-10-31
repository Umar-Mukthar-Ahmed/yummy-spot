import { cn } from "@/lib/utils"

export const adminInput =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 font-sans text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
export const adminLabel = "mb-1.5 block font-sans text-sm font-medium text-foreground"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 font-sans text-sm font-semibold text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60", className)}
      {...props}
    />
  )
}

export function SecondaryButton({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 font-sans text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60", className)}
      {...props}
    />
  )
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={adminLabel}>{label}</label>
      {children}
      {hint && <p className="mt-1 font-sans text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Checkbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-sans text-sm text-foreground">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-primary" />
      {label}
    </label>
  )
}

export function Message({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 font-sans text-sm", kind === "error" ? "border-destructive/40 text-destructive" : "border-success/40 text-success")}>
      {children}
    </p>
  )
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}
