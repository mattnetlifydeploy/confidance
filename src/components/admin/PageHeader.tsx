import type { ReactNode } from 'react'
import { cn } from './cn'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
}

// Consistent section header: eyebrow + title + description + right-aligned actions.
export function AdminPageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal">{eyebrow}</p>
          )}
          <h2 className="font-heading text-xl font-bold text-navy sm:text-2xl">{title}</h2>
          {description && <p className="mt-2 text-sm text-charcoal/60">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

type Tone = 'default' | 'teal' | 'success' | 'warning' | 'danger' | 'info'

const TILE_TONE: Record<Tone, string> = {
  default: 'text-navy',
  teal: 'text-teal',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-error',
  info: 'text-info',
}

interface StatTileProps {
  label: string
  value: ReactNode
  tone?: Tone
  hint?: string
}

export function StatTile({ label, value, tone = 'default', hint }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-cream/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</p>
      <p className={cn('mt-1 font-heading text-2xl font-bold', TILE_TONE[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal/50">{hint}</p>}
    </div>
  )
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>{children}</div>
}
