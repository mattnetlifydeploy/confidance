import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enquiryInputSchema } from '@/lib/schools-schema'
import { createEnquiry } from '@/lib/schools'
import { sendEnquiryEmails } from '@/lib/enquiry-emails'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Public "For Schools" enquiry form endpoint. No auth: anyone can express interest.
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`school:${clientIp(request)}`)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

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

    // Internal alert (to Matt) + warm auto-reply (to the school). Best-effort:
    // the enquiry is already saved, so email never blocks or throws.
    await sendEnquiryEmails({
      kind: 'school',
      enquirerName: v.contactName,
      enquirerEmail: v.contactEmail,
      alertSubject: `New school enquiry: ${v.schoolName}`,
      alertFields: [
        { label: 'School', value: v.schoolName },
        { label: 'Type', value: v.schoolType },
        { label: 'Contact', value: v.contactName },
        { label: 'Email', value: v.contactEmail },
        { label: 'Phone', value: v.contactPhone },
        { label: 'Estimated students', value: v.estimatedStudents },
        { label: 'Preferred days/times', value: v.preferredDaysTimes },
        { label: 'Notes', value: v.notes },
      ],
      ref: id,
    })

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
