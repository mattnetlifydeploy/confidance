import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCronSecret } from '@/lib/cron-auth'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { logAdminMessage } from '@/lib/admin-messages'
import { selectRemindersForDate, formatReminderEmail, type ReminderBooking } from '@/lib/booking-reminders'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function runJob(request: NextRequest) {
  try {
    const auth = requireCronSecret(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const now = new Date()
    now.setDate(now.getDate() + 1)
    const targetDate = now.toISOString().slice(0, 10)

    const { data: bookings, error: bErr } = await supabase
      .from('bookings')
      .select('id, booking_type, status, term_name, term_year, class_type, parent_id, child_id')

    if (bErr || !bookings) {
      return NextResponse.json(
        { error: `Failed to fetch bookings: ${bErr?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    const candidates = selectRemindersForDate(targetDate, bookings as ReminderBooking[])

    if (candidates.length === 0) {
      return NextResponse.json({ sent: 0, targetDate })
    }

    const childIds = Array.from(new Set(candidates.map((b) => b.child_id)))
    const parentIds = Array.from(new Set(candidates.map((b) => b.parent_id)))

    const { data: children, error: cErr } = await supabase
      .from('children')
      .select('id, name')
      .in('id', childIds)

    if (cErr || !children) {
      return NextResponse.json(
        { error: `Failed to fetch children: ${cErr?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', parentIds)

    if (pErr || !profiles) {
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${pErr?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    const childMap = new Map(children.map((c) => [c.id, { name: c.name }]))
    const profileMap = new Map(profiles.map((p) => [p.id, { email: p.email, full_name: p.full_name }]))

    const emailList: Array<{
      from: string
      to: string
      subject: string
      text: string
    }> = []

    for (const booking of candidates) {
      const child = childMap.get(booking.child_id)
      const parent = profileMap.get(booking.parent_id)

      if (!child || !parent?.email) {
        continue
      }

      const { subject, body } = formatReminderEmail(booking, child, parent)

      emailList.push({
        from: FROM_ADDRESS,
        to: parent.email,
        subject,
        text: body,
      })
    }

    if (emailList.length === 0) {
      return NextResponse.json({ sent: 0, candidates: candidates.length, targetDate })
    }

    const resend = getResend()

    const result = await resend.batch.send(emailList)

    if (result.error) {
      return NextResponse.json({ error: `Resend error: ${result.error.message}` }, { status: 500 })
    }

    const sent = result.data?.data?.length ?? 0
    if (sent < emailList.length) {
      return NextResponse.json(
        { error: `Partial send: ${sent}/${emailList.length}` },
        { status: 500 },
      )
    }

    // Log summary row with first resend id for batch tracking
    const firstResendId = result.data?.data?.[0]?.id || null
    await logAdminMessage({
      sentBy: null,
      channel: 'email',
      audience: { type: 'booking_reminders', targetDate },
      subject: 'Booking Reminder',
      body: 'Booking reminder emails',
      recipientCount: sent,
      resendId: firstResendId,
    })

    return NextResponse.json({ sent, candidates: candidates.length, targetDate })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Internal server error: ${message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return runJob(request)
}

export async function POST(request: NextRequest) {
  return runJob(request)
}
