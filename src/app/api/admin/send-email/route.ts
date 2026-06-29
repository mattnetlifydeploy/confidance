import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { auditLog } from '@/lib/audit-log'
import { logAdminMessage } from '@/lib/admin-messages'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const sendEmailSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  audience: z.string().min(1).max(120),
})

type ParsedAudience =
  | { type: 'all' }
  | { type: 'class', classType: string }
  | { type: 'term', termName: string, termYear: number }

function parseAudience(audience: string): ParsedAudience | null {
  if (audience === 'all') {
    return { type: 'all' }
  }

  if (audience.startsWith('class:')) {
    const classType = audience.slice(6)
    return { type: 'class', classType }
  }

  if (audience.startsWith('term:')) {
    const termStr = audience.slice(5)
    const parts = termStr.split('-')
    if (parts.length < 2) return null
    const termYear = parseInt(parts[parts.length - 1])
    if (isNaN(termYear)) return null
    const termName = parts.slice(0, -1).join('-')
    return { type: 'term', termName, termYear }
  }

  return null
}

async function getEmailsForAudience(parsed: ParsedAudience): Promise<string[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('parent_id, class_type, term_name, term_year')
    .eq('status', 'confirmed')

  if (error || !bookings) return []

  let filtered = bookings

  if (parsed.type === 'class') {
    filtered = filtered.filter(b => b.class_type === parsed.classType)
  } else if (parsed.type === 'term') {
    filtered = filtered.filter(b => b.term_name === parsed.termName && b.term_year === parsed.termYear)
  }

  const parentIds = new Set(filtered.map(b => b.parent_id))

  if (parentIds.size === 0) return []

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', Array.from(parentIds))

  if (profileError || !profiles) return []

  return Array.from(new Set(profiles.map(p => p.email).filter((e): e is string => Boolean(e))))
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = sendEmailSchema.parse(body)

    const parsed = parseAudience(validated.audience)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid audience' }, { status: 400 })
    }

    const emails = await getEmailsForAudience(parsed)
    if (emails.length === 0) {
      return NextResponse.json({ error: 'No recipients in audience' }, { status: 400 })
    }

    const resend = getResend()

    if (emails.length === 1) {
      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to: emails[0],
        subject: validated.subject,
        text: validated.body,
      })
      if (result.error) {
        return NextResponse.json(
          { error: `Failed to send emails: ${result.error.message}` },
          { status: 500 },
        )
      }
      const resendId = result.data?.id || null
      const audienceObj: Record<string, unknown> = { parsedType: parsed.type }
      if (parsed.type === 'class') {
        audienceObj.classType = (parsed as { type: string; classType: string }).classType
      } else if (parsed.type === 'term') {
        audienceObj.termName = (parsed as { type: string; termName: string }).termName
        audienceObj.termYear = (parsed as { type: string; termYear: number }).termYear
      }
      await logAdminMessage({
        sentBy: auth.userId,
        channel: 'email',
        audience: audienceObj,
        subject: validated.subject,
        body: validated.body,
        recipientCount: 1,
        resendId,
      })
      await auditLog(
        auth.userId,
        'email.sent',
        'email',
        null,
        { subject: validated.subject, audience: validated.audience, recipientCount: 1 },
      )
      return NextResponse.json({ sent: 1 })
    }

    const result = await resend.batch.send(
      emails.map(email => ({
        from: FROM_ADDRESS,
        to: email,
        subject: validated.subject,
        text: validated.body,
      })),
    )

    if (result.error) {
      return NextResponse.json(
        { error: `Failed to send emails: ${result.error.message}` },
        { status: 500 },
      )
    }

    // Report the actual count Resend confirmed accepted, not the requested count.
    const sent = result.data?.data?.length ?? 0
    if (sent < emails.length) {
      return NextResponse.json(
        { error: `Partial send failure: ${sent} of ${emails.length} accepted by Resend` },
        { status: 500 },
      )
    }

    // Log one summary row with first resend id for batch tracking
    const firstResendId = result.data?.data?.[0]?.id || null
    const batchAudienceObj: Record<string, unknown> = { parsedType: parsed.type }
    if (parsed.type === 'class') {
      batchAudienceObj.classType = (parsed as { type: string; classType: string }).classType
    } else if (parsed.type === 'term') {
      batchAudienceObj.termName = (parsed as { type: string; termName: string }).termName
      batchAudienceObj.termYear = (parsed as { type: string; termYear: number }).termYear
    }
    await logAdminMessage({
      sentBy: auth.userId,
      channel: 'email',
      audience: batchAudienceObj,
      subject: validated.subject,
      body: validated.body,
      recipientCount: sent,
      resendId: firstResendId,
    })

    await auditLog(
      auth.userId,
      'email.sent',
      'email',
      null,
      { subject: validated.subject, audience: validated.audience, recipientCount: sent },
    )
    return NextResponse.json({ sent })
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
