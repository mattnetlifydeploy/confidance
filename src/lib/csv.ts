export function serializeCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCsvField = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
      return ''
    }

    const str = String(value)

    // If field contains comma, double-quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"` // Double any existing quotes
    }

    return str
  }

  const headerRow = headers.map(escapeCsvField).join(',')
  const dataRows = rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n')

  return headerRow + '\r\n' + dataRows
}
