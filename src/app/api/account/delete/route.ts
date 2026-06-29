import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { auditLog } from '@/lib/audit-log'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

const deleteAccountSchema = z.object({
  email: z.string().email(),
})

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
    const body = await request.json()
    const validated = deleteAccountSchema.parse(body)

    // Load parent profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', parentId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify email matches (case-insensitive)
    if (profile.email.toLowerCase() !== validated.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match account' },
        { status: 400 },
      )
    }

    // 1. Cancel active bookings
    const { data: activeBookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('parent_id', parentId)
      .in('status', ['pending', 'confirmed'])

    if (activeBookings && activeBookings.length > 0) {
      for (const booking of activeBookings) {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', booking.id)
      }
    }

    // 2. Soft-delete and anonymise profile
    const now = new Date().toISOString()
    const deletedEmail = `deleted-${parentId}@example.invalid`

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        deleted_at: now,
        email: deletedEmail,
        full_name: 'Deleted User',
        phone: null,
      })
      .eq('id', parentId)

    if (updateProfileError) {
      return NextResponse.json(
        { error: `Failed to delete profile: ${updateProfileError.message}` },
        { status: 500 },
      )
    }

    // Anonymise children
    const { data: children } = await supabaseAdmin
      .from('children')
      .select('id')
      .eq('parent_id', parentId)

    if (children && children.length > 0) {
      for (const child of children) {
        await supabaseAdmin
          .from('children')
          .update({ name: 'Deleted Child' })
          .eq('id', child.id)
      }
    }

    // 3. Revoke auth user (defensively)
    try {
      await supabaseAdmin.auth.admin.deleteUser(parentId)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      // Log but do not fail; soft-delete already succeeded
      await auditLog(parentId, 'account_deletion_auth_failed', 'auth_user', parentId, {
        error: errorMsg,
      })
    }

    // Audit log
    await auditLog(parentId, 'account_deleted', 'profile', parentId, {
      bookingsCancelled: activeBookings?.length ?? 0,
      childrenAnonymised: children?.length ?? 0,
    })

    return NextResponse.json({ ok: true })
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
