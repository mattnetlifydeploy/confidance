import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCronSecret } from '@/lib/cron-auth'
import { getCurrentTerm } from '@/lib/constants'
import { getClassesMap } from '@/lib/classes'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { logAdminMessage } from '@/lib/admin-messages'
import { selectAgeUpCandidates, type AgeUpBooking, type AgeUpChild } from '@/lib/age-up'

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
    const classMap = await getClassesMap()

    const { data: bookings, error: bErr } = await supabase
      .from('bookings')
      .select('parent_id, child_id, class_type, status, term_name, term_year')
      .eq('status', 'confirmed')
      .eq('term_name', current.name)
      .eq('term_year', current.year)

    if (bErr || !bookings) {
      return NextResponse.json(
        { error: `Failed to fetch bookings: ${bErr?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    if (bookings.length === 0) {
      return NextResponse.json({ sent: 0, candidates: 0 })
    }

    const childIds = Array.from(new Set(bookings.map((b) => b.child_id)))

    const { data: children, error: cErr } = await supabase
      .from('children')
      .select('id, parent_id, name, age')
      .in('id', childIds)

    if (cErr || !children) {
      return NextResponse.json(
        { error: `Failed to fetch children: ${cErr?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    const candidates = selectAgeUpCandidates(bookings as AgeUpBooking[], children as AgeUpChild[], current, classMap)

    if (candidates.length === 0) {
      return NextResponse.json({ sent: 0, candidates: 0 })
    }

    const parentIds = Array.from(new Set(candidates.map((c) => c.parent_id)))

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', parentIds)

    if (profileError || !profiles) {
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profileError?.message ?? 'unknown error'}` },
        { status: 500 },
      )
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]))

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://confidance.co.uk'

    const resend = getResend()

    const emailList: Array<{
      from: string
      to: string
      subject: string
      text: string
    }> = []

    for (const candidate of candidates) {
      const profile = profileMap.get(candidate.parent_id)
      if (!profile?.email) continue

      const parentName = profile.full_name || 'there'
      const currentMeta = classMap[candidate.current_class]
      const currentClassName = currentMeta?.name ?? candidate.current_class
      const currentAgeMax = currentMeta?.ageMax ?? 0

      let subject: string
      let body: string

      const suggestedMeta = candidate.suggested_class ? classMap[candidate.suggested_class] : null
      if (suggestedMeta) {
        const suggestedClassName = suggestedMeta.name
        const suggestedAges = suggestedMeta.ages

        subject = `${candidate.child_name} may be ready for ${suggestedClassName}`
        body = `Hi ${parentName},

Just a friendly heads up: ${candidate.child_name} is now ${candidate.child_age} which is over the ${currentAgeMax} year cap for ${currentClassName}. They might love ${suggestedClassName} (${suggestedAges}).

Have a look here when you're ready: ${baseUrl}/

Anything to chat through, just reply.

Confidance`
      } else {
        subject = `${candidate.child_name} has outgrown ${currentClassName}`
        body = `Hi ${parentName},

Heads up: ${candidate.child_name} is now ${candidate.child_age} which is over the ${currentAgeMax} year cap for ${currentClassName}. We don't have an older class yet, but we'll let you know as soon as we do.

Confidance`
      }

      emailList.push({
        from: FROM_ADDRESS,
        to: profile.email,
        subject,
        text: body,
      })
    }

    if (emailList.length === 0) {
      return NextResponse.json({ sent: 0, candidates: candidates.length })
    }

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
      audience: { type: 'age_up' },
      subject: 'Age-up notification',
      body: 'Age-up notification email',
      recipientCount: sent,
      resendId: firstResendId,
    })

    return NextResponse.json({ sent, candidates: candidates.length })
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
