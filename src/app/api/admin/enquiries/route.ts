import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getEnquiries, ENQUIRY_STATUSES } from '@/lib/schools'
import { type EnquiryStatus } from '@/lib/schools-schema'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const statusParam = request.nextUrl.searchParams.get('status')
    let status: EnquiryStatus | undefined

    if (statusParam) {
      if (ENQUIRY_STATUSES.includes(statusParam as EnquiryStatus)) {
        status = statusParam as EnquiryStatus
      }
    }

    const enquiries = await getEnquiries(status)
    return NextResponse.json({ enquiries })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
