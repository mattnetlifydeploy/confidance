import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { getAllClasses, createClass } from '@/lib/classes'

const classCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers and hyphens'),
  name: z.string().min(1),
  ages: z.string().min(1),
  ageMax: z.number().int().min(0).max(18),
  day: z.string().min(1),
  time: z.string().min(1),
  durationMins: z.number().int().min(1).max(600).optional(),
  venueSchoolId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const classes = await getAllClasses()
    return NextResponse.json({ classes })
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
    const validated = classCreateSchema.parse(body)

    const created = await createClass(validated)

    await auditLog(auth.userId, 'class.created', 'class', created.id, {
      slug: created.slug,
      name: created.name,
    })

    return NextResponse.json({ class: created }, { status: 201 })
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
