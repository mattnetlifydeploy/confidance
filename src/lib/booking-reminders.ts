import { CLASSES, VENUE, TERMS, type ClassType, type TermDef } from './constants'
import { getTermSessions } from './term-sessions'

export type ReminderBooking = {
  id: string
  booking_type: string
  status: string
  term_name: string | null
  term_year: number | null
  class_type: string
  parent_id: string
  child_id: string
}

export type ReminderChild = { name: string }

export type ReminderParent = {
  email: string
  full_name: string | null
}

export type ReminderCandidate = {
  booking_id: string
  booking: ReminderBooking
  child: ReminderChild
  parent: ReminderParent
}

/**
 * Select bookings to remind tomorrow (targetDate is the class date, i.e., tomorrow).
 *
 * Inclusion rules:
 * - status must be 'confirmed'
 * - For TERM-PASS bookings: targetDate must be one of the term's session dates (excluding admin-managed exclusions)
 * - For SINGLE-SESSION bookings: NOT SUPPORTED (no session_date stored in DB; reminders skipped)
 * - For TRIAL bookings: treat like term-pass (targetDate matches term session dates)
 *
 * Note: Single-session bookings do not store session_date in the bookings table.
 * Now uses getTermSessions() which respects admin-managed holiday exclusions.
 * For testing, pass an exclusionsFn to avoid DB lookups.
 */
export async function selectRemindersForDate(
  targetDate: string,
  bookings: ReminderBooking[],
  exclusionsFn?: (termName: string, termYear: number) => Promise<string[]>,
): Promise<ReminderBooking[]> {
  const confirmed = bookings.filter((b) => b.status === 'confirmed')

  const filtered = await Promise.all(
    confirmed.map(async (booking) => {
      if (booking.booking_type === 'single') {
        return null
      }

      if (!booking.term_name || booking.term_year === null) {
        return null
      }

      const term = TERMS.find((t) => t.name === booking.term_name && t.year === booking.term_year)
      if (!term) {
        return null
      }

      try {
        const sessionDates = await getTermSessions(term, undefined, exclusionsFn ? async () => await exclusionsFn(booking.term_name!, booking.term_year!) : undefined)
        return sessionDates.includes(targetDate) ? booking : null
      } catch {
        return null
      }
    }),
  )

  return filtered.filter((b): b is ReminderBooking => b !== null)
}

/**
 * Format a reminder email for a booking.
 * Subject exactly: "Reminder: <childName>'s class tomorrow"
 * Body (plain text): class name, day/time, venue, what to bring.
 */
export function formatReminderEmail(
  booking: ReminderBooking,
  child: ReminderChild,
  parent: ReminderParent,
): { subject: string; body: string } {
  const classMeta = CLASSES[booking.class_type as ClassType]
  const className = classMeta?.name ?? booking.class_type
  const dayTime = classMeta ? `${classMeta.day}, ${classMeta.time}` : 'see timetable'

  const subject = `Reminder: ${child.name}'s class tomorrow`

  const body = `Hi ${parent.full_name || 'there'},

Just a friendly reminder that ${child.name} has ${className} tomorrow (${dayTime}).

Venue: ${VENUE.name}, ${VENUE.address}

Please bring water and comfy clothes your child can move and dance in.

See you then,
Confidance`

  return { subject, body }
}
