import type { ReactNode } from 'react'
import { cn } from './cn'

// Standard admin surface: the brand double-bezel card.
export function AdminCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('card-bezel rounded-3xl bg-white p-6 sm:p-8', className)}>{children}</div>
}
