import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { updateBlueprint, deleteBlueprint, type BlueprintInput } from '@/lib/blueprints'

const blueprintUpdateSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers and hyphens'),
    name: z.string().min(1),
    ages: z.string().min(1),
    ageMax: z.number().int().min(0).max(18),
    defaultDay: z.string().nullable(),
    defaultTime: z.string().nullable(),
    defaultDurationMins: z.number().int().min(1).max(600),
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
    const validated = blueprintUpdateSchema.parse(body)

    const patch: Partial<BlueprintInput> = {}
    for (const key of Object.keys(validated) as (keyof BlueprintInput)[]) {
      const value = validated[key]
      if (value !== undefined) {
        ;(patch as Record<string, unknown>)[key] = value
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    try {
      await updateBlueprint(id, patch)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('class_blueprints_slug_key') || msg.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A blueprint with that slug already exists.' },
          { status: 409 },
        )
      }
      throw err
    }

    await auditLog(auth.userId, 'blueprint.updated', 'class_blueprint', id, patch)

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
    await deleteBlueprint(id)

    await auditLog(auth.userId, 'blueprint.deleted', 'class_blueprint', id, {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
