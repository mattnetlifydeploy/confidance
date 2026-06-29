import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { updateSchool, type SchoolInput } from '@/lib/schools'

const updateSchoolSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
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
    const validated = updateSchoolSchema.parse(body)

    const patch: Partial<SchoolInput> = {}
    if (validated.name !== undefined) patch.name = validated.name
    if (validated.slug !== undefined) patch.slug = validated.slug
    if (validated.address !== undefined) patch.address = validated.address
    if (validated.postcode !== undefined) patch.postcode = validated.postcode
    if (validated.area !== undefined) patch.area = validated.area
    if (validated.contactName !== undefined) patch.contactName = validated.contactName
    if (validated.contactEmail !== undefined) patch.contactEmail = validated.contactEmail
    if (validated.contactPhone !== undefined) patch.contactPhone = validated.contactPhone
    if (validated.schoolType !== undefined) patch.schoolType = validated.schoolType
    if (validated.active !== undefined) patch.active = validated.active
    if (validated.notes !== undefined) patch.notes = validated.notes

    await updateSchool(id, patch)

    await auditLog(
      auth.userId,
      'update_school',
      'school',
      id,
      { fields: Object.keys(patch) },
    )

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
