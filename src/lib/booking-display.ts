import { CLASSES, TERMS, getTermSessionDates, type TermDef } from './constants'

/**
 * Compute the next session date for a term-pass booking.
 * Returns ISO date string of the first Thursday >= today in the booking's term.
 * Admin-managed DB exclusions are not reflected on the client (acceptable per spec).
 */
export function nextSessionDate(termName: string | null, termYear: number | null, today: string): string | null {
  if (!termName || !termYear) return null

  const term = TERMS.find((t) => t.name === termName && t.year === termYear)
  if (!term) return null

  const sessionDates = getTermSessionDates(term)
  const nextSession = sessionDates.find((date) => date >= today)
  return nextSession || null
}

/**
 * Format class time as "HH:MMam/pm to HH:MMam/pm" e.g. "3:45pm to 4:15pm"
 */
export function formatSessionTime(classType: string): string {
  const classInfo = CLASSES[classType as keyof typeof CLASSES]
  return classInfo?.time || 'TBA'
}

/**
 * Format a session date as "Thursday 9 July"
 */
export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00Z')
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Format full session display: "Thursday 9 July, 3:45pm to 4:15pm"
 */
export function formatFullSession(isoDate: string, classType: string): string {
  const dateStr = formatSessionDate(isoDate)
  const timeStr = formatSessionTime(classType)
  return `${dateStr}, ${timeStr}`
}

/**
 * What to bring for a class (constant for now).
 */
export function whatToBring(): string {
  return 'Bring water and comfy clothes'
}
