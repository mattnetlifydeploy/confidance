import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// created_by / created_at are immutable: never patched here.
const updateWalkInSchema = z.object({
  parentName: z.string().min(1).max(120).optional(),
  parentPhone: z.string().max(40).nullable().optional(),
  parentEmail: z.string().email().max(200).nullable().optional(),
  childName: z.string().min(1).max(120).optional(),
  childAge: z.number().int().min(0).max(18).nullable().optional(),
  classType: z.enum(['baby-boogie', 'confidance-kids']).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amountPaidPence: z.number().int().min(0).max(100000).nullable().optional(),
  paymentMethod: z.enum(['cash', 'card', 'other']).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateWalkInSchema.parse(body)

    const patch: Record<string, unknown> = {}
    if (validated.parentName !== undefined) patch.parent_name = validated.parentName
    if (validated.parentPhone !== undefined) patch.parent_phone = validated.parentPhone || null
    if (validated.parentEmail !== undefined) patch.parent_email = validated.parentEmail || null
    if (validated.childName !== undefined) patch.child_name = validated.childName
    if (validated.childAge !== undefined) patch.child_age = validated.childAge
    if (validated.classType !== undefined) patch.class_type = validated.classType
    if (validated.sessionDate !== undefined) patch.session_date = validated.sessionDate
    if (validated.amountPaidPence !== undefined) patch.amount_paid_pence = validated.amountPaidPence
    if (validated.paymentMethod !== undefined) patch.payment_method = validated.paymentMethod || null
    if (validated.notes !== undefined) patch.notes = validated.notes || null

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabase.from('walk_ins').update(patch).eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to update walk-in: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'walkin.updated', 'walk_in', id, {
      fields: Object.keys(patch),
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    const { error } = await supabase.from('walk_ins').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete walk-in: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'walkin.deleted', 'walk_in', id, {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
