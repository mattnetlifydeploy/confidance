import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

// Consistent empty state for every list/table.
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal/20 px-6 py-16 text-center">
      {icon && <div className="mb-3 text-3xl text-charcoal/30">{icon}</div>}
      <p className="font-heading text-base font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-charcoal/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
