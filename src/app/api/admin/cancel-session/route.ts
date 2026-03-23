import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 },
      )
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      )
    }

    // Parse request body
    const { sessionId, reason } = await request.json()

    if (!sessionId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, reason' },
        { status: 400 },
      )
    }

    // Step 1: Update the session record
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        cancelled: true,
        cancel_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update session: ${updateError.message}` },
        { status: 500 },
      )
    }

    // Step 2: Find all confirmed bookings for this session
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('child_id')
      .eq('session_id', sessionId)
      .eq('status', 'confirmed')

    if (bookingsError) {
      return NextResponse.json(
        { error: `Failed to fetch bookings: ${bookingsError.message}` },
        { status: 500 },
      )
    }

    // Step 3: Create session_credit records for each booking
    let creditsIssued = 0

    if (bookings && bookings.length > 0) {
      const creditRecords = bookings.map((booking) => ({
        child_id: booking.child_id,
        session_id: sessionId,
        used: false,
        created_at: new Date().toISOString(),
      }))

      const { error: creditsError } = await supabase
        .from('session_credits')
        .insert(creditRecords)

      if (creditsError) {
        return NextResponse.json(
          {
            error: `Failed to create credits: ${creditsError.message}`,
          },
          { status: 500 },
        )
      }

      creditsIssued = bookings.length
    }

    // Step 4: Return success response
    return NextResponse.json({
      success: true,
      creditsIssued,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
