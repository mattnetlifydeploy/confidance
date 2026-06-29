'use client'

import { serializeCsv } from '@/lib/csv'

interface ExportCsvButtonProps {
  label?: string
  filename: string
  headers: string[]
  rows: (string | number | null | undefined)[][]
}

export function ExportCsvButton({
  label = 'Export CSV',
  filename,
  headers,
  rows,
}: ExportCsvButtonProps) {
  const handleExport = () => {
    try {
      const csv = serializeCsv(headers, rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export CSV:', err)
    }
  }

  return (
    <button
      onClick={handleExport}
      className="inline-block rounded-lg bg-warm-gray/10 px-3 py-1 text-xs font-600 text-warm-gray hover:bg-warm-gray/20 transition-colors"
    >
      {label}
    </button>
  )
}
