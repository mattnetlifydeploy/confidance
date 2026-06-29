import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getParentInterests, PARENT_INTEREST_STATUSES } from '@/lib/parent-interests'
import { type ParentInterestStatus } from '@/lib/parent-interests-schema'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const statusParam = request.nextUrl.searchParams.get('status')
    let status: ParentInterestStatus | undefined

    if (statusParam) {
      if (PARENT_INTEREST_STATUSES.includes(statusParam as ParentInterestStatus)) {
        status = statusParam as ParentInterestStatus
      }
    }

    const interests = await getParentInterests(status)
    return NextResponse.json({ interests })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
