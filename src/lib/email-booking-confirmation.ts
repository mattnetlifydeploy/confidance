import { getResend, FROM_ADDRESS } from './resend'
import { auditLog } from './audit-log'
import { logAdminMessage } from './admin-messages'
import { CLASSES, VENUE, CONTACT_EMAIL, TERMS, getTermSessionDates } from './constants'
import { getClassesMap, getVenue } from './classes'
import type { ClassInfo, ClassMap, Venue } from './classes'

export const BOOKING_CONFIRMATION_SUBJECT = 'Your Confidance booking is confirmed'

export type ConfirmationBooking = {
  id: string
  parent_id: string
  booking_type: string
  class_type: string
  term_name: string | null
  term_year: number | null
}

export type ConfirmationChild = { name: string }
export type ConfirmationParent = { email: string; full_name: string | null }

/** Format an ISO date (YYYY-MM-DD) as e.g. 'Thursday 16 April 2026'. */
export function formatSessionDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

function buildWhenSection(booking: ConfirmationBooking, meta: ClassInfo | null, sessionDate?: string | null): string {
  const schedule = meta ? `${meta.day}s, ${meta.time}` : 'see timetable'

  if (booking.booking_type === 'term' && booking.term_name && booking.term_year != null) {
    const term = TERMS.find((t) => t.name === booking.term_name && t.year === booking.term_year)
    if (term) {
      const list = getTermSessionDates(term)
        .map((d) => `  - ${formatSessionDate(d)}`)
        .join('\n')
      return `When: ${schedule}\nYour ${term.name} ${term.year} term covers these sessions:\n${list}`
    }
    return `When: ${schedule} (${booking.term_name} ${booking.term_year} term)`
  }

  if (sessionDate) {
    return meta ? `When: ${formatSessionDate(sessionDate)}, ${meta.time}` : `When: ${formatSessionDate(sessionDate)}`
  }

  return `When: ${schedule}`
}

export function formatBookingConfirmation(
  booking: ConfirmationBooking,
  child: ConfirmationChild,
  parent: ConfirmationParent,
  sessionDate?: string | null,
  classes: ClassMap = { ...CLASSES },
  venue: Venue = { ...VENUE },
): { subject: string; text: string } {
  const meta = classes[booking.class_type] ?? null
  const className = meta ? meta.name : booking.class_type
  const greetingName = parent.full_name || 'there'
  const trialTag = booking.booking_type === 'trial' ? ' (free trial)' : ''
  const ref = booking.id.slice(0, 8)

  const text = `Hi ${greetingName},

Your Confidance booking is confirmed.

Class: ${className}${trialTag}
Child: ${child.name}
${buildWhenSection(booking, meta, sessionDate)}
Venue: ${venue.name}, ${venue.address}

What to bring: a water bottle and comfy clothes your child can move and dance in.

Rescheduling policy: Reschedules made 24 hours or more before a session receive a full refund of the original. Reschedules within 24 hours are not refunded but you will receive account credit.

Booking reference: ${ref}

To cancel or reschedule, contact us at ${CONTACT_EMAIL}.

See you on the dance floor,
Confidance`

  return { subject: BOOKING_CONFIRMATION_SUBJECT, text }
}

/**
 * Send a booking confirmation email. Fire-and-forget: never throws, swallows
 * all errors. Records the attempt (success or failure) to the admin audit log.
 */
export async function sendBookingConfirmation(
  booking: ConfirmationBooking,
  child: ConfirmationChild,
  parent: ConfirmationParent,
  sessionDate?: string | null,
): Promise<void> {
  try {
    if (!parent.email) return
    const [classes, venue] = await Promise.all([getClassesMap(), getVenue()])
    const { subject, text } = formatBookingConfirmation(booking, child, parent, sessionDate, classes, venue)
    const resend = getResend()
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: parent.email,
      subject,
      text,
    })
    const resendId = result.data?.id || null
    await logAdminMessage({
      sentBy: null,
      channel: 'email',
      audience: { bookingId: booking.id },
      subject,
      body: text,
      recipientCount: 1,
      resendId,
    })
    await auditLog(booking.parent_id, 'booking_confirmation_email', 'booking', booking.id, {
      to: parent.email,
      ok: !result.error,
      error: result.error ? result.error.message : null,
    })
  } catch {
    // fire-and-forget: a failed confirmation email must never break a booking
  }
}
