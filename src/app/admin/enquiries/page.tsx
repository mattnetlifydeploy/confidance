'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { SchoolEnquiry, EnquiryStatus } from '@/lib/schools-schema'
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from '@/lib/schools-schema'

export default function EnquiriesPage() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<SchoolEnquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<SchoolEnquiry | null>(null)
  const [editStatus, setEditStatus] = useState<EnquiryStatus | ''>('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEnquiries()
  }, [statusFilter])

  const loadEnquiries = async () => {
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
      const url = new URL('/api/admin/enquiries', window.location.origin)
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter)
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load enquiries')
      }

      const { enquiries: data } = await res.json()
      setEnquiries(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setEnquiries([])
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (enquiry: SchoolEnquiry) => {
    setSelectedEnquiry(enquiry)
    setEditStatus(enquiry.status)
    setEditNotes(enquiry.admin_notes || '')
    setError(null)
    setSuccess(null)
  }

  const closeDetails = () => {
    setSelectedEnquiry(null)
    setEditStatus('')
    setEditNotes('')
  }

  const handleSaveEnquiry = async () => {
    if (!selectedEnquiry) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const payload: { status?: EnquiryStatus; adminNotes?: string | null } = {}
      if (editStatus && editStatus !== selectedEnquiry.status) {
        payload.status = editStatus as EnquiryStatus
      }
      if (editNotes !== (selectedEnquiry.admin_notes || '')) {
        payload.adminNotes = editNotes || null
      }

      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update enquiry')
      }

      setSuccess('Enquiry updated')
      await loadEnquiries()
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
          <h2 className="font-heading text-xl font-bold text-navy">School Enquiries</h2>
          <p className="mt-2 text-sm text-charcoal/60">Manage all school enquiries and follow-ups</p>
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
            All ({enquiries.length})
          </button>
          {ENQUIRY_STATUSES.map((status) => {
            const count = enquiries.filter((e) => e.status === status).length
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
                {ENQUIRY_STATUS_LABELS[status]} ({count})
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="mt-6 flex justify-center py-8 text-sm text-charcoal/60">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="mt-6 flex justify-center py-8">
            <div className="text-center text-sm text-charcoal/60">
              <p>No enquiries yet. Share your For Schools page to receive enquiries.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {enquiries.map((enquiry) => (
              <button
                key={enquiry.id}
                onClick={() => openDetails(enquiry)}
                className="w-full rounded-lg border border-charcoal/10 p-4 text-left transition-colors hover:bg-pale/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-navy">{enquiry.school_name}</p>
                    <p className="mt-1 text-sm text-charcoal/70">
                      {enquiry.contact_name}
                      {enquiry.contact_email ? ` • ${enquiry.contact_email}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/50">
                      {new Date(enquiry.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium shrink-0 ${
                    enquiry.status === 'new' ? 'bg-info/20 text-info' :
                    enquiry.status === 'contacted' ? 'bg-warning/20 text-warning' :
                    enquiry.status === 'interested' ? 'bg-teal/20 text-teal' :
                    enquiry.status === 'signed' ? 'bg-success/20 text-success' :
                    'bg-charcoal/10 text-charcoal/60'
                  }`}>
                    {ENQUIRY_STATUS_LABELS[enquiry.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card-bezel w-full max-w-2xl rounded-3xl bg-white p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-heading text-lg font-bold text-navy">{selectedEnquiry.school_name}</h3>
              <button
                onClick={closeDetails}
                className="text-charcoal/60 hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-charcoal/60 uppercase">Contact name</p>
                <p className="mt-1 text-charcoal">{selectedEnquiry.contact_name}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-charcoal/60 uppercase">Email</p>
                <p className="mt-1 text-charcoal">{selectedEnquiry.contact_email}</p>
              </div>

              {selectedEnquiry.contact_phone && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Phone</p>
                  <p className="mt-1 text-charcoal">{selectedEnquiry.contact_phone}</p>
                </div>
              )}

              {selectedEnquiry.school_type && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">School type</p>
                  <p className="mt-1 text-charcoal">{selectedEnquiry.school_type}</p>
                </div>
              )}

              {selectedEnquiry.estimated_students !== null && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Estimated students</p>
                  <p className="mt-1 text-charcoal">{selectedEnquiry.estimated_students}</p>
                </div>
              )}

              {selectedEnquiry.preferred_days_times && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Preferred days/times</p>
                  <p className="mt-1 text-charcoal">{selectedEnquiry.preferred_days_times}</p>
                </div>
              )}

              {selectedEnquiry.notes && (
                <div>
                  <p className="text-xs font-medium text-charcoal/60 uppercase">Notes</p>
                  <p className="mt-1 text-charcoal">{selectedEnquiry.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-charcoal/10 pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                  className="mt-2 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ENQUIRY_STATUS_LABELS[status]}
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
                  placeholder="Add any internal notes about this enquiry..."
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
                onClick={handleSaveEnquiry}
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
