import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

// Stripe's expanded Checkout Session type is deeply nested and varies by
// expansion, so we read the few fields we need off a loose shape.
function pickInvoiceUrl(session: any): string | null {
  if (session.invoice?.hosted_invoice_url) {
    return session.invoice.hosted_invoice_url
  }
  if (session.payment_intent?.latest_charge?.receipt_url) {
    return session.payment_intent.latest_charge.receipt_url
  }
  return null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!stripe || !supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Verify Bearer token
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parentId = user.id

  const bookingId = (await params).id

  try {
    // Load booking; verify parent owns it
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('id, parent_id, stripe_session_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.parent_id !== parentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking has a stripe session id (paid booking)
    if (!booking.stripe_session_id) {
      return NextResponse.json(
        { error: 'No invoice available for this booking' },
        { status: 404 },
      )
    }

    // Retrieve the Stripe session with expanded invoice and payment intent
    const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id, {
      expand: ['invoice', 'payment_intent.latest_charge'],
    })

    // Pick the best available invoice URL
    const invoiceUrl = pickInvoiceUrl(session)
    if (!invoiceUrl) {
      return NextResponse.json(
        { error: 'Invoice URL not available' },
        { status: 404 },
      )
    }

    // Redirect to the invoice (307 temporary redirect to preserve method, but effectively becomes GET)
    return NextResponse.redirect(invoiceUrl, { status: 307 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve invoice' },
      { status: 500 },
    )
  }
}
