'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from './cn'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
}

// Base modal: Escape to close, backdrop click to close, body scroll lock.
export function Modal({ open, onClose, title, children, footer, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn('card-bezel max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 sm:p-8', SIZE[size])}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-lg leading-none text-charcoal/60 transition-colors hover:text-charcoal"
            >
              ✕
            </button>
          </div>
        )}
        {children}
        {footer && <div className="mt-6 flex flex-wrap gap-3">{footer}</div>}
      </div>
    </div>
  )
}
