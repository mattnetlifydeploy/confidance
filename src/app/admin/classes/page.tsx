'use client'

import { CLASSES, VENUE } from '@/lib/constants'

export default function ClassesPage() {
  const entries = Object.entries(CLASSES)

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Classes</h2>
        <p className="mt-1 text-sm text-warm-gray">
          Current class lineup. Times, ages, and venue are configured in code.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {entries.map(([slug, c]) => (
          <div key={slug} className="rounded-3xl bg-white p-6 shadow-sm card-glow">
            <h3 className="font-heading text-lg font-bold text-coral">{c.name}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-warm-gray">Ages</dt>
                <dd className="font-600">{c.ages}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-gray">Day</dt>
                <dd className="font-600">{c.day}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-gray">Time</dt>
                <dd className="font-600">{c.time}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-gray">Duration</dt>
                <dd className="font-600">{c.durationMins} mins</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-gray">Slug</dt>
                <dd className="font-mono text-xs text-warm-gray">{slug}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm card-glow">
        <h3 className="font-heading text-base font-bold">Venue</h3>
        <p className="mt-2 text-sm">
          <span className="font-600">{VENUE.name}</span>
          <br />
          <span className="text-warm-gray">{VENUE.address}</span>
        </p>
      </div>
    </div>
  )
}
