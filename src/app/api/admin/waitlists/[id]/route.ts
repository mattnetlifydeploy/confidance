import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { checkCapacity, type CapacitySlot } from '@/lib/capacity'
import { getDefaultSchoolId } from '@/lib/schools'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// POST = promote a waitlist entry straight to a confirmed booking.
// Mirrors the public /api/waitlist/confirm flow (trial booking, empty emergency
// fields, default venue + school), but is an explicit admin override.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    const { data: row, error: fetchError } = await supabase
      .from('waitlists')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    const slot: CapacitySlot = {
      classType: row.class_type,
      termName: row.term_name,
      termYear: row.term_year,
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, class_type, term_name, term_year')

    const capacity = checkCapacity(bookings || [], slot)
    if (capacity.full) {
      return NextResponse.json(
        { error: 'Class is full. Cancel a booking before promoting.' },
        { status: 409 },
      )
    }

    const bookingId = crypto.randomUUID()
    const { error: bookingError } = await supabase.from('bookings').insert({
      id: bookingId,
      parent_id: row.parent_id,
      child_id: row.child_id,
      class_type: row.class_type,
      booking_type: 'trial',
      status: 'confirmed',
      term_name: row.term_name,
      term_year: row.term_year,
      emergency_contact: '',
      emergency_phone: '',
      location: 'Grove Neighbourhood Centre, 7 Bradmore Park Road, Hammersmith, W6 0DT',
      school_id: await getDefaultSchoolId(),
    })

    if (bookingError) {
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message}` },
        { status: 500 },
      )
    }

    const { error: deleteError } = await supabase.from('waitlists').delete().eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: `Booking created but failed to remove waitlist entry: ${deleteError.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'waitlist.promoted', 'waitlist', id, {
      booking_id: bookingId,
      class_type: row.class_type,
      term_name: row.term_name,
      term_year: row.term_year,
    })

    return NextResponse.json({ ok: true, bookingId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}

// DELETE = remove / expire a waitlist entry (takes them off the list).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    const { error } = await supabase.from('waitlists').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to remove waitlist entry: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'waitlist.removed', 'waitlist', id, {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
