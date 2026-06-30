import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Admin booking status transitions. cancelled / refunded are tracking states:
// no Stripe reversal happens here (the booking row stores no payment intent).
// Cancelled / refunded free the slot for capacity (see ACTIVE_BOOKING_STATUSES).
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'refunded']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateBookingSchema.parse(body)

    const { error } = await supabase
      .from('bookings')
      .update({ status: validated.status })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to update booking: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'booking.status_changed', 'booking', id, {
      status: validated.status,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || []
      const firstIssue = issues[0]
      const message = firstIssue ? firstIssue.message : 'Validation error'
      return NextResponse.json(
        { error: `Validation error: ${message}` },
        { status: 400 },
      )
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
