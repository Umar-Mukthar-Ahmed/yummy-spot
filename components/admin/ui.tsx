import { cn } from "@/lib/utils"
import { buttonClass } from "@/components/ui/button"

export const adminInput =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 font-sans text-base text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
export const adminLabel = "mb-1.5 block font-sans text-sm font-medium text-foreground"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({ className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant: "primary", className: className ?? "" })} {...props} />
}

export function SecondaryButton({ className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant: "secondary", className: className ?? "" })} {...props} />
}

/** For actions that reject, cancel or delete; visually distinct from the confirming actions. */
export function DangerButton({ className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant: "destructive", className: className ?? "" })} {...props} />
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
  const error = kind === "error"
  return (
    <p role={error ? "alert" : "status"} className={cn("animate-fade-in flex items-start gap-2 rounded-xl border px-4 py-3 font-sans text-sm font-medium", error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-success/40 bg-success/10 text-success")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {error ? <path d="M12 8v5M12 16.5v.5M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /> : <path d="m5 12.5 4.5 4.5L19 7.5" />}
      </svg>
      <span>{children}</span>
    </p>
  )
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}
