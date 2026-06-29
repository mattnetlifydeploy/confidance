'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, TERMS } from '@/lib/constants'

export default function CommsPage() {
  const [emailForm, setEmailForm] = useState({
    subject: '',
    body: '',
    audience: 'all',
  })
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [bannerForm, setBannerForm] = useState({
    body: '',
    audience: 'all',
    expiresAt: '',
  })
  const [bannerSubmitting, setBannerSubmitting] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleEmailSubmit = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      setEmailMessage({ type: 'error', text: 'Subject and body required' })
      return
    }

    setEmailSubmitting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject: emailForm.subject,
          body: emailForm.body,
          audience: emailForm.audience,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to send email')
      }

      const data = await res.json()
      setEmailMessage({ type: 'success', text: `Sent to ${data.sent} recipients` })
      setEmailForm({ subject: '', body: '', audience: 'all' })
      setTimeout(() => setEmailMessage(null), 3000)
    } catch (err) {
      setEmailMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to send email',
      })
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handleBannerSubmit = async () => {
    if (!bannerForm.body.trim()) {
      setBannerMessage({ type: 'error', text: 'Banner body required' })
      return
    }

    setBannerSubmitting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const expiresAt = bannerForm.expiresAt ? new Date(bannerForm.expiresAt).toISOString() : null

      const res = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          body: bannerForm.body,
          audience: bannerForm.audience,
          expiresAt,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to publish banner')
      }

      setBannerMessage({ type: 'success', text: 'Banner published' })
      setBannerForm({ body: '', audience: 'all', expiresAt: '' })
      setTimeout(() => setBannerMessage(null), 3000)
    } catch (err) {
      setBannerMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to publish banner',
      })
    } finally {
      setBannerSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Send Email Card */}
      <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Send Email</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Send announcements to parents via email
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <input
              type="text"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              placeholder="Email subject"
              maxLength={200}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Body</label>
            <textarea
              value={emailForm.body}
              onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
              placeholder="Email body (plain text)"
              maxLength={10000}
              rows={5}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Audience</label>
            <select
              value={emailForm.audience}
              onChange={(e) => setEmailForm({ ...emailForm, audience: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="all">All parents</option>
              {Object.entries(CLASSES).map(([key, val]) => (
                <option key={key} value={`class:${key}`}>
                  Parents of {val.name}
                </option>
              ))}
              {TERMS.map((term) => (
                <option key={`${term.name}-${term.year}`} value={`term:${term.name}-${term.year}`}>
                  Parents on {term.name} {term.year}
                </option>
              ))}
            </select>
          </div>

          {emailMessage && (
            <div className={`rounded-lg px-4 py-2 text-sm ${
              emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {emailMessage.text}
            </div>
          )}

          <button
            onClick={handleEmailSubmit}
            disabled={emailSubmitting}
            className="w-full rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {emailSubmitting ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>

      {/* Publish Banner Card */}
      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Publish Banner</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Display messages in the dashboard portal
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              value={bannerForm.body}
              onChange={(e) => setBannerForm({ ...bannerForm, body: e.target.value })}
              placeholder="Banner message (max 1000 characters)"
              maxLength={1000}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Audience</label>
            <select
              value={bannerForm.audience}
              onChange={(e) => setBannerForm({ ...bannerForm, audience: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="all">All parents</option>
              {Object.entries(CLASSES).map(([key, val]) => (
                <option key={key} value={`class:${key}`}>
                  Parents of {val.name}
                </option>
              ))}
              {TERMS.map((term) => (
                <option key={`${term.name}-${term.year}`} value={`term:${term.name}-${term.year}`}>
                  Parents on {term.name} {term.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Expires at (optional)</label>
            <input
              type="datetime-local"
              value={bannerForm.expiresAt}
              onChange={(e) => setBannerForm({ ...bannerForm, expiresAt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>

          {bannerMessage && (
            <div className={`rounded-lg px-4 py-2 text-sm ${
              bannerMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {bannerMessage.text}
            </div>
          )}

          <button
            onClick={handleBannerSubmit}
            disabled={bannerSubmitting}
            className="w-full rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {bannerSubmitting ? 'Publishing...' : 'Publish Banner'}
          </button>
        </div>
      </div>
    </div>
  )
}
