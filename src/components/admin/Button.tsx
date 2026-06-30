'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { InlineSpinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-teal text-white hover:bg-teal-dark',
  secondary: 'border border-charcoal/20 text-charcoal hover:bg-charcoal/5',
  danger: 'bg-error text-white hover:opacity-90',
  ghost: 'text-charcoal hover:bg-charcoal/5',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-heading font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <InlineSpinner /> : icon}
      {children}
    </button>
  )
}
