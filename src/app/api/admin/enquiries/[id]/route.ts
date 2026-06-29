import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit-log'
import { updateEnquiry, ENQUIRY_STATUSES } from '@/lib/schools'
import { type EnquiryStatus } from '@/lib/schools-schema'

const updateEnquirySchema = z.object({
  status: z.enum(['new', 'contacted', 'interested', 'signed', 'lost']).optional(),
  adminNotes: z.string().trim().max(5000).nullable().optional(),
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
    const validated = updateEnquirySchema.parse(body)

    const patch: { status?: EnquiryStatus; adminNotes?: string | null } = {}
    if (validated.status !== undefined) patch.status = validated.status
    if (validated.adminNotes !== undefined) patch.adminNotes = validated.adminNotes

    await updateEnquiry(id, patch)

    await auditLog(
      auth.userId,
      'update_enquiry',
      'school_enquiry',
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
