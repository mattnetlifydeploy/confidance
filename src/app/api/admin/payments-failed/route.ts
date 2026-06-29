import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentFailedEmail } from '@/lib/email-payment-failed'
import { auditLog } from '@/lib/audit-log'
import { logAdminMessage } from '@/lib/admin-messages'
import { stripe } from '@/lib/stripe-server'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function requireAdmin(token: string): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) return null
    return user.id
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const adminId = await requireAdmin(token)

    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { bookingId, action } = await request.json()

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch current booking state
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, parent_id, child_id, class_type, amount_paid_pence, status')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (action === 'retry') {
      // Re-send payment failed email to parent
      const [{ data: child }, { data: parent }] = await Promise.all([
        supabase.from('children').select('name').eq('id', booking.child_id).maybeSingle(),
        supabase.from('profiles').select('email, full_name').eq('id', booking.parent_id).maybeSingle(),
      ])

      if (!child || !parent) {
        return NextResponse.json({ error: 'Child or parent not found' }, { status: 404 })
      }

      // Build billing portal URL if customer exists
      let billingPortalUrl: string | null = null
      if (stripe) {
        try {
          // Try to find customer by email (best-effort)
          const customers = await stripe.customers.list({ email: parent.email, limit: 1 })
          if (customers.data.length > 0) {
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: customers.data[0].id,
              return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://confidance.vercel.app'}/dashboard`,
            })
            billingPortalUrl = portalSession.url
          }
        } catch {
          // Fallback if billing portal fails
        }
      }

      await sendPaymentFailedEmail(
        booking,
        { name: child.name },
        { email: parent.email, full_name: parent.full_name },
        billingPortalUrl,
      )

      await auditLog(
        adminId,
        'payment_failed_retry_sent',
        'booking',
        bookingId,
        { admin_id: adminId },
      )

      await logAdminMessage({
        sentBy: adminId,
        channel: 'email',
        audience: { bookingId },
        subject: 'Payment issue with your Confidance booking',
        body: 'Payment failed notification resent by admin',
        recipientCount: 1,
        resendId: null,
      })

      return NextResponse.json({ success: true, action: 'retry' })
    } else if (action === 'cancel') {
      // Cancel the booking
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      await auditLog(
        adminId,
        'payment_failed_cancelled',
        'booking',
        bookingId,
        { admin_id: adminId, previous_status: booking.status },
      )

      return NextResponse.json({ success: true, action: 'cancel' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
