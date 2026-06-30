import Link from 'next/link'
import type { Metadata } from 'next'
import { BookingNotice } from '@/components/booking-notice'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: 'Timetable',
  description:
    'Once your school signs up, your child’s class times will appear on the Confidance timetable here.',
}

export default function TimetablePage() {
  return (
    <>
      <BookingNotice />
      <section className="relative flex min-h-[82vh] items-center overflow-hidden bg-cream pt-12 pb-32">
      <div className="blob absolute -left-40 -top-24 h-[480px] w-[480px] bg-teal-light/12 blur-3xl" />
      <div className="blob absolute -right-32 bottom-[-8rem] h-[420px] w-[420px] bg-teal/15 blur-3xl" />
      <AnimatedBubbles tone="light" count={8} />

      <div className="relative mx-auto w-full max-w-2xl px-6">
        <div className="reveal-scale card-glow rounded-3xl border border-teal-border bg-white/80 p-10 text-center backdrop-blur-sm md:p-14">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pale to-pale-light">
            <svg className="h-8 w-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="reveal mt-6 inline-flex items-center gap-2 rounded-full border border-teal-border bg-pale/50 px-4 py-1.5 font-heading text-xs font-700 uppercase tracking-wide text-navy">
            Coming soon to your school
          </span>
          <h1 className="reveal mt-5 font-heading text-3xl font-bold leading-tight text-navy md:text-4xl">
            Your timetable will <span className="font-script font-600 text-teal">appear here</span>
          </h1>
          <p className="reveal mx-auto mt-5 max-w-md font-body text-lg text-charcoal-light">
            When your school signs up, you’ll be able to see the class on this timetable here. We are partnering with our very first schools right now.
          </p>
          <div className="reveal mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/for-schools" className="btn-primary">Tell us your school</Link>
            <Link href="/classes" className="btn-secondary">See what a class looks like</Link>
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
