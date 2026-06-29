import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWaitlistToken } from '@/lib/waitlist'
import { checkCapacity, type CapacitySlot } from '@/lib/capacity'
import { getDefaultSchoolId } from '@/lib/schools'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

function getTokenSecret(): string {
  const fromEnv = process.env.WAITLIST_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!fromEnv) throw new Error('Missing token secret (WAITLIST_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY)')
  return fromEnv
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 },
      )
    }

    const secret = getTokenSecret()
    const verification = verifyWaitlistToken(token, secret)

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid or tampered token' },
        { status: 410 },
      )
    }

    const { id: waitlistId, expiresAtIso } = verification

    const { data: waitlistRow, error: fetchError } = await supabaseAdmin
      .from('waitlists')
      .select('*')
      .eq('id', waitlistId)
      .single()

    if (fetchError || !waitlistRow) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 410 },
      )
    }

    if (waitlistRow.notified_at === null) {
      return NextResponse.json(
        { error: 'This offer has not been activated yet' },
        { status: 410 },
      )
    }

    if (new Date(expiresAtIso) < new Date()) {
      return NextResponse.json(
        { error: 'This offer has expired' },
        { status: 410 },
      )
    }

    const slot: CapacitySlot = {
      classType: waitlistRow.class_type,
      termName: waitlistRow.term_name,
      termYear: waitlistRow.term_year,
    }

    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('status, class_type, term_name, term_year')

    const capacity = checkCapacity(bookings || [], slot)

    if (capacity.full) {
      return NextResponse.json(
        { error: 'Class is now full. Please try again later.' },
        { status: 409 },
      )
    }

    const bookingId = crypto.randomUUID()
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        id: bookingId,
        parent_id: waitlistRow.parent_id,
        child_id: waitlistRow.child_id,
        class_type: waitlistRow.class_type,
        booking_type: 'trial',
        status: 'confirmed',
        term_name: waitlistRow.term_name,
        term_year: waitlistRow.term_year,
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

    const { error: deleteError } = await supabaseAdmin
      .from('waitlists')
      .delete()
      .eq('id', waitlistId)

    if (deleteError) {
      return NextResponse.json(
        { error: `Booking created but failed to remove waitlist entry: ${deleteError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.redirect(`/dashboard?bookingConfirmed=${bookingId}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
