import type { ReactNode } from 'react'
import { cn } from './cn'

type BannerTone = 'error' | 'success' | 'warning' | 'info'

const TONE: Record<BannerTone, string> = {
  error: 'bg-error/10 text-error',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
}

// Inline feedback banner (form errors / success messages).
export function AdminBanner({
  tone,
  children,
  className,
}: {
  tone: BannerTone
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  return (
    <div
      className={cn('rounded-lg p-3 text-sm', TONE[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
