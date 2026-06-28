import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  PRICING,
  getRemainingSessionCount,
  getNextTerm,
  getFullTermSessionCount,
  getCurrentTerm,
  SIBLING_DISCOUNT_PCT,
} from '@/lib/constants'
import { computeTermPassPrice } from '@/lib/pricing'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { bookingType, parentId, childId, selectedTerm } = body

  if (bookingType === 'single-session') {
    return NextResponse.json({
      amount: PRICING.singleSession,
      discountAmount: 0,
      discountPct: 0,
      sessionCount: 1,
    })
  }

  if (bookingType === 'free-trial') {
    return NextResponse.json({
      amount: 0,
      discountAmount: 0,
      discountPct: 0,
      sessionCount: 1,
    })
  }

  if (bookingType === 'term-pass') {
    if (!parentId || !childId || !selectedTerm) {
      return NextResponse.json(
        { error: 'Missing required fields: parentId, childId, selectedTerm' },
        { status: 400 },
      )
    }

    try {
      const nextTerm = getNextTerm()
      const isNextTerm = selectedTerm === 'next' && nextTerm
      const targetTerm = isNextTerm ? nextTerm : getCurrentTerm()

      const { count: existingTermBookingsForParent } = await supabaseAdmin
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('parent_id', parentId)
        .eq('booking_type', 'term')
        .eq('term_name', targetTerm.name)
        .eq('term_year', targetTerm.year)
        .neq('child_id', childId)
        .in('status', ['pending', 'confirmed'])

      const sessionCount = isNextTerm
        ? getFullTermSessionCount(targetTerm)
        : getRemainingSessionCount()

      const priced = computeTermPassPrice({
        sessionCount,
        pricePerSession: PRICING.termPerSession,
        siblingDiscountPct: SIBLING_DISCOUNT_PCT,
        existingTermBookingsForParent: existingTermBookingsForParent ?? 0,
      })

      return NextResponse.json({
        amount: priced.amount,
        discountAmount: priced.discountAmount,
        discountPct: priced.discountPct,
        sessionCount,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error'
      return NextResponse.json(
        { error: message },
        { status: 500 },
      )
    }
  }

  return NextResponse.json(
    { error: 'Invalid booking type' },
    { status: 400 },
  )
}
