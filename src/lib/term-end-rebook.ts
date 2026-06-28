export type Booking = {
  parent_id: string
  booking_type: string
  status: string
  term_name: string | null
  term_year: number | null
}

export type TermDef = {
  name: string
  year: number
  startDate: string
  endDate: string
  displayStart: string
}

export function isWithinTermEndWindow(
  todayIso: string,
  termEndIso: string,
  windowDays: number,
): boolean {
  const endDate = new Date(termEndIso)
  const windowStartDate = new Date(endDate)
  windowStartDate.setDate(windowStartDate.getDate() - windowDays)

  const today = new Date(todayIso)

  return today >= windowStartDate && today <= endDate
}

export function selectRebookParentIds(
  bookings: Booking[],
  currentTerm: { name: string; year: number },
  nextTerm: { name: string; year: number },
): string[] {
  const confirmed = bookings.filter((b) => b.status === 'confirmed' && b.booking_type === 'term')

  const currentTermParents = new Set(
    confirmed
      .filter((b) => b.term_name === currentTerm.name && b.term_year === currentTerm.year)
      .map((b) => b.parent_id),
  )

  const nextTermParents = new Set(
    confirmed
      .filter((b) => b.term_name === nextTerm.name && b.term_year === nextTerm.year)
      .map((b) => b.parent_id),
  )

  const targetIds = Array.from(currentTermParents).filter((id) => !nextTermParents.has(id))

  return targetIds.sort()
}
