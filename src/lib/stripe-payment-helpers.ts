import type Stripe from 'stripe'

export type StripePaymentEventData = {
  customerId: string | null
  customerEmail: string | null
  amount: number | null
}

/**
 * Extract customer id and email from a Stripe payment failed event.
 * Handles both invoice.payment_failed and charge.failed event objects.
 * Defensive: returns nulls if data is missing or unexpected shape.
 */
export function extractPaymentEventData(
  event: Stripe.Event,
): StripePaymentEventData {
  const customerId = null
  const customerEmail = null
  const amount = null

  try {
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      return {
        customerId: invoice.customer as string | null,
        customerEmail: invoice.customer_email || null,
        amount: invoice.amount_due || null,
      }
    }

    if (event.type === 'charge.failed') {
      const charge = event.data.object as Stripe.Charge
      return {
        customerId: charge.customer as string | null,
        customerEmail: charge.billing_details?.email || null,
        amount: charge.amount || null,
      }
    }
  } catch {
    // Defensive: fall through to defaults
  }

  return { customerId, customerEmail, amount }
}
