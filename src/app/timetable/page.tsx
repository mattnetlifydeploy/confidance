import Link from 'next/link'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { VENUE, CLASSES, CURRENT_TERM, TERM_LABEL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Timetable & Location | Confidance',
  description: 'Find Confidance dance classes at Grove Neighbourhood Centre. View class times and age groups.',
}

export default function TimetablePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-cream pt-32 pb-24">
        <AnimatedBubbles count={8} />
        <div className="blob absolute -left-40 -top-20 h-[400px] w-[400px] bg-gold/8 blur-3xl" />

        {/* Decorative elements */}
        <div className="absolute right-[8%] top-[18%] text-coral/10 text-4xl">&#9733;</div>
        <div className="absolute left-[12%] bottom-[15%] text-lilac/10 text-3xl">&#9834;</div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 font-heading text-sm font-600 text-charcoal shadow-sm">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Term dates and location
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Dance classes <span className="text-gradient-animated">this term</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Classes run after school during term time. Book for the full term
              or try a single session first. {TERM_LABEL} runs {CURRENT_TERM.startDate} to {CURRENT_TERM.endDate}.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ TIMETABLE CARD ═══ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="reveal card-glow overflow-hidden rounded-3xl border border-border">
            {/* Venue header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-lilac/10 to-gold/5 p-8">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm">
                  <svg className="h-6 w-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{VENUE.name}</h2>
                  <p className="mt-1 text-sm text-warm-gray">{VENUE.address}</p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="divide-y divide-border bg-white">
              {Object.values(CLASSES).map((classItem) => (
                <div key={`${classItem.day}-${classItem.time}`} className="group flex flex-col gap-4 p-6 transition-colors hover:bg-cream/50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-xl bg-lilac/20 px-4 py-1.5 font-heading text-xs font-700 text-lilac-dark">
                      {classItem.day}
                    </span>
                    <span className="font-heading text-sm font-600">{classItem.time}</span>
                    <span className={`rounded-full px-4 py-1 text-xs font-700 ${
                      classItem.name === 'Baby Boogie'
                        ? 'bg-lilac/15 text-lilac-dark'
                        : 'bg-coral/10 text-coral-dark'
                    }`}>
                      {classItem.name} ({classItem.ages})
                    </span>
                  </div>
                  <Link
                    href="/book"
                    className="rounded-full bg-gradient-to-r from-coral to-coral-dark px-6 py-2.5 font-heading text-sm font-600 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING HINT ═══ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-4xl px-6">
          <div className="reveal grid gap-6 md:grid-cols-3">
            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lilac/10 text-lilac-dark transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">Free Trial</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Try one session free. One per child.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-coral">Free</p>
            </div>

            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">Single Session</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Book a one-off class whenever it suits you.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-coral">£12</p>
            </div>

            <div className="card-glow group rounded-3xl bg-white p-8 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">Term Pass</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Lock in the best value. Remaining sessions × £10 each.
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-coral">Best value</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
