import { describe, it, expect } from 'vitest'

function pickInvoiceUrl(session: any): string | null {
  if (session.invoice?.hosted_invoice_url) {
    return session.invoice.hosted_invoice_url
  }
  if (session.payment_intent?.latest_charge?.receipt_url) {
    return session.payment_intent.latest_charge.receipt_url
  }
  return null
}

describe('pickInvoiceUrl', () => {
  it('returns hosted_invoice_url when available', () => {
    const session = {
      invoice: { hosted_invoice_url: 'https://invoice.stripe.com/i/test1' },
      payment_intent: { latest_charge: { receipt_url: 'https://receipt.stripe.com/r/test' } },
    }
    expect(pickInvoiceUrl(session)).toBe('https://invoice.stripe.com/i/test1')
  })

  it('falls back to receipt_url when invoice is missing hosted_invoice_url', () => {
    const session = {
      invoice: { hosted_invoice_url: null },
      payment_intent: { latest_charge: { receipt_url: 'https://receipt.stripe.com/r/test2' } },
    }
    expect(pickInvoiceUrl(session)).toBe('https://receipt.stripe.com/r/test2')
  })

  it('returns null when neither URL is available', () => {
    const session = {
      invoice: { hosted_invoice_url: null },
      payment_intent: { latest_charge: { receipt_url: null } },
    }
    expect(pickInvoiceUrl(session)).toBeNull()
  })

  it('handles missing nested fields gracefully', () => {
    const session = {}
    expect(pickInvoiceUrl(session)).toBeNull()
  })
})
