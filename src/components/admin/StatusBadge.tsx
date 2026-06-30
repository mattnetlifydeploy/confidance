import { cn } from './cn'

export type BadgeTone = 'neutral' | 'teal' | 'success' | 'warning' | 'danger' | 'info'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-charcoal/10 text-charcoal/60',
  teal: 'bg-teal/20 text-teal',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-error/20 text-error',
  info: 'bg-info/20 text-info',
}

// Common booking/enquiry/payment status strings mapped to a tone.
const STATUS_TONE: Record<string, BadgeTone> = {
  new: 'info',
  pending: 'warning',
  contacted: 'warning',
  interested: 'teal',
  notified: 'info',
  waiting: 'warning',
  confirmed: 'success',
  paid: 'success',
  signed: 'success',
  active: 'success',
  success: 'success',
  cancelled: 'danger',
  canceled: 'danger',
  failed: 'danger',
  payment_failed: 'danger',
  refunded: 'neutral',
  lost: 'danger',
  expired: 'neutral',
  inactive: 'neutral',
  draft: 'neutral',
}

export function statusTone(status: string): BadgeTone {
  return STATUS_TONE[status.toLowerCase()] ?? 'neutral'
}

interface StatusBadgeProps {
  label: string
  tone?: BadgeTone
  status?: string
  className?: string
}

export function StatusBadge({ label, tone, status, className }: StatusBadgeProps) {
  const resolved = tone ?? (status ? statusTone(status) : 'neutral')
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium',
        TONE[resolved],
        className,
      )}
    >
      {label}
    </span>
  )
}
