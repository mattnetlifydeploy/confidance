import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { updateClass, deleteClass, type ClassInput } from '@/lib/classes'

const classUpdateSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers and hyphens'),
    name: z.string().min(1),
    ages: z.string().min(1),
    ageMax: z.number().int().min(0).max(18),
    day: z.string().min(1),
    time: z.string().min(1),
    durationMins: z.number().int().min(1).max(600),
    venueSchoolId: z.string().uuid().nullable(),
    sortOrder: z.number().int(),
    active: z.boolean(),
  })
  .partial()

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
    const validated = classUpdateSchema.parse(body)

    const patch: Partial<ClassInput> = {}
    for (const key of Object.keys(validated) as (keyof ClassInput)[]) {
      const value = validated[key]
      if (value !== undefined) {
        // value is a validated union member for its key; assign through.
        ;(patch as Record<string, unknown>)[key] = value
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 },
      )
    }

    await updateClass(id, patch)

    await auditLog(auth.userId, 'class.updated', 'class', id, patch)

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
    await deleteClass(id)

    await auditLog(auth.userId, 'class.deleted', 'class', id, {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
