import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { refundPolicy } from '@/lib/reschedule'
import { checkCapacity, type CapacitySlot } from '@/lib/capacity'
import { stripe } from '@/lib/stripe-server'
import { auditLog } from '@/lib/audit-log'
import { logAdminMessage } from '@/lib/admin-messages'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const RescheduleBody = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const bookingId = (await params).id
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 },
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select(
        'id, parent_id, class_type, booking_type, session_date, term_name, term_year, status, amount_paid_pence, stripe_session_id, child_id',
      )
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.parent_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.booking_type !== 'single' || booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only single-session confirmed bookings can be rescheduled' },
        { status: 400 },
      )
    }

    const body = RescheduleBody.parse(await request.json())
    const newDate = body.newDate

    const slot: CapacitySlot = {
      classType: booking.class_type,
      termName: booking.term_name,
      termYear: booking.term_year ?? 0,
    }

    const { data: allBookings } = await supabase
      .from('bookings')
      .select('status, class_type, term_name, term_year')

    const capacity = checkCapacity(
      (allBookings || []).map((b) => ({
        status: b.status,
        class_type: b.class_type,
        term_name: b.term_name,
        term_year: b.term_year,
      })),
      slot,
    )

    if (capacity.full) {
      return NextResponse.json(
        { error: 'Class full for the new date' },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()
    const policy = refundPolicy(booking.session_date, now)

    if (policy === 'full_refund' && booking.stripe_session_id && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)
        if (session.payment_intent) {
          const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent.id

          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          })
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        await logAdminMessage({
          sentBy: null,
          channel: 'email',
          audience: { booking_id: bookingId },
          subject: 'Stripe refund failed for reschedule',
          body: `Failed to issue full refund for booking ${bookingId}: ${errMsg}`,
          recipientCount: 0,
          resendId: null,
        })
      }
    } else if (policy === 'no_refund_credit') {
      const { error: creditError } = await supabase
        .from('session_credits')
        .insert({
          child_id: booking.child_id,
          booking_id: bookingId,
          created_at: new Date().toISOString(),
          used: false,
        })

      if (creditError) {
        return NextResponse.json(
          { error: `Failed to issue credit: ${creditError.message}` },
          { status: 500 },
        )
      }
    }

    const originalDate = booking.session_date

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        session_date: newDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update booking: ${updateError.message}` },
        { status: 500 },
      )
    }

    await auditLog(
      user.id,
      'booking_rescheduled',
      'booking',
      bookingId,
      {
        from: originalDate,
        to: newDate,
        policy,
      },
    )

    return NextResponse.json({
      ok: true,
      policy,
      newDate,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
