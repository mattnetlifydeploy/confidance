'use client'

import type { ReactNode } from 'react'
import { cn } from './cn'

export interface FilterTabOption {
  value: string
  label: string
  count?: number
}

interface FilterTabsProps {
  options: FilterTabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

// Pill-style status tabs (enquiries/parents pattern).
export function FilterTabs({ options, value, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active ? 'bg-teal text-white' : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10',
            )}
          >
            {opt.label}
            {typeof opt.count === 'number' ? ` (${opt.count})` : ''}
          </button>
        )
      })}
    </div>
  )
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-2.5', className)}>{children}</div>
}

interface FilterSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}

export function FilterSelect({ label, value, onChange, options, className }: FilterSelectProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-charcoal/70', className)}>
      {label && <span className="font-medium">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-teal"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
