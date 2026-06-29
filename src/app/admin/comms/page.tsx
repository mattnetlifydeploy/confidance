'use client'

import { useState, useEffect, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, TERMS } from '@/lib/constants'
import type { AdminMessagesLog } from '@/lib/database.types'

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

  const [messages, setMessages] = useState<AdminMessagesLog[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'banner'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    const loadMessages = async () => {
      setMessagesLoading(true)
      try {
        const supabase = getSupabase()
        let query = supabase
          .from('admin_messages_log')
          .select('*')
          .order('sent_at', { ascending: false })

        if (channelFilter !== 'all') {
          query = query.eq('channel', channelFilter)
        }

        if (fromDate) {
          query = query.gte('sent_at', new Date(fromDate).toISOString())
        }

        if (toDate) {
          const endOfDay = new Date(toDate)
          endOfDay.setHours(23, 59, 59, 999)
          query = query.lte('sent_at', endOfDay.toISOString())
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)
        setMessages((data || []) as AdminMessagesLog[])
      } catch (err) {
        console.error('Failed to load messages:', err)
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [channelFilter, fromDate, toDate])

  const formatDeliveryStatus = (status: Record<string, unknown>) => {
    const entries = Object.entries(status || {})
    if (entries.length === 0) return 'Pending'
    return entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
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

      {/* Messages Log Card */}
      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Messages Log</h2>
        <p className="mt-2 text-sm text-warm-gray">
          View all sent emails and banners with delivery status
        </p>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Channel</label>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as 'all' | 'email' | 'banner')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                <option value="all">All channels</option>
                <option value="email">Email</option>
                <option value="banner">Banner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
          </div>

          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-warm-gray">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-warm-gray">No messages found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium">Sent at</th>
                    <th className="text-left px-4 py-2 font-medium">Channel</th>
                    <th className="text-left px-4 py-2 font-medium">Subject</th>
                    <th className="text-left px-4 py-2 font-medium">Count</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(msg.sent_at).toLocaleDateString('en-GB', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          msg.channel === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {msg.channel}
                        </span>
                      </td>
                      <td className="px-4 py-2 truncate max-w-xs">{msg.subject || 'N/A'}</td>
                      <td className="px-4 py-2">{msg.recipient_count || '—'}</td>
                      <td className="px-4 py-2 text-xs">
                        {formatDeliveryStatus(msg.delivery_status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
