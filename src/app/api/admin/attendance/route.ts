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

const attendanceSchema = z.object({
  childId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classType: z.enum(['baby-boogie', 'confidance-kids']),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = attendanceSchema.parse(body)

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        {
          child_id: validated.childId,
          session_date: validated.sessionDate,
          class_type: validated.classType,
          checked_in_by: auth.userId,
          checked_in_at: new Date().toISOString(),
        },
        { onConflict: 'child_id,session_date,class_type' },
      )
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to record attendance: ${error.message}` },
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const childId = request.nextUrl.searchParams.get('childId')
    const sessionDate = request.nextUrl.searchParams.get('sessionDate')
    const classType = request.nextUrl.searchParams.get('classType')

    const params = {
      childId: childId || '',
      sessionDate: sessionDate || '',
      classType: classType || '',
    }

    const validated = attendanceSchema.parse(params)

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('child_id', validated.childId)
      .eq('session_date', validated.sessionDate)
      .eq('class_type', validated.classType)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete attendance: ${error.message}` },
        { status: 500 },
      )
    }

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
