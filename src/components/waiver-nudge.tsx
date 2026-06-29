'use client'

import Link from 'next/link'

type WaiverNudgeProps = {
  needsWaiver: boolean
}

export function WaiverNudge({ needsWaiver }: WaiverNudgeProps) {
  if (!needsWaiver) return null

  return (
    <div className="reveal rounded-3xl bg-amber-50 border border-amber-200 p-6 card-glow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-heading text-base font-bold text-amber-900">Waiver Update Required</h3>
          <p className="mt-1 text-sm text-amber-800">Our terms have been updated. Please review and sign the new waiver before booking.</p>
        </div>
        <Link
          href="#waivers"
          className="shrink-0 ml-4 font-heading text-sm font-600 text-amber-600 hover:text-amber-700 transition-colors"
        >
          Review Now
        </Link>
      </div>
    </div>
  )
}
