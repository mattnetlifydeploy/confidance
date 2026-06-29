import { describe, it, expect } from 'vitest'
import {
  countActiveForSlot,
  isClassFull,
  checkCapacity,
  type CapacityBooking,
} from './capacity'

const slot = { classType: 'baby-boogie', termName: 'Summer', termYear: 2026 }

function bk(overrides: Partial<CapacityBooking> = {}): CapacityBooking {
  return {
    status: 'confirmed',
    class_type: 'baby-boogie',
    term_name: 'Summer',
    term_year: 2026,
    ...overrides,
  }
}

describe('countActiveForSlot', () => {
  it('counts pending and confirmed bookings for the slot', () => {
    const bookings = [bk(), bk({ status: 'pending' }), bk()]
    expect(countActiveForSlot(bookings, slot)).toBe(3)
  })

  it('ignores cancelled and other inactive statuses', () => {
    const bookings = [bk(), bk({ status: 'cancelled' }), bk({ status: 'payment_failed' })]
    expect(countActiveForSlot(bookings, slot)).toBe(1)
  })

  it('ignores a different class in the same term', () => {
    const bookings = [bk(), bk({ class_type: 'confidance-kids' })]
    expect(countActiveForSlot(bookings, slot)).toBe(1)
  })

  it('ignores the same class in a different term', () => {
    const bookings = [bk(), bk({ term_name: 'Autumn' }), bk({ term_year: 2027 })]
    expect(countActiveForSlot(bookings, slot)).toBe(1)
  })

  it('returns 0 for an empty list', () => {
    expect(countActiveForSlot([], slot)).toBe(0)
  })
})

describe('isClassFull', () => {
  it('is false below the cap', () => {
    expect(isClassFull(11, 12)).toBe(false)
  })

  it('is true at the cap', () => {
    expect(isClassFull(12, 12)).toBe(true)
  })

  it('is true above the cap', () => {
    expect(isClassFull(13, 12)).toBe(true)
  })

  it('defaults to MAX_BOOKINGS_PER_CLASS (12)', () => {
    expect(isClassFull(12)).toBe(true)
    expect(isClassFull(11)).toBe(false)
  })
})

describe('checkCapacity', () => {
  it('reports remaining slots when space is left', () => {
    const bookings = Array.from({ length: 10 }, () => bk())
    expect(checkCapacity(bookings, slot)).toEqual({ count: 10, remaining: 2, full: false })
  })

  it('reports full with zero remaining at the cap', () => {
    const bookings = Array.from({ length: 12 }, () => bk())
    expect(checkCapacity(bookings, slot)).toEqual({ count: 12, remaining: 0, full: true })
  })

  it('never reports negative remaining when over the cap', () => {
    const bookings = Array.from({ length: 15 }, () => bk())
    expect(checkCapacity(bookings, slot)).toEqual({ count: 15, remaining: 0, full: true })
  })

  it('respects a custom max', () => {
    const bookings = Array.from({ length: 6 }, () => bk())
    expect(checkCapacity(bookings, slot, 6)).toEqual({ count: 6, remaining: 0, full: true })
  })
})
