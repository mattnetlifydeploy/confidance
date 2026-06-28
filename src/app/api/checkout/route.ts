import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createClient } from '@supabase/supabase-js'
import { PRICING, getRemainingSessionCount, VENUE, getNextTerm, getFullTermSessionCount, getCurrentTerm, SIBLING_DISCOUNT_PCT } from '@/lib/constants'
import { computeTermPassPrice } from '@/lib/pricing'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const LOCATION = `${VENUE.name}, ${VENUE.address}`

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 },
    )
  }

  const body = await req.json()
  const {
    bookingId,
    bookingType,
    classType,
    childName,
    childId,
    parentId,
    parentEmail,
    sessionDate,
    emergencyContact,
    emergencyPhone,
    selectedTerm,
  } = body

  if (!bookingId || !bookingType || !classType || !childId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }

  const className = classType === 'baby-boogie' ? 'Baby Boogie' : 'Confidance Kids'

  try {
    if (bookingType === 'free-trial') {
      // Check if this child already has a trial booking
      const { data: existingTrial } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('child_id', childId)
        .eq('booking_type', 'trial')
        .limit(1)
        .maybeSingle()

      if (existingTrial) {
        return NextResponse.json(
          { error: 'Trial already used for this child' },
          { status: 400 },
        )
      }

      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          id: bookingId,
          booking_type: 'trial',
          class_type: classType,
          child_id: childId,
          parent_id: parentId,
          emergency_contact: emergencyContact || '',
          emergency_phone: emergencyPhone || '',
          location: LOCATION,
          status: 'confirmed',
          term_name: getCurrentTerm().name,
          term_year: getCurrentTerm().year,
        })

      if (bookingError) {
        return NextResponse.json(
          { error: `Failed to create booking: ${bookingError.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true })
    }

    if (bookingType === 'single-session') {
      if (!sessionDate) {
        return NextResponse.json(
          { error: 'sessionDate required for single-session booking' },
          { status: 400 },
        )
      }

      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          id: bookingId,
          booking_type: 'single',
          class_type: classType,
          child_id: childId,
          parent_id: parentId,
          emergency_contact: emergencyContact || '',
          emergency_phone: emergencyPhone || '',
          location: LOCATION,
          status: 'pending',
          term_name: getCurrentTerm().name,
          term_year: getCurrentTerm().year,
        })

      if (bookingError) {
        return NextResponse.json(
          { error: `Failed to create booking: ${bookingError.message}` },
          { status: 500 },
        )
      }

      const amount = PRICING.singleSession
      const typeLabel = 'Single Session'

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: parentEmail,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `${className}: ${typeLabel}`,
                description: `Booking for ${childName}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          booking_id: bookingId,
          booking_type: 'single',
        },
        success_url: `${req.nextUrl.origin}/booking-success?type=single&child=${encodeURIComponent(childName)}&class=${encodeURIComponent(className)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.nextUrl.origin}/book?cancelled=true`,
      })

      return NextResponse.json({ url: session.url })
    }

    if (bookingType === 'term-pass') {
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

      const amount = priced.amount
      const discountPct = priced.discountPct

      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          id: bookingId,
          booking_type: 'term',
          class_type: classType,
          child_id: childId,
          parent_id: parentId,
          emergency_contact: emergencyContact || '',
          emergency_phone: emergencyPhone || '',
          location: LOCATION,
          status: 'pending',
          term_name: targetTerm.name,
          term_year: targetTerm.year,
          sibling_discount_pct: discountPct,
        })

      if (bookingError) {
        return NextResponse.json(
          { error: `Failed to create booking: ${bookingError.message}` },
          { status: 500 },
        )
      }

      const termInfo = `${targetTerm.name} ${targetTerm.year}`
      const typeLabel = `Term Pass: ${termInfo}`

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: parentEmail,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `${className}: ${typeLabel}`,
                description: discountPct > 0
                  ? `Booking for ${childName} (${sessionCount} sessions, ${discountPct}% sibling discount)`
                  : `Booking for ${childName} (${sessionCount} sessions)`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          booking_id: bookingId,
          booking_type: 'term',
        },
        success_url: `${req.nextUrl.origin}/booking-success?type=term&child=${encodeURIComponent(childName)}&class=${encodeURIComponent(className)}&sessions=${sessionCount}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.nextUrl.origin}/book?cancelled=true`,
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json(
      { error: 'Invalid booking type' },
      { status: 400 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
