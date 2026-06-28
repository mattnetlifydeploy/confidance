'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'

type WaiverRow = {
  id: string
  title: string
  body_md: string
  published_at: string
  created_at: string
}

export default function WaiversPage() {
  const [form, setForm] = useState({
    title: '',
    bodyMd: '',
    publishedAt: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [waivers, setWaivers] = useState<WaiverRow[]>([])
  const [waiversLoading, setWaiversLoading] = useState(true)

  // Fetch existing waivers
  const fetchWaivers = async () => {
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/waivers', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setWaivers(data.waivers || [])
      }
    } catch {
      // Silent fail by design
    } finally {
      setWaiversLoading(false)
    }
  }

  useEffect(() => {
    fetchWaivers()
  }, [])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.bodyMd.trim()) {
      setMessage({ type: 'error', text: 'Title and body required' })
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const publishedAt = form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined

      const res = await fetch('/api/admin/waivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: form.title,
          bodyMd: form.bodyMd,
          publishedAt,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to publish waiver')
      }

      setMessage({ type: 'success', text: 'Waiver published' })
      setForm({ title: '', bodyMd: '', publishedAt: '' })
      setTimeout(() => setMessage(null), 3000)

      // Refresh waiver list
      await fetchWaivers()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to publish waiver',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Publish Waiver Card */}
      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Publish Waiver</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Create or update waivers that parents must sign
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Waiver title (max 200 characters)"
              maxLength={200}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Body (Markdown)</label>
            <textarea
              value={form.bodyMd}
              onChange={(e) => setForm({ ...form, bodyMd: e.target.value })}
              placeholder="Waiver body in Markdown (max 20000 characters)"
              maxLength={20000}
              rows={8}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Publish Date (Optional)</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-warm-gray">Leave empty to publish immediately</p>
          </div>

          {message && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Waiver'}
          </button>
        </div>
      </div>

      {/* Waivers List */}
      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Published Waivers</h2>

        {waiversLoading ? (
          <p className="mt-4 text-sm text-warm-gray">Loading waivers...</p>
        ) : waivers.length === 0 ? (
          <p className="mt-4 text-sm text-warm-gray">No waivers published yet</p>
        ) : (
          <div className="mt-6 space-y-4">
            {waivers.map((waiver) => (
              <div
                key={waiver.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-heading text-sm font-bold">{waiver.title}</h3>
                <p className="mt-1 text-xs text-warm-gray">
                  Published {new Date(waiver.published_at).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
