import { cn } from './cn'

// Brand dancing-dots loader for full-page/section loading states.
export function AdminSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center gap-2 py-10', className)} role="status" aria-label="Loading">
      <span className="dancing-dot bg-teal" />
      <span className="dancing-dot bg-navy" />
      <span className="dancing-dot bg-teal-light" />
    </div>
  )
}

// Small inline spinner for buttons / inline busy states.
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
