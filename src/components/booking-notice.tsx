import Link from 'next/link'

// Shown on /book and /timetable while consumer bookings are paused (no
// partner school yet). Distinct teal strip with its own nav clearance so it
// reads as a notice bar above either a navy or a cream page.
export function BookingNotice() {
  return (
    <div className="relative z-10 bg-teal px-6 pt-24 pb-4 text-center">
      <p className="mx-auto max-w-2xl font-heading text-sm font-600 text-navy">
        Bookings open once we have a partner school.{' '}
        <Link
          href="/for-schools"
          className="font-700 underline decoration-navy/40 underline-offset-4 transition-colors hover:decoration-navy"
        >
          Enquire here
        </Link>
      </p>
    </div>
  )
}
