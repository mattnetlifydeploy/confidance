'use client'

import type { ReactNode } from 'react'
import { cn } from './cn'
import { AdminSpinner } from './Spinner'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: Array<Column<T>>
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  empty?: { title: string; description?: string }
  onRowClick?: (row: T) => void
}

const alignClass = (a?: 'left' | 'right' | 'center') =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

export function DataTable<T>({ columns, rows, rowKey, loading, empty, onRowClick }: DataTableProps<T>) {
  if (loading) return <AdminSpinner />
  if (rows.length === 0) {
    return <EmptyState title={empty?.title ?? 'Nothing here yet'} description={empty?.description} />
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-charcoal/10">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50',
                  alignClass(c.align),
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-charcoal/5 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-pale/20',
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn('px-3 py-3 text-charcoal', alignClass(c.align), c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
