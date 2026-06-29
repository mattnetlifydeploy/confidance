'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BookingForm } from '@/components/booking-form'

export function BookPageClient({
  schools,
  defaultSchoolId,
}: {
  schools: { id: string; name: string }[]
  defaultSchoolId: string | null
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-20">
        <div className="flex gap-2">
          <span className="dancing-dot bg-teal" />
          <span className="dancing-dot bg-navy" />
          <span className="dancing-dot bg-teal-light" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy pt-36 pb-24 text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[440px] w-[440px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-xl px-6 text-center">
          <div className="reveal mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm">
            <svg className="h-10 w-10 text-teal-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="reveal mt-8 font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Sign up to <span className="font-script font-600 text-teal-light">book</span>
          </h1>
          <p className="reveal mt-6 font-body text-lg leading-relaxed text-pale/90">
            Create a free account to add your child and book a club.
            It only takes a minute.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary group">
              Create account
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/login" className="btn-glass">
              Log in
            </Link>
          </div>
          <p className="reveal mt-8 font-body text-sm text-pale/70">
            Already have an account? <Link href="/login" className="font-600 text-teal-light hover:underline">Log in here</Link>
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative overflow-hidden bg-navy pt-36 pb-16 text-white">
        <div className="blob absolute -right-32 -top-24 h-[480px] w-[480px] bg-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 font-heading text-sm font-600 text-pale backdrop-blur-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure your spot
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl">
              Book a <span className="font-script font-600 text-teal-light">club</span>
            </h1>
            <p className="reveal mt-6 font-body text-lg leading-relaxed text-pale/90">
              Choose your school, class and term below.
              You&apos;ll receive a confirmation email with everything you need to know.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-2xl px-6">
          <div className="reveal card-bezel">
            <div className="card-bezel-inner p-8 sm:p-10">
              <BookingForm schools={schools} defaultSchoolId={defaultSchoolId} />
            </div>
          </div>
          <p className="mt-6 text-center font-body text-sm text-charcoal-light">
            Payment will be sent to Jessica Lauren Murphy
          </p>
        </div>
      </section>
    </>
  )
}
