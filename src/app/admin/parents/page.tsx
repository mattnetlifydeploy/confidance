'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { ParentInterest, ParentInterestStatus } from '@/lib/parent-interests-schema'
import { PARENT_INTEREST_STATUSES, PARENT_INTEREST_STATUS_LABELS } from '@/lib/parent-interests-schema'

export default function ParentsPage() {
  const router = useRouter()
  const [interests, setInterests] = useState<ParentInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<ParentInterestStatus | 'all'>('all')
  const [selected, setSelected] = useState<ParentInterest | null>(null)
  const [editStatus, setEditStatus] = useState<ParentInterestStatus | ''>('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadInterests()
  }, [statusFilter])

  const loadInterests = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const token = session.access_token
      const url = new URL('/api/admin/parents', window.location.origin)
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter)
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load parent interest')
      }

      const { interests: data } = await res.json()
      setInterests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setInterests([])
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (interest: ParentInterest) => {
    setSelected(interest)
    setEditStatus(interest.status)
    setEditNotes(interest.admin_notes || '')
    setError(null)
    setSuccess(null)
  }

  const closeDetails = () => {
    setSelected(null)
    setEditStatus('')
    setEditNotes('')
  }

  const handleSave = async () => {
    if (!selected) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const payload: { status?: ParentInterestStatus; adminNotes?: string | null } = {}
      if (editStatus && editStatus !== selected.status) {
        payload.status = editStatus as ParentInterestStatus
      }
      if (editNotes !== (selected.admin_notes || '')) {
        payload.adminNotes = editNotes || null
      }

      const res = await fetch(`/api/admin/parents/${selected.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update parent interest')
      }

      setSuccess('Parent interest updated')
      await loadInterests()
      closeDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-bezel rounded-3xl bg-white p-8">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Parent Interest</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Parents who registered interest in bringing Confidance to their school
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 border-b border-charcoal/10 pb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-teal text-white'
                : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
            }`}
          >
            All ({interests.length})
          </button>
          {PARENT_INTEREST_STATUSES.map((status) => {
            const count = interests.filter((i) => i.status === status).length
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-teal text-white'
                    : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                }`}
              >
                {PARENT_INTEREST_STATUS_LABELS[status]} ({count})
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="mt-6 flex justify-center py-8 text-sm text-charcoal/60">Loading parent interest...</div>
        ) : interests.length === 0 ? (
          <div className="mt-6 flex justify-center py-8">
            <div className="text-center text-sm text-charcoal/60">
              <p>No parent interest yet. Share your register-interest page to start collecting.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => openDetails(interest)}
                className="w-full rounded-lg border border-charcoal/10 p-4 text-left transition-colors hover:bg-pale/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-navy">{interest.parent_name}</p>
                    <p className="mt-1 text-sm text-charcoal/70">
                      {interest.parent_email}
                      {interest.preferred_school ? ` • ${interest.preferred_school}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/50">
                      {new Date(interest.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium shrink-0 ${
                    interest.status === 'new' ? 'bg-info/20 text-info' :
                    interest.status === 'contacted' ? 'bg-warning/20 text-warning' :
                    interest.status === 'interested' ? 'bg-teal/20 text-teal' :
                    interest.status === 'signed' ? 'bg-success/20 text-success' :
                    'bg-charcoal/10 text-charcoal/60'
                  }`}>
                    {PARENT_INTEREST_STATUS_LABELS[interest.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card-bezel w-full max-w-2xl rounded-3xl bg-white p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-heading text-lg font-bold text-navy">{selected.parent_name}</h3>
              <button
                onClick={closeDetails}
                className="text-charcoal/60 hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-charcoal/60 uppercase">Email</p>
                <p className="mt-1 text-charcoal">{selected.parent_email}</p>
              </div>

              {selected.parent_phone && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Phone</p>
                  <p className="mt-1 text-charcoal">{selected.parent_phone}</p>
                </div>
              )}

              {selected.preferred_school && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">School</p>
                  <p className="mt-1 text-charcoal">{selected.preferred_school}</p>
                </div>
              )}

              {selected.postcode && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Postcode</p>
                  <p className="mt-1 text-charcoal">{selected.postcode}</p>
                </div>
              )}

              {selected.child_year_group && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Year group / age</p>
                  <p className="mt-1 text-charcoal">{selected.child_year_group}</p>
                </div>
              )}

              {selected.message && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Message</p>
                  <p className="mt-1 text-charcoal whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-charcoal/10 pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ParentInterestStatus)}
                  className="mt-2 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  {PARENT_INTEREST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {PARENT_INTEREST_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal">Admin notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  maxLength={5000}
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Add any internal notes about this parent..."
                />
                <p className="mt-1 text-xs text-charcoal/50">{editNotes.length} / 5000</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
            )}
            {success && (
              <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary rounded-lg px-6 py-2 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={closeDetails}
                className="btn-secondary rounded-lg px-6 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
