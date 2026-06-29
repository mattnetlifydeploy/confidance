import { CLASSES, VENUE, TERMS, getTermSessionDates, type ClassType, type TermDef } from './constants'

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
 * - For TERM-PASS bookings: targetDate must be one of the term's session dates
 * - For SINGLE-SESSION bookings: NOT SUPPORTED (no session_date stored in DB; reminders skipped)
 * - For TRIAL bookings: treat like term-pass (targetDate matches term session dates)
 *
 * Note: Single-session bookings do not store session_date in the bookings table.
 * Future item #8 will add holiday exclusions via getTermSessions(). For now we use
 * getTermSessionDates(). Update this line when getTermSessions() replaces it.
 */
export function selectRemindersForDate(
  targetDate: string,
  bookings: ReminderBooking[],
): ReminderBooking[] {
  const confirmed = bookings.filter((b) => b.status === 'confirmed')

  return confirmed.filter((booking) => {
    if (booking.booking_type === 'single') {
      return false
    }

    if (!booking.term_name || booking.term_year === null) {
      return false
    }

    const term = TERMS.find((t) => t.name === booking.term_name && t.year === booking.term_year)
    if (!term) {
      return false
    }

    try {
      const sessionDates = getTermSessionDates(term)
      return sessionDates.includes(targetDate)
    } catch {
      return false
    }
  })
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
