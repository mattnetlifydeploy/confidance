import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enquiryInputSchema } from '@/lib/schools-schema'
import { createEnquiry } from '@/lib/schools'
import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { CONTACT_EMAIL } from '@/lib/constants'

// Public "For Schools" enquiry form endpoint. No auth: anyone can express interest.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const v = enquiryInputSchema.parse(body)

    // Honeypot: silently accept and drop bot submissions.
    if (v.website && v.website.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const { id } = await createEnquiry({
      schoolName: v.schoolName,
      schoolType: v.schoolType,
      contactName: v.contactName,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      estimatedStudents: v.estimatedStudents,
      preferredDaysTimes: v.preferredDaysTimes,
      notes: v.notes,
    })

    // Notify Jessica. Best-effort: the enquiry is already saved, never block on email.
    try {
      const lines = [
        'New "For Schools" enquiry via confidancecommunity.co.uk',
        '',
        `School: ${v.schoolName}`,
        v.schoolType ? `Type: ${v.schoolType}` : null,
        `Contact: ${v.contactName}`,
        `Email: ${v.contactEmail}`,
        v.contactPhone ? `Phone: ${v.contactPhone}` : null,
        v.estimatedStudents != null ? `Estimated students: ${v.estimatedStudents}` : null,
        v.preferredDaysTimes ? `Preferred days/times: ${v.preferredDaysTimes}` : null,
        v.notes ? `Notes: ${v.notes}` : null,
        '',
        `Manage in admin under Enquiries (ref ${id}).`,
      ].filter(Boolean) as string[]

      await getResend().emails.send({
        from: FROM_ADDRESS,
        to: CONTACT_EMAIL,
        subject: `New school enquiry: ${v.schoolName}`,
        text: lines.join('\n'),
      })
    } catch {
      // Swallow email failures; the enquiry persists regardless.
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message ?? 'Validation error'
      return NextResponse.json({ error: message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Internal server error: ${message}` }, { status: 500 })
  }
}
