import { describe, it, expect } from 'vitest'
import {
  formatBookingConfirmation,
  formatSessionDate,
  BOOKING_CONFIRMATION_SUBJECT,
  type ConfirmationBooking,
} from './email-booking-confirmation'

const baseParent = { email: 'parent@example.com', full_name: 'Jordan Lee' }
const baseChild = { name: 'Ava' }

function booking(overrides: Partial<ConfirmationBooking> = {}): ConfirmationBooking {
  return {
    id: 'abcd1234-0000-0000-0000-000000000000',
    parent_id: 'parent-uuid',
    booking_type: 'single',
    class_type: 'baby-boogie',
    term_name: null,
    term_year: null,
    ...overrides,
  }
}

describe('formatSessionDate', () => {
  it('formats an ISO date as a UK long date', () => {
    expect(formatSessionDate('2026-04-16')).toBe('Thursday, 16 April 2026')
  })

  it('is timezone-stable around midnight', () => {
    expect(formatSessionDate('2026-12-25')).toBe('Friday, 25 December 2026')
  })
})

describe('formatBookingConfirmation', () => {
  it('uses the fixed confirmation subject', () => {
    const { subject } = formatBookingConfirmation(booking(), baseChild, baseParent, '2026-04-16')
    expect(subject).toBe(BOOKING_CONFIRMATION_SUBJECT)
    expect(subject).toBe('Your Confidance booking is confirmed')
  })

  it('greets the parent by name and names the child and class', () => {
    const { text } = formatBookingConfirmation(booking(), baseChild, baseParent, '2026-04-16')
    expect(text).toContain('Hi Jordan Lee,')
    expect(text).toContain('Child: Ava')
    expect(text).toContain('Class: Baby Boogie')
  })

  it('falls back to "there" when the parent has no name', () => {
    const { text } = formatBookingConfirmation(
      booking(),
      baseChild,
      { email: 'p@e.com', full_name: null },
      '2026-04-16',
    )
    expect(text).toContain('Hi there,')
  })

  it('shows a single chosen session date', () => {
    const { text } = formatBookingConfirmation(booking(), baseChild, baseParent, '2026-04-16')
    expect(text).toContain('When: Thursday, 16 April 2026')
  })

  it('marks a free trial', () => {
    const { text } = formatBookingConfirmation(
      booking({ booking_type: 'trial' }),
      baseChild,
      baseParent,
      '2026-04-16',
    )
    expect(text).toContain('Class: Baby Boogie (free trial)')
  })

  it('lists term session dates for a term pass', () => {
    const { text } = formatBookingConfirmation(
      booking({ booking_type: 'term', class_type: 'confidance-kids', term_name: 'Summer', term_year: 2026 }),
      baseChild,
      baseParent,
    )
    expect(text).toContain('Your Summer 2026 term covers these sessions:')
    expect(text).toContain('Class: Confidance Kids')
    // Summer 2026 runs Thursdays 16 Apr to 16 Jul 2026, excluding 28 May.
    expect(text).toContain('Thursday, 16 April 2026')
    expect(text).not.toContain('Thursday, 28 May 2026')
  })

  it('includes venue, what-to-bring, contact and an 8-char booking ref', () => {
    const { text } = formatBookingConfirmation(booking(), baseChild, baseParent, '2026-04-16')
    expect(text).toContain('Grove Neighbourhood Centre')
    expect(text).toContain('water bottle')
    expect(text).toContain('confidancejessica@gmail.com')
    expect(text).toContain('Booking reference: abcd1234')
  })

  it('falls back to class schedule when no session date is known', () => {
    const { text } = formatBookingConfirmation(booking(), baseChild, baseParent)
    expect(text).toContain('When: Thursdays, 3:45pm to 4:15pm')
  })
})
