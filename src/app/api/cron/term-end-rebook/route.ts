import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCronSecret } from '@/lib/cron-auth'
import { getCurrentTerm, getNextTerm, NUDGE_DAYS_BEFORE_TERM_END } from '@/lib/constants'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { isWithinTermEndWindow, selectRebookParentIds, type Booking } from '@/lib/term-end-rebook'

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

    const current = getCurrentTerm()
    const next = getNextTerm()

    if (!next) {
      return NextResponse.json({ skipped: 'no next term configured' })
    }

    const today = new Date().toISOString().slice(0, 10)
    if (!isWithinTermEndWindow(today, current.endDate, NUDGE_DAYS_BEFORE_TERM_END)) {
      return NextResponse.json({
        skipped: 'outside nudge window',
        today,
        termEnd: current.endDate,
      })
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('parent_id, booking_type, status, term_name, term_year')
      .eq('status', 'confirmed')
      .eq('booking_type', 'term')
      .in('term_name', [current.name, next.name])
      .in('term_year', [current.year, next.year])

    if (error || !data) {
      return NextResponse.json({ error: `Failed to fetch bookings: ${error?.message ?? 'unknown error'}` }, { status: 500 })
    }

    const targetParentIds = selectRebookParentIds(data as Booking[], current, next)

    if (targetParentIds.length === 0) {
      return NextResponse.json({ sent: 0, candidates: 0 })
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', targetParentIds)

    if (profileError || !profiles) {
      return NextResponse.json({ error: `Failed to fetch profiles: ${profileError?.message ?? 'unknown error'}` }, { status: 500 })
    }

    const recipients = profiles.filter((p): p is typeof profiles[0] => Boolean(p.email))

    if (recipients.length === 0) {
      return NextResponse.json({ sent: 0, candidates: targetParentIds.length })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://confidance.co.uk'

    const buildEmailBody = (fullName: string | null) => {
      const name = fullName || 'there'
      return `Hi ${name},

Our ${current.name} Term wraps up on ${current.endDate}. Confidance comes back for the ${next.name} Term starting ${next.displayStart}.

Spaces fill quickly. Reserve your child's spot here: ${baseUrl}/

Any questions, just reply to this email.

Confidance`
    }

    const subject = `Book your child in for ${next.name} Term ${next.year}`

    const resend = getResend()

    const result = await resend.batch.send(
      recipients.map((r) => ({
        from: FROM_ADDRESS,
        to: r.email,
        subject,
        text: buildEmailBody(r.full_name),
      })),
    )

    if (result.error) {
      return NextResponse.json({ error: `Resend error: ${result.error.message}` }, { status: 500 })
    }

    const sent = result.data?.data?.length ?? 0
    if (sent < recipients.length) {
      return NextResponse.json(
        { error: `Partial send: ${sent}/${recipients.length}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ sent, candidates: targetParentIds.length, term: `${next.name}-${next.year}` })
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
