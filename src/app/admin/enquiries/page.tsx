'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { SchoolEnquiry, EnquiryStatus } from '@/lib/schools-schema'
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from '@/lib/schools-schema'
import {
  AdminCard,
  AdminPageHeader,
  FilterTabs,
  AdminSpinner,
  EmptyState,
  Modal,
  Button,
  FormField,
  Select,
  Textarea,
  StatusBadge,
} from '@/components/admin'

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

  const filterOptions = [
    {
      value: 'all',
      label: 'All',
      count: enquiries.length,
    },
    ...ENQUIRY_STATUSES.map((status) => ({
      value: status,
      label: ENQUIRY_STATUS_LABELS[status],
      count: enquiries.filter((e) => e.status === status).length,
    })),
  ]

  return (
    <div className="space-y-6">
      <AdminCard>
        <AdminPageHeader
          title="School Enquiries"
          description="Manage all school enquiries and follow-ups"
        />

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        <div className="mt-6 border-b border-charcoal/10 pb-4">
          <FilterTabs options={filterOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as EnquiryStatus | 'all')} />
        </div>

        <div className="mt-6">
          {loading ? (
            <AdminSpinner />
          ) : enquiries.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              description="Share your For Schools page to receive enquiries."
            />
          ) : (
            <div className="space-y-3">
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
                    <StatusBadge
                      label={ENQUIRY_STATUS_LABELS[enquiry.status]}
                      status={enquiry.status}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </AdminCard>

      <Modal
        open={!!selectedEnquiry}
        onClose={closeDetails}
        title={selectedEnquiry?.school_name}
        size="lg"
        footer={
          <>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSaveEnquiry}
            >
              Save changes
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={closeDetails}
              disabled={saving}
            >
              Close
            </Button>
          </>
        }
      >
        {selectedEnquiry && (
          <>
            <div className="space-y-4">
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
              <FormField label="Status">
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                >
                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ENQUIRY_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Admin notes" hint={`${editNotes.length} / 5000`}>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  maxLength={5000}
                  rows={5}
                  placeholder="Add any internal notes about this enquiry..."
                />
              </FormField>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
            )}
            {success && (
              <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
