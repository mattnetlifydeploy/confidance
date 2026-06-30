'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from './cn'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TONE: Record<ToastTone, string> = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  info: 'border-info/30 text-info',
  warning: 'border-warning/30 text-warning',
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      counter += 1
      const id = counter
      setToasts((t) => [...t, { id, tone, message }])
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
    warning: (m) => push('warning', m),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => remove(t.id)}
            className={cn(
              'pointer-events-auto flex max-w-xs items-center gap-2 rounded-xl border bg-white px-4 py-3 text-left text-sm font-medium shadow-lg',
              TONE[t.tone],
            )}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
