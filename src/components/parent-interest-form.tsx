'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const FIELD =
  'w-full rounded-lg border-2 border-border bg-white px-4 py-3 font-body text-sm text-charcoal transition-colors duration-300 placeholder:text-charcoal-light/60 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10'
const LABEL = 'mb-2 block font-heading text-sm font-600 text-navy'

export function ParentInterestForm() {
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
      parentName: String(data.get('parentName') ?? ''),
      parentEmail: String(data.get('parentEmail') ?? ''),
      parentPhone: String(data.get('parentPhone') ?? ''),
      childYearGroup: String(data.get('childYearGroup') ?? ''),
      preferredSchool: String(data.get('preferredSchool') ?? ''),
      postcode: String(data.get('postcode') ?? ''),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
    }

    try {
      const res = await fetch('/api/enquiries/parent', {
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
            Jessica will be in touch as soon as there is a Confidance club near you. We will keep you posted on new
            clubs as we partner with more schools.
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
          <div>
            <label htmlFor="parentName" className={LABEL}>
              Your name <span className="text-teal">*</span>
            </label>
            <input id="parentName" name="parentName" type="text" required minLength={2} maxLength={120} autoComplete="name" className={FIELD} placeholder="First and last name" />
          </div>

          <div>
            <label htmlFor="parentEmail" className={LABEL}>
              Email <span className="text-teal">*</span>
            </label>
            <input id="parentEmail" name="parentEmail" type="email" required maxLength={200} autoComplete="email" className={FIELD} placeholder="you@email.com" />
          </div>

          <div>
            <label htmlFor="parentPhone" className={LABEL}>
              Phone
            </label>
            <input id="parentPhone" name="parentPhone" type="tel" maxLength={40} autoComplete="tel" className={FIELD} placeholder="Optional" />
          </div>

          <div>
            <label htmlFor="childYearGroup" className={LABEL}>
              Child&apos;s school year
            </label>
            <input id="childYearGroup" name="childYearGroup" type="text" maxLength={80} className={FIELD} placeholder="e.g. Reception, Year 2" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="preferredSchool" className={LABEL}>
              The school you&apos;d love a club at
            </label>
            <input id="preferredSchool" name="preferredSchool" type="text" maxLength={200} className={FIELD} placeholder="Your child's school name" />
          </div>

          <div>
            <label htmlFor="postcode" className={LABEL}>
              Postcode
            </label>
            <input id="postcode" name="postcode" type="text" maxLength={20} autoComplete="postal-code" className={FIELD} placeholder="Helps us see where demand is" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className={LABEL}>
              Anything else we should know?
            </label>
            <textarea id="message" name="message" rows={4} maxLength={3000} className={`${FIELD} resize-y`} placeholder="Your child's interests, questions, anything at all..." />
          </div>
        </div>

        {status === 'error' && error && (
          <p role="alert" className="mt-5 rounded-lg bg-error/8 px-4 py-3 font-body text-sm text-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={status === 'submitting'} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-70">
          {status === 'submitting' ? 'Sending...' : 'Register my interest'}
        </button>
        <p className="mt-4 text-center font-body text-xs text-charcoal-light">
          No commitment. We will only use your details to let you know about clubs near you.
        </p>
      </div>
    </form>
  )
}
