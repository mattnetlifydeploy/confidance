import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const body = await req.json()
  const { sessionId, reason, adminId } = body

  if (!sessionId || !adminId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify admin
  const { data: admin } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', adminId)
    .single()

  if (!admin?.is_admin) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  // Get session details
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.cancelled) {
    return NextResponse.json({ error: 'Session already cancelled' }, { status: 400 })
  }

  // Mark session as cancelled
  await supabaseAdmin
    .from('sessions')
    .update({ cancelled: true, cancel_reason: reason || 'Cancelled by teacher' })
    .eq('id', sessionId)

  // Find all confirmed bookings for this session
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('id, child_id, parent_id, class_type, booking_type')
    .eq('session_id', sessionId)
    .eq('status', 'confirmed')

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ success: true, creditsIssued: 0 })
  }

  // Issue credits for paid bookings (not trials)
  const creditsToInsert = bookings
    .filter((b) => b.booking_type !== 'trial')
    .map((b) => ({
      child_id: b.child_id,
      parent_id: b.parent_id,
      class_type: b.class_type,
      reason: reason || 'Session cancelled by teacher',
    }))

  if (creditsToInsert.length > 0) {
    await supabaseAdmin.from('session_credits').insert(creditsToInsert)
  }

  // Update booking statuses
  for (const b of bookings) {
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', b.id)
  }

  return NextResponse.json({ success: true, creditsIssued: creditsToInsert.length })
}
