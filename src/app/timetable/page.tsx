import Link from 'next/link'
import type { Metadata } from 'next'
import { VENUE, CLASSES, CURRENT_TERM, TERM_LABEL, SIBLING_DISCOUNT_PCT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Timetable & Location | Confidance',
  description: 'Find Confidance performing arts classes at Grove Neighbourhood Centre. View class times and age groups.',
}

const formatTermDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function TimetablePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-cream pt-36 pb-28">
        <div className="blob absolute -left-40 -top-24 h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-teal-border bg-pale/50 px-5 py-2 font-heading text-sm font-600 text-navy backdrop-blur-sm">
              <svg className="h-4 w-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Term dates and location
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight text-navy md:text-5xl lg:text-6xl">
              Performing arts classes <span className="font-script font-600 text-teal">this term</span>
            </h1>
            <p className="reveal mt-6 max-w-xl font-body text-lg text-charcoal-light">
              Classes run after school during term time. Book for the full term or try a single session first. {TERM_LABEL} runs {formatTermDate(CURRENT_TERM.startDate)} to {formatTermDate(CURRENT_TERM.endDate)}.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ TIMETABLE CARD ═══ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="reveal card-glow overflow-hidden rounded-3xl border border-border">
            {/* Venue header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-teal/10 to-navy/5 p-8">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/10">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-navy">{VENUE.name}</h2>
                  <p className="mt-1 text-sm text-charcoal-light">{VENUE.address}</p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="divide-y divide-border bg-white">
              {Object.values(CLASSES).map((classItem) => (
                <div key={`${classItem.day}-${classItem.time}`} className="group flex flex-col gap-4 p-6 transition-colors hover:bg-cream/50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-teal/20 px-4 py-1.5 font-heading text-xs font-700 text-teal-dark">
                      {classItem.day}
                    </span>
                    <span className="font-heading text-sm font-600 text-navy">{classItem.time}</span>
                    <span className="rounded-full bg-navy/10 px-4 py-1.5 text-xs font-700 text-navy">
                      {classItem.name} ({classItem.ages})
                    </span>
                  </div>
                  <Link
                    href="/book"
                    className="btn-primary"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-teal-border bg-pale/30 p-4">
              <p className="text-sm font-heading font-600 text-navy">
                Booking a 2nd child same term? {SIBLING_DISCOUNT_PCT}% off term pass automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING HINT ═══ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal grid gap-6 md:grid-cols-3">
            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">Free Trial</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Try one session free. One per child.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-teal">Free</p>
            </div>

            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">Single Session</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Book a one-off class whenever it suits you.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-teal">£12</p>
            </div>

            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">Term Pass</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Lock in the best value. Remaining sessions × £10 each.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-teal">Best value</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
