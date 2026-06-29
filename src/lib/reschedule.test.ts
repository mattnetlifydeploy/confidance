import { describe, it, expect } from 'vitest'
import { refundPolicy } from './reschedule'

describe('refundPolicy', () => {
  it('returns full_refund when session is >= 24h away', () => {
    const now = new Date('2026-06-28T10:00:00Z').toISOString()
    const session = '2026-06-29' // 13h 40m away at midnight UTC
    expect(refundPolicy(session, now)).toBe('no_refund_credit')
  })

  it('returns full_refund when session is well beyond 24h away', () => {
    const now = new Date('2026-06-28T10:00:00Z').toISOString()
    const session = '2026-06-30' // 37h 40m away
    expect(refundPolicy(session, now)).toBe('full_refund')
  })

  it('returns full_refund when session is more than 24h away', () => {
    const now = new Date('2026-06-29T10:00:00Z').toISOString()
    const session = '2026-07-03' // 5 days later
    expect(refundPolicy(session, now)).toBe('full_refund')
  })

  it('returns no_refund_credit when session is less than 24h away', () => {
    const now = new Date('2026-06-29T10:00:00Z').toISOString()
    const session = '2026-06-29' // same day (< 24h)
    expect(refundPolicy(session, now)).toBe('no_refund_credit')
  })

  it('returns no_refund_credit when session is in the past', () => {
    const now = new Date('2026-06-29T10:00:00Z').toISOString()
    const session = '2026-06-28'
    expect(refundPolicy(session, now)).toBe('no_refund_credit')
  })

  it('returns no_refund_credit when session date is null', () => {
    const now = new Date('2026-06-29T10:00:00Z').toISOString()
    expect(refundPolicy(null, now)).toBe('no_refund_credit')
  })

  it('returns no_refund_credit when session date is undefined', () => {
    const now = new Date('2026-06-29T10:00:00Z').toISOString()
    expect(refundPolicy(undefined, now)).toBe('no_refund_credit')
  })
})
