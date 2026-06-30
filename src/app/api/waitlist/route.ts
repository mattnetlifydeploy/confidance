import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { nextPosition } from '@/lib/waitlist'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { logAdminMessage } from '@/lib/admin-messages'
import { getClassesMap } from '@/lib/classes'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const waitlistSchema = z.object({
  child_id: z.string().uuid(),
  class_type: z.string(),
  term_name: z.string().optional(),
  term_year: z.number().optional(),
  session_date: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 },
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = waitlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const { child_id, class_type, term_name, term_year, session_date } = parsed.data

    const { data: existingRows } = await supabaseAdmin
      .from('waitlists')
      .select('position')
      .eq('class_type', class_type)
      .eq('term_name', term_name || null)
      .eq('term_year', term_year || null)
      .eq('session_date', session_date || null)

    const position = nextPosition(
      (existingRows || []).map((r: { position: number }) => ({ id: '', position: r.position, notified_at: null, expires_at: null }))
    )

    const { error: insertError } = await supabaseAdmin
      .from('waitlists')
      .insert({
        parent_id: user.id,
        child_id,
        class_type,
        term_name: term_name || null,
        term_year: term_year || null,
        session_date: session_date || null,
        position,
      })

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to join waitlist: ${insertError.message}` },
        { status: 500 },
      )
    }

    const { data: parent } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    const { data: child } = await supabaseAdmin
      .from('children')
      .select('name')
      .eq('id', child_id)
      .single()

    const classes = await getClassesMap()
    const className = classes[class_type]?.name || class_type

    if (parent?.email) {
      const resend = getResend()
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: parent.email,
        subject: 'You\'re on the Confidance waitlist',
        html: `<p>Hi ${parent.full_name},</p>
<p>You're number ${position} on the waitlist for ${className} (child: ${child?.name}). We'll email you if a space opens.</p>
<p>Thanks,<br/>Confidance</p>`,
      })

      await logAdminMessage({
        sentBy: null,
        channel: 'email',
        audience: { parent_id: user.id, child_id },
        subject: 'You\'re on the Confidance waitlist',
        body: `You're number ${position} on the waitlist for ${className} (child: ${child?.name}). We'll email you if a space opens.`,
        recipientCount: 1,
        resendId: null,
      })
    }

    return NextResponse.json({ position })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
