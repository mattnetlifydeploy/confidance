'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, TERMS } from '@/lib/constants'
import { AdminCard, AdminPageHeader, Button, FormField, Select, Textarea, AdminBanner } from '@/components/admin'

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
      <AdminCard>
        <AdminPageHeader
          title="Send Email"
          description="Send announcements to parents via email"
        />

        <div className="mt-6 space-y-4">
          <FormField label="Subject">
            <input
              type="text"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              placeholder="Email subject"
              maxLength={200}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </FormField>

          <FormField label="Body">
            <textarea
              value={emailForm.body}
              onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
              placeholder="Email body (plain text)"
              maxLength={10000}
              rows={5}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </FormField>

          <FormField label="Audience">
            <Select
              value={emailForm.audience}
              onChange={(e) => setEmailForm({ ...emailForm, audience: e.target.value })}
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
            </Select>
          </FormField>

          {emailMessage && (
            <AdminBanner tone={emailMessage.type === 'success' ? 'success' : 'error'}>
              {emailMessage.text}
            </AdminBanner>
          )}

          <Button
            onClick={handleEmailSubmit}
            disabled={emailSubmitting}
            loading={emailSubmitting}
            className="w-full"
          >
            Send Email
          </Button>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminPageHeader
          title="Publish Banner"
          description="Display messages in the dashboard portal"
        />

        <div className="mt-6 space-y-4">
          <FormField label="Message">
            <Textarea
              value={bannerForm.body}
              onChange={(e) => setBannerForm({ ...bannerForm, body: e.target.value })}
              placeholder="Banner message (max 1000 characters)"
              maxLength={1000}
              rows={3}
            />
          </FormField>

          <FormField label="Audience">
            <Select
              value={bannerForm.audience}
              onChange={(e) => setBannerForm({ ...bannerForm, audience: e.target.value })}
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
            </Select>
          </FormField>

          <FormField label="Expires at (optional)">
            <input
              type="datetime-local"
              value={bannerForm.expiresAt}
              onChange={(e) => setBannerForm({ ...bannerForm, expiresAt: e.target.value })}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </FormField>

          {bannerMessage && (
            <AdminBanner tone={bannerMessage.type === 'success' ? 'success' : 'error'}>
              {bannerMessage.text}
            </AdminBanner>
          )}

          <Button
            onClick={handleBannerSubmit}
            disabled={bannerSubmitting}
            loading={bannerSubmitting}
            className="w-full"
          >
            Publish Banner
          </Button>
        </div>
      </AdminCard>
    </div>
  )
}
