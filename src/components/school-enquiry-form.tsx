'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const FIELD =
  'w-full rounded-lg border-2 border-border bg-white px-4 py-3 font-body text-sm text-charcoal transition-colors duration-300 placeholder:text-charcoal-light/60 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10'
const LABEL = 'mb-2 block font-heading text-sm font-600 text-navy'

export function SchoolEnquiryForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      schoolName: String(data.get('schoolName') ?? ''),
      schoolType: String(data.get('schoolType') ?? ''),
      contactName: String(data.get('contactName') ?? ''),
      contactEmail: String(data.get('contactEmail') ?? ''),
      contactPhone: String(data.get('contactPhone') ?? ''),
      estimatedStudents: String(data.get('estimatedStudents') ?? ''),
      preferredDaysTimes: String(data.get('preferredDaysTimes') ?? ''),
      notes: String(data.get('notes') ?? ''),
      website: String(data.get('website') ?? ''),
    }

    try {
      const res = await fetch('/api/schools/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (res.ok && json.ok) {
        setStatus('success')
        form.reset()
        return
      }
      setError(json.error ?? 'Something went wrong. Please try again or email us directly.')
      setStatus('error')
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="card-bezel reveal-scale visible mx-auto max-w-xl text-center">
        <div className="card-bezel-inner !p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
            <svg className="h-8 w-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="mt-6 font-heading text-2xl font-bold text-navy">Thanks for registering your interest</h3>
          <p className="mt-3 font-body text-charcoal-light">
            Jessica will be in touch within two working days to talk through dates, year groups and a free taster
            session for your school.
          </p>
          <p className="mt-6 font-script text-2xl text-teal">Inspire. Empower. Shine.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-bezel mx-auto max-w-2xl">
      <div className="card-bezel-inner !p-8 md:!p-10">
        {/* Honeypot: visually hidden, off-screen, not focusable for real users */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="schoolName" className={LABEL}>
              School name <span className="text-teal">*</span>
            </label>
            <input id="schoolName" name="schoolName" type="text" required minLength={2} maxLength={200} className={FIELD} placeholder="e.g. St Margaret's Primary School" />
          </div>

          <div>
            <label htmlFor="schoolType" className={LABEL}>
              School type
            </label>
            <select id="schoolType" name="schoolType" className={FIELD} defaultValue="">
              <option value="">Select...</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimatedStudents" className={LABEL}>
              Estimated interested students
            </label>
            <input id="estimatedStudents" name="estimatedStudents" type="number" min={0} max={100000} inputMode="numeric" className={FIELD} placeholder="e.g. 20" />
          </div>

          <div>
            <label htmlFor="contactName" className={LABEL}>
              Your name <span className="text-teal">*</span>
            </label>
            <input id="contactName" name="contactName" type="text" required minLength={2} maxLength={120} autoComplete="name" className={FIELD} placeholder="First and last name" />
          </div>

          <div>
            <label htmlFor="contactEmail" className={LABEL}>
              Email <span className="text-teal">*</span>
            </label>
            <input id="contactEmail" name="contactEmail" type="email" required maxLength={200} autoComplete="email" className={FIELD} placeholder="you@school.org" />
          </div>

          <div>
            <label htmlFor="contactPhone" className={LABEL}>
              Phone
            </label>
            <input id="contactPhone" name="contactPhone" type="tel" maxLength={40} autoComplete="tel" className={FIELD} placeholder="Optional" />
          </div>

          <div>
            <label htmlFor="preferredDaysTimes" className={LABEL}>
              Preferred days / times
            </label>
            <input id="preferredDaysTimes" name="preferredDaysTimes" type="text" maxLength={500} className={FIELD} placeholder="e.g. Tuesdays after 3:15pm" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className={LABEL}>
              Anything else we should know?
            </label>
            <textarea id="notes" name="notes" rows={4} maxLength={3000} className={`${FIELD} resize-y`} placeholder="Year groups, space available, timings, questions..." />
          </div>
        </div>

        {status === 'error' && error && (
          <p role="alert" className="mt-5 rounded-lg bg-error/8 px-4 py-3 font-body text-sm text-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={status === 'submitting'} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-70">
          {status === 'submitting' ? 'Sending...' : 'Register your school'}
        </button>
        <p className="mt-4 text-center font-body text-xs text-charcoal-light">
          No commitment. Jessica reviews every enquiry personally and replies within two working days.
        </p>
      </div>
    </form>
  )
}
