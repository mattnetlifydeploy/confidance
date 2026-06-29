import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTermSessions } from '@/lib/term-sessions'
import { checkCapacity, type CapacitySlot } from '@/lib/capacity'
import { TERMS, getCurrentTerm, getNextTerm, type ClassType } from '@/lib/constants'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(
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
      .select('id, parent_id, class_type, booking_type, session_date, term_name, term_year, status')
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

    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const current = getCurrentTerm()
    const next = getNextTerm()

    const availableSessions: Array<{ date: string; available: boolean }> = []

    for (const term of [current, next].filter(Boolean) as typeof TERMS) {
      const sessionDates = await getTermSessions(term, booking.class_type as ClassType)

      const futureDates = sessionDates.filter((d) => d >= tomorrow && d !== booking.session_date)

      const { data: allBookings } = await supabase
        .from('bookings')
        .select('status, class_type, term_name, term_year')

      const slot: CapacitySlot = {
        classType: booking.class_type,
        termName: term.name,
        termYear: term.year,
      }

      for (const date of futureDates) {
        const capacity = checkCapacity(
          (allBookings || []).map((b) => ({
            status: b.status,
            class_type: b.class_type,
            term_name: b.term_name,
            term_year: b.term_year,
          })),
          slot,
        )

        availableSessions.push({
          date,
          available: !capacity.full,
        })
      }
    }

    return NextResponse.json({
      options: availableSessions.sort((a, b) => a.date.localeCompare(b.date)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
