import { describe, it, expect } from 'vitest'
import { computeTermPassPrice } from './pricing'

describe('computeTermPassPrice', () => {
  it('returns base price when no existing term bookings', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 0,
    })
    expect(result.amount).toBe(10000)
    expect(result.discountPct).toBe(0)
    expect(result.discountAmount).toBe(0)
  })

  it('applies discount when parent has 1 existing term booking for same term', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 1,
    })
    expect(result.amount).toBe(9000)
    expect(result.discountPct).toBe(10)
    expect(result.discountAmount).toBe(1000)
  })

  it('applies same discount for 2 existing bookings (3rd child)', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 2,
    })
    expect(result.amount).toBe(9000)
    expect(result.discountPct).toBe(10)
  })

  it('rounds amount to nearest penny', () => {
    const result = computeTermPassPrice({
      sessionCount: 7,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 1,
    })
    expect(result.amount).toBe(6300)
  })

  it('handles zero discount config gracefully', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 0,
      existingTermBookingsForParent: 5,
    })
    expect(result.amount).toBe(10000)
    expect(result.discountPct).toBe(0)
  })
})
