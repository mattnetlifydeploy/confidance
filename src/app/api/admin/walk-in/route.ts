import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const walkInSchema = z.object({
  parentName: z.string().min(1).max(120),
  parentPhone: z.string().max(40).optional().nullable(),
  parentEmail: z.string().email().max(200).optional().nullable(),
  childName: z.string().min(1).max(120),
  childAge: z.number().int().min(0).max(18).optional().nullable(),
  classType: z.enum(['baby-boogie', 'confidance-kids']),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountPaidPence: z.number().int().min(0).max(100000).optional().nullable(),
  paymentMethod: z.enum(['cash', 'card', 'other']).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).transform((data) => ({
  ...data,
  parentPhone: data.parentPhone === '' || data.parentPhone === null ? null : data.parentPhone,
  parentEmail: data.parentEmail === '' || data.parentEmail === null ? null : data.parentEmail,
  amountPaidPence: data.amountPaidPence === null ? null : data.amountPaidPence,
  paymentMethod: data.paymentMethod === null ? null : data.paymentMethod,
  notes: data.notes === '' || data.notes === null ? null : data.notes,
}))

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = walkInSchema.parse(body)

    const { data, error } = await supabase
      .from('walk_ins')
      .insert({
        parent_name: validated.parentName,
        parent_phone: validated.parentPhone,
        parent_email: validated.parentEmail,
        child_name: validated.childName,
        child_age: validated.childAge,
        class_type: validated.classType,
        session_date: validated.sessionDate,
        amount_paid_pence: validated.amountPaidPence,
        payment_method: validated.paymentMethod,
        notes: validated.notes,
        created_by: auth.userId,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert walk-in: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ id: data.id })
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
