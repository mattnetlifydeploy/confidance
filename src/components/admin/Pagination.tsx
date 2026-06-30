'use client'

import { cn } from './cn'
import { Button } from './Button'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null
  return (
    <div className={cn('flex items-center justify-between gap-4 pt-4', className)}>
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-charcoal/60">
        Page {page} of {pageCount}
      </span>
      <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  )
}
