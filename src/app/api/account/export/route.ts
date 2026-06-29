import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { logAdminMessage } from '@/lib/admin-messages'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parentId = user.id

    // Gather parent profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', parentId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Gather children
    const { data: children } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('parent_id', parentId)

    // Gather bookings
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('parent_id', parentId)

    // Gather attendance for their children
    const childIds = children?.map((c) => c.id) ?? []
    const attendanceResponse = childIds.length > 0
      ? await supabaseAdmin
          .from('attendance')
          .select('*')
          .in('child_id', childIds)
      : { data: [] }
    const attendance = attendanceResponse.data

    // Gather waiver signatures
    const { data: waiverSignatures } = await supabaseAdmin
      .from('waiver_signatures')
      .select('*')
      .eq('parent_id', parentId)

    const exportData = {
      profile,
      children: children ?? [],
      bookings: bookings ?? [],
      attendance: attendance ?? [],
      waiverSignatures: waiverSignatures ?? [],
      exportedAt: new Date().toISOString(),
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const base64Content = Buffer.from(jsonContent).toString('base64')

    // Send email with attachment
    const resend = getResend()
    const emailRes = await resend.emails.send({
      from: FROM_ADDRESS,
      to: profile.email,
      subject: 'Your Confidance data export',
      html: `<p>Hi ${profile.full_name},</p><p>Your Confidance data export is attached. This includes your profile, children, bookings, attendance records, and waiver signatures.</p><p>If you have any questions, please contact us.</p>`,
      attachments: [
        {
          filename: 'confidance-my-data.json',
          content: base64Content,
        },
      ],
    })

    // Log the admin message
    const resendId = emailRes && 'id' in emailRes && typeof emailRes.id === 'string' ? emailRes.id : null
    await logAdminMessage({
      sentBy: null,
      channel: 'email',
      audience: { parent_id: parentId },
      subject: 'Your Confidance data export',
      body: `Data export sent to ${profile.email}`,
      recipientCount: 1,
      resendId,
    })

    return NextResponse.json(exportData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
