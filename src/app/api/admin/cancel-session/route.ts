import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auditLog } from '@/lib/audit-log'
import { selectNextToPromote, signWaitlistToken } from '@/lib/waitlist'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { logAdminMessage } from '@/lib/admin-messages'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

function getTokenSecret(): string {
  const fromEnv = process.env.WAITLIST_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!fromEnv) throw new Error('Missing token secret')
  return fromEnv
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 },
      )
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      )
    }

    // Parse request body
    const { sessionId, reason } = await request.json()

    if (!sessionId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, reason' },
        { status: 400 },
      )
    }

    // Step 1: Update the session record
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        cancelled: true,
        cancel_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update session: ${updateError.message}` },
        { status: 500 },
      )
    }

    // Step 2: Find all confirmed bookings for this session
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('child_id')
      .eq('session_id', sessionId)
      .eq('status', 'confirmed')

    if (bookingsError) {
      return NextResponse.json(
        { error: `Failed to fetch bookings: ${bookingsError.message}` },
        { status: 500 },
      )
    }

    // Step 3: Get full booking details for refund amounts
    const { data: fullBookings, error: fullBookingsError } = await supabase
      .from('bookings')
      .select('id, child_id, amount_paid_pence')
      .eq('session_id', sessionId)
      .eq('status', 'confirmed')

    if (fullBookingsError) {
      return NextResponse.json(
        { error: `Failed to fetch booking details: ${fullBookingsError.message}` },
        { status: 500 },
      )
    }

    // Step 4: Create session_credit records for each booking
    let creditsIssued = 0
    let totalRefundPence = 0

    if (fullBookings && fullBookings.length > 0) {
      const creditRecords = fullBookings.map((booking) => ({
        child_id: booking.child_id,
        session_id: sessionId,
        used: false,
        created_at: new Date().toISOString(),
      }))

      const { error: creditsError } = await supabase
        .from('session_credits')
        .insert(creditRecords)

      if (creditsError) {
        return NextResponse.json(
          {
            error: `Failed to create credits: ${creditsError.message}`,
          },
          { status: 500 },
        )
      }

      creditsIssued = fullBookings.length
      totalRefundPence = fullBookings.reduce((sum, b) => sum + b.amount_paid_pence, 0)
    }

    // Step 5: Audit log for session cancellation
    await auditLog(
      user.id,
      'session.cancelled',
      'session',
      sessionId,
      { reason, creditsIssued },
    )

    // Step 6: Audit log for refund processing (if credits issued)
    if (creditsIssued > 0) {
      await auditLog(
        user.id,
        'refund_processed',
        'session',
        sessionId,
        { amount: totalRefundPence, reason, creditsCount: creditsIssued },
      )
    }

    // Step 7: Waitlist promotion (wrapped defensively, failure does not block cancel)
    try {
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('class_type, term_name, term_year')
        .eq('id', sessionId)
        .single()

      if (sessionData) {
        const { data: waitlistRows } = await supabase
          .from('waitlists')
          .select('id, position, notified_at, expires_at')
          .eq('class_type', sessionData.class_type)
          .eq('term_name', sessionData.term_name)
          .eq('term_year', sessionData.term_year)
          .order('position', { ascending: true })

        const toPromote = selectNextToPromote(waitlistRows || [])

        if (toPromote) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
          const expiresAtIso = expiresAt.toISOString()

          const { error: updateError } = await supabase
            .from('waitlists')
            .update({
              notified_at: new Date().toISOString(),
              expires_at: expiresAtIso,
            })
            .eq('id', toPromote.id)

          if (!updateError) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.confidancecommunity.co.uk'
            const confirmToken = signWaitlistToken(toPromote.id, expiresAtIso, getTokenSecret())
            const confirmLink = `${siteUrl}/api/waitlist/confirm?token=${encodeURIComponent(confirmToken)}`

            const { data: parent } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', toPromote.id)
              .single()

            if (parent?.email) {
              const resend = getResend()
              await resend.emails.send({
                from: FROM_ADDRESS,
                to: parent.email,
                subject: 'A space opened at Confidance',
                html: `<p>Hi ${parent.full_name},</p>
<p>Great news! A space has opened in the class you're waiting for.</p>
<p><a href="${confirmLink}">Click here to confirm your booking</a></p>
<p>You have 24 hours to confirm. If you don't, we'll move to the next person on the waitlist.</p>
<p>Thanks,<br/>Confidance</p>`,
              })

              await logAdminMessage({
                sentBy: null,
                channel: 'email',
                audience: { waitlist_id: toPromote.id },
                subject: 'A space opened at Confidance',
                body: 'A space has opened. You have 24 hours to confirm your booking.',
                recipientCount: 1,
                resendId: null,
              })
            }

            await auditLog(
              user.id,
              'waitlist_promoted',
              'waitlist',
              toPromote.id,
              { class_type: sessionData.class_type, term_name: sessionData.term_name, term_year: sessionData.term_year },
            )
          }
        }
      }
    } catch (promotionError) {
      console.error('Waitlist promotion error (non-blocking):', promotionError)
    }

    // Step 8: Return success response
    return NextResponse.json({
      success: true,
      creditsIssued,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
