'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { VENUE } from '@/lib/constants'

function BookingSuccessContent() {
  const params = useSearchParams()
  const type = params.get('type') // trial | single | term
  const childName = params.get('child')
  const className = params.get('class')
  const sessionCount = params.get('sessions')

  const isTrial = type === 'trial'
  const isTerm = type === 'term'

  const bookingTypeLabel = isTrial
    ? 'Free Trial'
    : isTerm
      ? 'Term Pass'
      : 'Single Session'

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-cream px-6 py-32">
      <AnimatedBubbles count={10} />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="gradient-border">
          <div className="rounded-3xl bg-white p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="mt-6 font-heading text-3xl font-bold">
              Booking <span className="text-gradient">confirmed!</span>
            </h1>

            <p className="mt-4 text-charcoal-light">
              {isTrial
                ? 'Your free trial has been booked.'
                : 'Payment received and your booking is confirmed.'}
              {' '}You&apos;ll get a confirmation email shortly.
            </p>

            {/* Booking Details */}
            {(childName || className) && (
              <div className="mt-6 rounded-2xl bg-cream p-6 text-left space-y-3">
                {className && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Class</span>
                    <span className="font-600 text-charcoal">{className}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Booking Type</span>
                  <span className="font-600 text-charcoal">{bookingTypeLabel}</span>
                </div>
                {childName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Child</span>
                    <span className="font-600 text-charcoal">{childName}</span>
                  </div>
                )}
                {isTerm && sessionCount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Sessions</span>
                    <span className="font-600 text-charcoal">{sessionCount} classes</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <p className="font-heading text-xs font-700 text-warm-gray uppercase tracking-wide">{VENUE.name}</p>
                  <p className="mt-1 text-xs text-charcoal-light">{VENUE.address}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Link href="/dashboard" className="btn-primary w-full text-center">
                View My Bookings
              </Link>
              <Link href="/" className="btn-secondary w-full text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <div className="flex gap-2">
            <span className="dancing-dot bg-coral" />
            <span className="dancing-dot bg-lilac" />
            <span className="dancing-dot bg-gold" />
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  )
}
