import { MAX_BOOKINGS_PER_CLASS } from './constants'

// A booking counts toward capacity only while it is pending or confirmed.
// Cancelled / failed bookings free their slot.
export const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'] as const

export type CapacityBooking = {
  status: string
  class_type: string
  term_name: string | null
  term_year: number | null
}

export type CapacitySlot = {
  classType: string
  termName: string | null
  termYear: number | null
}

/**
 * Count active bookings that occupy a given class slot (class + term).
 *
 * Bookings have no per-session date column, so a slot is scoped to a class
 * within a term. Trials, single sessions and term passes for the same class
 * and term all draw from the same pool.
 */
export function countActiveForSlot(bookings: CapacityBooking[], slot: CapacitySlot): number {
  return bookings.filter(
    (b) =>
      (ACTIVE_BOOKING_STATUSES as readonly string[]).includes(b.status) &&
      b.class_type === slot.classType &&
      b.term_name === slot.termName &&
      b.term_year === slot.termYear,
  ).length
}

/** True once the slot has reached (or exceeded) its cap. */
export function isClassFull(count: number, max: number = MAX_BOOKINGS_PER_CLASS): boolean {
  return count >= max
}

export type CapacityResult = {
  count: number
  remaining: number
  full: boolean
}

/** Compute capacity status for a slot from a list of bookings. */
export function checkCapacity(
  bookings: CapacityBooking[],
  slot: CapacitySlot,
  max: number = MAX_BOOKINGS_PER_CLASS,
): CapacityResult {
  const count = countActiveForSlot(bookings, slot)
  return {
    count,
    remaining: Math.max(0, max - count),
    full: isClassFull(count, max),
  }
}
