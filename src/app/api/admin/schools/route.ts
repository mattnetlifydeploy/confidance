import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { getAllSchools, createSchool, type SchoolInput } from '@/lib/schools'

const createSchoolSchema = z.object({
  name: z.string().trim().min(1, 'School name is required').max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().max(300).nullable().optional(),
  postcode: z.string().trim().max(20).nullable().optional(),
  area: z.string().trim().max(100).nullable().optional(),
  contactName: z.string().trim().max(120).nullable().optional(),
  contactEmail: z.string().trim().email().nullable().optional(),
  contactPhone: z.string().trim().max(20).nullable().optional(),
  schoolType: z.enum(['primary', 'secondary', 'other']).nullable().optional(),
  active: z.boolean().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

function deriveSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const schools = await getAllSchools()
    return NextResponse.json({ schools })
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
    const validated = createSchoolSchema.parse(body)

    const slug = validated.slug || deriveSlug(validated.name)

    const input: SchoolInput = {
      name: validated.name,
      slug,
      address: validated.address ?? null,
      postcode: validated.postcode ?? null,
      area: validated.area ?? null,
      contactName: validated.contactName ?? null,
      contactEmail: validated.contactEmail ?? null,
      contactPhone: validated.contactPhone ?? null,
      schoolType: validated.schoolType ?? null,
      active: validated.active ?? false,
      notes: validated.notes ?? null,
    }

    const school = await createSchool(input)

    await auditLog(
      auth.userId,
      'create_school',
      'school',
      school.id,
      { name: school.name },
    )

    return NextResponse.json({ school })
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
