import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

export const getStripe = () => loadStripe(stripePublishableKey)

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
