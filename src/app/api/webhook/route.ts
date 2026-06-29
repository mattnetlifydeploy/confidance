import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createClient } from '@supabase/supabase-js'
import { VENUE } from '@/lib/constants'
import { sendBookingConfirmation } from '@/lib/email-booking-confirmation'
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

      // Send the booking confirmation email for paid single/term bookings.
      const { data: bk } = await supabaseAdmin
        .from('bookings')
        .select('id, parent_id, child_id, booking_type, class_type, term_name, term_year')
        .eq('id', bookingId)
        .maybeSingle()

      if (bk) {
        const [{ data: child }, { data: parent }] = await Promise.all([
          supabaseAdmin.from('children').select('name').eq('id', bk.child_id).maybeSingle(),
          supabaseAdmin.from('profiles').select('email, full_name').eq('id', bk.parent_id).maybeSingle(),
        ])

        if (child && parent) {
          await sendBookingConfirmation(
            {
              id: bk.id,
              parent_id: bk.parent_id,
              booking_type: bk.booking_type,
              class_type: bk.class_type,
              term_name: bk.term_name,
              term_year: bk.term_year,
            },
            { name: child.name },
            { email: parent.email, full_name: parent.full_name },
          )
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
