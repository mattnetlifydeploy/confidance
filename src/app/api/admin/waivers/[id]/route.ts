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

const updateWaiverSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  bodyMd: z.string().trim().min(1).max(20000).optional(),
  publishedAt: z.string().datetime().optional(),
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
    const validated = updateWaiverSchema.parse(body)

    const patch: Record<string, string> = {}
    if (validated.title !== undefined) patch.title = validated.title
    if (validated.bodyMd !== undefined) patch.body_md = validated.bodyMd
    if (validated.publishedAt !== undefined) patch.published_at = validated.publishedAt

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabase.from('waivers').update(patch).eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to update waiver: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'waiver.updated', 'waiver', id, {
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

    const { error } = await supabase.from('waivers').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete waiver: ${error.message}` },
        { status: 500 },
      )
    }

    await auditLog(auth.userId, 'waiver.deleted', 'waiver', id, {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
