import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { getAllBlueprints, createBlueprint } from '@/lib/blueprints'

const blueprintCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers and hyphens'),
  name: z.string().min(1),
  ages: z.string().min(1),
  ageMax: z.number().int().min(0).max(18),
  defaultDay: z.string().nullable().optional(),
  defaultTime: z.string().nullable().optional(),
  defaultDurationMins: z.number().int().min(1).max(600).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const blueprints = await getAllBlueprints()
    return NextResponse.json({ blueprints })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = blueprintCreateSchema.parse(body)

    try {
      const created = await createBlueprint(validated)
      await auditLog(auth.userId, 'blueprint.created', 'class_blueprint', created.id, {
        slug: created.slug,
        name: created.name,
      })
      return NextResponse.json({ blueprint: created }, { status: 201 })
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
