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

const addExclusionSchema = z.object({
  term_name: z.string().min(1).max(50),
  term_year: z.number().int().min(2026).max(2100),
  exclusion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
})

const deleteExclusionSchema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = addExclusionSchema.parse(body)

    const { data, error } = await supabase
      .from('term_exclusions')
      .insert({
        term_name: validated.term_name,
        term_year: validated.term_year,
        exclusion_date: validated.exclusion_date,
        reason: validated.reason ?? null,
        created_by: auth.userId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert exclusion: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(
      auth.userId,
      'term_exclusion_added',
      'term_exclusion',
      data.id,
      {
        term_name: validated.term_name,
        term_year: validated.term_year,
        exclusion_date: validated.exclusion_date,
      },
    )

    return NextResponse.json(data)
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = deleteExclusionSchema.parse(body)

    const { error } = await supabase
      .from('term_exclusions')
      .delete()
      .eq('id', validated.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete exclusion: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(
      auth.userId,
      'term_exclusion_removed',
      'term_exclusion',
      validated.id,
      {},
    )

    return NextResponse.json({ success: true })
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
