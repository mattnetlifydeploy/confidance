'use client'

import { TERMS, getCurrentTerm, getNextTerm, getTermSessionDates } from '@/lib/constants'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function TermsPage() {
  const current = getCurrentTerm()
  const next = getNextTerm()
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Terms</h2>
        <p className="mt-1 text-sm text-warm-gray">
          Term schedule from 2026 to 2029. Highlighted: current and next.
        </p>
      </div>

      <div className="space-y-3">
        {TERMS.map((t) => {
          const isCurrent = t.name === current.name && t.year === current.year
          const isNext = next && t.name === next.name && t.year === next.year
          const isPast = t.endDate < todayIso
          const sessionDates = getTermSessionDates(t)
          const upcomingCount = sessionDates.filter((d) => d >= todayIso).length

          return (
            <div
              key={`${t.year}-${t.name}`}
              className={`rounded-3xl p-6 shadow-sm card-glow ${
                isCurrent
                  ? 'bg-coral/10 ring-2 ring-coral'
                  : isNext
                  ? 'bg-lilac/10 ring-2 ring-lilac'
                  : isPast
                  ? 'bg-cream/50 opacity-70'
                  : 'bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold">
                    {t.name} {t.year}
                  </h3>
                  <p className="text-sm text-warm-gray">
                    {formatDate(t.startDate)} to {formatDate(t.endDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isCurrent && (
                    <span className="rounded-full bg-coral px-3 py-1 text-xs font-600 text-white">
                      Current
                    </span>
                  )}
                  {isNext && (
                    <span className="rounded-full bg-lilac px-3 py-1 text-xs font-600 text-white">
                      Next
                    </span>
                  )}
                  <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-600 text-warm-gray">
                    {sessionDates.length} sessions
                  </span>
                  {!isPast && (
                    <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-600 text-warm-gray">
                      {upcomingCount} upcoming
                    </span>
                  )}
                </div>
              </div>
              {t.noClassDates.length > 0 && (
                <p className="mt-3 text-xs text-warm-gray">
                  No class on: {t.noClassDates.map(formatDate).join(', ')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
