import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from './cn'

// Shared input styling for every admin form control.
export const fieldClass =
  'w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-teal'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-charcoal">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-charcoal/50">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClass, className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, className)} {...props} />
}
