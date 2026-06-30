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

const updateChildSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  age: z.number().int().min(0).max(18).optional(),
  medicalInfo: z.string().trim().max(2000).nullable().optional(),
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
    const validated = updateChildSchema.parse(body)

    const patch: Record<string, string | number | null> = {}
    if (validated.name !== undefined) patch.name = validated.name
    if (validated.age !== undefined) patch.age = validated.age
    if (validated.medicalInfo !== undefined) patch.medical_info = validated.medicalInfo || null

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabase.from('children').update(patch).eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to update child: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'family_child_updated', 'child', id, {
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
