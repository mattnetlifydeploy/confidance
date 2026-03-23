import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createClient } from '@supabase/supabase-js'
import { VENUE } from '@/lib/constants'
import type Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Use service role key for webhook (bypasses RLS)
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

const LOCATION = `${VENUE.name}, ${VENUE.address}`

export async function POST(req: NextRequest) {
  if (!stripe || !supabaseAdmin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      // Update booking status (no payment_intent_id column in DB)
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}
