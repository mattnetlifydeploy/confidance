import { describe, it, expect } from 'vitest'
import { isWithinTermEndWindow, selectRebookParentIds, type Booking } from './term-end-rebook'

describe('isWithinTermEndWindow', () => {
  it('returns false when today is before window opens', () => {
    const result = isWithinTermEndWindow('2026-06-20', '2026-07-16', 21)
    expect(result).toBe(false)
  })

  it('returns true when today is exactly window-open (termEnd - windowDays)', () => {
    const result = isWithinTermEndWindow('2026-06-25', '2026-07-16', 21)
    expect(result).toBe(true)
  })

  it('returns true when today is in the middle of window', () => {
    const result = isWithinTermEndWindow('2026-07-01', '2026-07-16', 21)
    expect(result).toBe(true)
  })

  it('returns true when today equals endDate', () => {
    const result = isWithinTermEndWindow('2026-07-16', '2026-07-16', 21)
    expect(result).toBe(true)
  })

  it('returns false when today is after endDate', () => {
    const result = isWithinTermEndWindow('2026-07-17', '2026-07-16', 21)
    expect(result).toBe(false)
  })
})

describe('selectRebookParentIds', () => {
  it('returns empty array when bookings is empty', () => {
    const result = selectRebookParentIds([], { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual([])
  })

  it('includes parent with confirmed current-term booking and no next-term', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual(['parent1'])
  })

  it('excludes parent with confirmed current-term AND confirmed next-term', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Autumn',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual([])
  })

  it('excludes parent with current-term booking_type=single (not term)', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent1',
        booking_type: 'single',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual([])
  })

  it('excludes parent with current-term status=cancelled', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'cancelled',
        term_name: 'Summer',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual([])
  })

  it('deduplicates parent with two confirmed current-term bookings (two children)', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual(['parent1'])
  })

  it('returns result sorted ascending for deterministic tests', () => {
    const bookings: Booking[] = [
      {
        parent_id: 'parent3',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
      {
        parent_id: 'parent1',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
      {
        parent_id: 'parent2',
        booking_type: 'term',
        status: 'confirmed',
        term_name: 'Summer',
        term_year: 2026,
      },
    ]
    const result = selectRebookParentIds(bookings, { name: 'Summer', year: 2026 }, { name: 'Autumn', year: 2026 })
    expect(result).toEqual(['parent1', 'parent2', 'parent3'])
  })
})
