import { NextResponse } from 'next/server'
import { getClassesMap, getVenue } from '@/lib/classes'

// Public reference data: active classes + the default venue. The data layer
// already falls back to constants, so this rarely errors; the catch is a hard
// safety net (client hook keeps its constant-seeded state on a non-200).
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [classes, venue] = await Promise.all([getClassesMap(), getVenue()])
    return NextResponse.json({ classes, venue })
  } catch {
    return NextResponse.json({ error: 'Failed to load classes' }, { status: 500 })
  }
}
