import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parentInterestInputSchema } from '@/lib/parent-interests-schema'
import { createParentInterest } from '@/lib/parent-interests'
import { sendEnquiryEmails } from '@/lib/enquiry-emails'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Public "register interest" form endpoint (parents). No auth.
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`parent:${clientIp(request)}`)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

    const body = await request.json()
    const v = parentInterestInputSchema.parse(body)

    // Honeypot: silently accept and drop bot submissions.
    if (v.website && v.website.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const { id } = await createParentInterest({
      parentName: v.parentName,
      parentEmail: v.parentEmail,
      parentPhone: v.parentPhone,
      childYearGroup: v.childYearGroup,
      preferredSchool: v.preferredSchool,
      postcode: v.postcode,
      message: v.message,
    })

    await sendEnquiryEmails({
      kind: 'parent',
      enquirerName: v.parentName,
      enquirerEmail: v.parentEmail,
      alertSubject: `New parent interest: ${v.parentName}`,
      alertFields: [
        { label: 'Parent', value: v.parentName },
        { label: 'Email', value: v.parentEmail },
        { label: 'Phone', value: v.parentPhone },
        { label: "Child's school year", value: v.childYearGroup },
        { label: 'Preferred school', value: v.preferredSchool },
        { label: 'Postcode', value: v.postcode },
        { label: 'Message', value: v.message },
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
