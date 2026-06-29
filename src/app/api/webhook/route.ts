import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createClient } from '@supabase/supabase-js'
import { VENUE, CONTACT_EMAIL } from '@/lib/constants'
import { sendBookingConfirmation } from '@/lib/email-booking-confirmation'
import { sendPaymentFailedEmail } from '@/lib/email-payment-failed'
import { extractPaymentEventData } from '@/lib/stripe-payment-helpers'
import { auditLog } from '@/lib/audit-log'
import { logAdminMessage } from '@/lib/admin-messages'
import type Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Use service role key for webhook (bypasses RLS)
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

const LOCATION = `${VENUE.name}, ${VENUE.address}`

/**
 * Find a pending/confirmed booking by parent email. Since bookings don't store stripe_customer_id
 * directly, we match via the parent's email address in the profiles table.
 * Strategy: find bookings with status 'pending' or 'confirmed' for a parent matching the email.
 * Returns the most recent one, or null if no match found.
 */
async function findBookingByParentEmail(
  email: string | null,
): Promise<{
  id: string
  parent_id: string
  child_id: string
  class_type: string
  amount_paid_pence: number
} | null> {
  if (!email || !supabaseAdmin) return null

  try {
    // Find profile by email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!profile) return null

    // Find most recent pending/confirmed booking for this parent
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id, parent_id, child_id, class_type, amount_paid_pence')
      .eq('parent_id', profile.id)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return bookings || null
  } catch {
    return null
  }
}

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
    const schoolId = session.metadata?.school_id

    if (bookingId) {
      // Update booking status and store stripe_session_id for invoice retrieval.
      // Also persist the venue from checkout metadata when present.
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_session_id: session.id,
          ...(schoolId ? { school_id: schoolId } : {}),
        })
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
  } else if (event.type === 'invoice.payment_failed' || event.type === 'charge.failed') {
    try {
      const eventData = extractPaymentEventData(event)
      const booking = await findBookingByParentEmail(eventData.customerEmail)

      if (booking) {
        // Flag booking as payment failed
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'payment_failed' })
          .eq('id', booking.id)

        // Fetch child and parent for email
        const [{ data: child }, { data: parent }] = await Promise.all([
          supabaseAdmin.from('children').select('name').eq('id', booking.child_id).maybeSingle(),
          supabaseAdmin.from('profiles').select('email, full_name').eq('id', booking.parent_id).maybeSingle(),
        ])

        // Try to create billing portal session to allow card update
        let billingPortalUrl: string | null = null
        if (eventData.customerId && parent?.email) {
          try {
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: eventData.customerId,
              return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://confidance.vercel.app'}/dashboard`,
            })
            billingPortalUrl = portalSession.url
          } catch {
            // If billing portal fails, we'll send contact-us fallback in email
          }
        }

        // Send payment failed email
        if (child && parent) {
          await sendPaymentFailedEmail(
            booking,
            { name: child.name },
            { email: parent.email, full_name: parent.full_name },
            billingPortalUrl,
          )
        }

        // Audit log
        await auditLog(
          'webhook',
          'payment_failed_flagged',
          'booking',
          booking.id,
          { event_type: event.type, customer_email: eventData.customerEmail },
        )

        // Admin message log
        await logAdminMessage({
          sentBy: null,
          channel: 'email',
          audience: { bookingId: booking.id },
          subject: 'Payment issue with your Confidance booking',
          body: 'Payment failed notification sent',
          recipientCount: 1,
          resendId: null,
        })
      } else {
        // No matching booking found; log but don't error
        await logAdminMessage({
          sentBy: null,
          channel: 'email',
          audience: { event_type: event.type, customer_email: eventData.customerEmail },
          subject: 'Payment failure - no matching booking',
          body: `Stripe ${event.type} event received but no pending/confirmed booking found for customer email: ${eventData.customerEmail || 'unknown'}`,
          recipientCount: 0,
          resendId: null,
        })
      }
    } catch (err) {
      // Defensive: log error but return 200 so Stripe doesn't retry forever
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      await logAdminMessage({
        sentBy: null,
        channel: 'email',
        audience: { event_type: event.type },
        subject: 'Error processing payment failure event',
        body: `Failed to process Stripe ${event.type}: ${errorMsg}`,
        recipientCount: 0,
        resendId: null,
      })
    }
  }

  return NextResponse.json({ received: true })
}
