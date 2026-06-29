import { describe, it, expect } from 'vitest'
import { formatPaymentFailed } from './email-payment-failed'
import type { PaymentFailedBooking } from './email-payment-failed'

const baseParent = { email: 'parent@example.com', full_name: 'Sarah Jones' }
const baseChild = { name: 'Emma' }

function booking(overrides: Partial<PaymentFailedBooking> = {}): PaymentFailedBooking {
  return {
    id: 'booking-uuid-123',
    parent_id: 'parent-uuid',
    child_id: 'child-uuid',
    class_type: 'baby-boogie',
    amount_paid_pence: 1200,
    ...overrides,
  }
}

describe('formatPaymentFailed', () => {
  it('includes subject line', () => {
    const { subject } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(subject).toBe('Payment issue with your Confidance booking')
  })

  it('greets parent by name', () => {
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(text).toContain('Hi Sarah Jones,')
  })

  it('falls back to there if no parent name', () => {
    const { text } = formatPaymentFailed(
      booking(),
      baseChild,
      { email: 'parent@example.com', full_name: null },
      null,
    )
    expect(text).toContain('Hi there,')
  })

  it('includes class and child name', () => {
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(text).toContain('Class: Baby Boogie')
    expect(text).toContain('Child: Emma')
  })

  it('formats amount as GBP', () => {
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(text).toContain('Amount: £12.00')
  })

  it('includes billing portal URL when provided', () => {
    const portalUrl = 'https://billing.stripe.com/session/abc123'
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, portalUrl)
    expect(text).toContain(portalUrl)
    expect(text).toContain('update your payment method')
  })

  it('falls back to contact email when no portal URL', () => {
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(text).toContain('confidancejessica@gmail.com')
    expect(text).not.toContain('https://billing.stripe.com')
  })

  it('handles confidance-kids class', () => {
    const { text } = formatPaymentFailed(
      booking({ class_type: 'confidance-kids' }),
      baseChild,
      baseParent,
      null,
    )
    expect(text).toContain('Class: Confidance Kids')
  })

  it('includes polite sign-off', () => {
    const { text } = formatPaymentFailed(booking(), baseChild, baseParent, null)
    expect(text).toContain('Confidance')
  })
})
