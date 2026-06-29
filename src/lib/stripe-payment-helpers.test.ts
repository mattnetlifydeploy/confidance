import { describe, it, expect } from 'vitest'
import { extractPaymentEventData } from './stripe-payment-helpers'
import type Stripe from 'stripe'

describe('extractPaymentEventData', () => {
  it('extracts data from invoice.payment_failed event', () => {
    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_123456',
          customer_email: 'test@example.com',
          amount_due: 5000,
        },
      },
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBe('cus_123456')
    expect(result.customerEmail).toBe('test@example.com')
    expect(result.amount).toBe(5000)
  })

  it('extracts data from charge.failed event', () => {
    const event = {
      type: 'charge.failed',
      data: {
        object: {
          customer: 'cus_789012',
          billing_details: { email: 'parent@example.com' },
          amount: 3000,
        },
      },
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBe('cus_789012')
    expect(result.customerEmail).toBe('parent@example.com')
    expect(result.amount).toBe(3000)
  })

  it('handles missing customer_email in invoice', () => {
    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_111111',
          amount_due: 2000,
        },
      },
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBe('cus_111111')
    expect(result.customerEmail).toBeNull()
    expect(result.amount).toBe(2000)
  })

  it('handles missing billing_details in charge', () => {
    const event = {
      type: 'charge.failed',
      data: {
        object: {
          customer: 'cus_222222',
          amount: 1500,
        },
      },
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBe('cus_222222')
    expect(result.customerEmail).toBeNull()
    expect(result.amount).toBe(1500)
  })

  it('returns all nulls for unexpected event type', () => {
    const event = {
      type: 'customer.created',
      data: { object: {} },
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBeNull()
    expect(result.customerEmail).toBeNull()
    expect(result.amount).toBeNull()
  })

  it('handles malformed event gracefully', () => {
    const event = {
      type: 'invoice.payment_failed',
      data: null,
    } as unknown as Stripe.Event

    const result = extractPaymentEventData(event)
    expect(result.customerId).toBeNull()
    expect(result.customerEmail).toBeNull()
    expect(result.amount).toBeNull()
  })
})
