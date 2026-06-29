import { describe, it, expect } from 'vitest'
import { selectRemindersForDate, formatReminderEmail, type ReminderBooking } from './booking-reminders'

describe('selectRemindersForDate', () => {
  it('returns empty array when bookings empty', () => {
    const result = selectRemindersForDate('2026-04-16', [])
    expect(result).toEqual([])
  })

  it('excludes non-confirmed bookings', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'pending',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(0)
  })

  it('includes confirmed term-pass booking on a session date', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('b1')
  })

  it('excludes term-pass booking on non-session date', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-15', bookings)
    expect(result).toHaveLength(0)
  })

  it('excludes term-pass booking when targetDate outside term range', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-08-01', bookings)
    expect(result).toHaveLength(0)
  })

  it('excludes single-session bookings (not supported)', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'single',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(0)
  })

  it('excludes bookings missing term_name', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: null,
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(0)
  })

  it('excludes bookings missing term_year', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: null,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(0)
  })

  it('includes trial bookings on session dates (treated as term-pass)', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'trial',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(1)
  })

  it('handles multiple bookings with mixed types', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
      {
        id: 'b2',
        booking_type: 'single',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p2',
        child_id: 'c2',
      },
      {
        id: 'b3',
        booking_type: 'term',
        status: 'pending',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'confidance-kids',
        parent_id: 'p3',
        child_id: 'c3',
      },
      {
        id: 'b4',
        booking_type: 'trial',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'confidance-kids',
        parent_id: 'p4',
        child_id: 'c4',
      },
    ]
    const result = selectRemindersForDate('2026-04-16', bookings)
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id).sort()).toEqual(['b1', 'b4'])
  })

  it('includes different term sessions for same booking type', () => {
    const bookings: ReminderBooking[] = [
      {
        id: 'b1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
        class_type: 'baby-boogie',
        parent_id: 'p1',
        child_id: 'c1',
      },
    ]
    const sessionDates = ['2026-04-16', '2026-04-23', '2026-04-30', '2026-05-07']
    sessionDates.forEach((date) => {
      const result = selectRemindersForDate(date, bookings)
      expect(result.length).toBe(1)
    })
  })
})

describe('formatReminderEmail', () => {
  it('formats subject exactly: Reminder: <childName>s class tomorrow', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Emma' }
    const parent = { email: 'parent@example.com', full_name: 'Sarah' }

    const { subject } = formatReminderEmail(booking, child, parent)

    expect(subject).toBe("Reminder: Emma's class tomorrow")
  })

  it('includes class name in body', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Emma' }
    const parent = { email: 'parent@example.com', full_name: 'Sarah' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Baby Boogie')
  })

  it('includes day and time in body', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Emma' }
    const parent = { email: 'parent@example.com', full_name: 'Sarah' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Thursday')
    expect(body).toContain('3:45pm')
  })

  it('includes venue name and address', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Emma' }
    const parent = { email: 'parent@example.com', full_name: 'Sarah' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Grove Neighbourhood Centre')
    expect(body).toContain('7 Bradmore Park Road, Hammersmith, W6 0DT')
  })

  it('includes what to bring guidance', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Emma' }
    const parent = { email: 'parent@example.com', full_name: 'Sarah' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('water')
    expect(body).toContain('comfy clothes')
  })

  it('uses parent full name in greeting', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'confidance-kids',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Liam' }
    const parent = { email: 'parent@example.com', full_name: 'Michael' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Hi Michael')
  })

  it('falls back to "there" if parent full name null', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'confidance-kids',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Liam' }
    const parent = { email: 'parent@example.com', full_name: null }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Hi there')
  })

  it('formats different class correctly (confidance-kids)', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'confidance-kids',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Sophia' }
    const parent = { email: 'parent@example.com', full_name: 'Jane' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Confidance Kids')
    expect(body).toContain('4:20pm')
  })

  it('includes child name in greeting line', () => {
    const booking: ReminderBooking = {
      id: 'b1',
      booking_type: 'term',
      status: 'confirmed',
      term_name: 'Summer',
      term_year: 2026,
      class_type: 'baby-boogie',
      parent_id: 'p1',
      child_id: 'c1',
    }
    const child = { name: 'Oliver' }
    const parent = { email: 'parent@example.com', full_name: 'David' }

    const { body } = formatReminderEmail(booking, child, parent)

    expect(body).toContain('Oliver has Baby Boogie tomorrow')
  })
})
