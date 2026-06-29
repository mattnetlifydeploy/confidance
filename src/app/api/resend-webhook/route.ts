import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import { mergeDeliveryStatus } from '@/lib/admin-messages'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'RESEND_WEBHOOK_SECRET not configured' }, { status: 500 })
  }

  try {
    const payload = await request.text()
    const headers = {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    }

    const wh = new Webhook(secret)
    let event
    try {
      event = wh.verify(payload, headers) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const eventType = event.type as string
    const data = event.data as Record<string, unknown>

    if (!['email.delivered', 'email.bounced', 'email.complained'].includes(eventType)) {
      return NextResponse.json({ status: 'ok' })
    }

    const emailId = data.email_id as string | undefined
    if (!emailId) {
      return NextResponse.json({ status: 'ok' })
    }

    const now = new Date().toISOString()
    const simpleEventType = eventType.split('.')[1]

    const { data: currentRow, error: fetchError } = await supabase
      .from('admin_messages_log')
      .select('delivery_status')
      .eq('resend_id', emailId)
      .single()

    if (fetchError || !currentRow) {
      return NextResponse.json({ status: 'ok' })
    }

    const currentStatus = (currentRow.delivery_status as Record<string, unknown>) || {}
    const updatedStatus = mergeDeliveryStatus(currentStatus, simpleEventType, now)

    const { error: updateError } = await supabase
      .from('admin_messages_log')
      .update({ delivery_status: updatedStatus })
      .eq('resend_id', emailId)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update delivery status: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
