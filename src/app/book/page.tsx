'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BookingForm } from '@/components/booking-form'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export default function BookPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-20">
        <div className="flex gap-2">
          <span className="dancing-dot bg-coral" />
          <span className="dancing-dot bg-lilac" />
          <span className="dancing-dot bg-gold" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <section className="relative min-h-[80vh] overflow-hidden bg-cream pt-32 pb-24 flex items-center">
          <AnimatedBubbles count={10} />
          <div className="blob absolute -right-40 -top-20 h-[500px] w-[500px] bg-lilac/8 blur-3xl" />

          <div className="relative mx-auto max-w-xl px-6 text-center">
            <div className="reveal glass mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl">
              <svg className="h-10 w-10 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="reveal mt-8 font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
              Sign up to <span className="text-gradient-animated">book</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Create a free account to add your child and book classes.
              It only takes a minute.
            </p>
            <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary group">
                Create Account
                <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
            </div>
            <p className="reveal mt-8 text-sm text-warm-gray">
              Already have an account? <Link href="/login" className="text-coral font-600 hover:underline">Log in here</Link>
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-32 pb-12">
        <AnimatedBubbles count={6} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 font-heading text-sm font-600 text-coral shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Secure your spot
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl">
              Book a <span className="text-gradient">class</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Fill in the form below to book a trial class or a full term place.
              You&apos;ll receive a confirmation email with everything you need to know.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="mx-auto max-w-2xl px-6">
          <div className="reveal gradient-border">
            <div className="rounded-[22px] bg-white p-8">
              <BookingForm />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-warm-gray">
            Payment will be sent to Jessica Lauren Murphy
          </p>
        </div>
      </section>
    </>
  )
}
