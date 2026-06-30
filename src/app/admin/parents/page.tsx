'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { ParentInterest, ParentInterestStatus } from '@/lib/parent-interests-schema'
import { PARENT_INTEREST_STATUSES, PARENT_INTEREST_STATUS_LABELS } from '@/lib/parent-interests-schema'
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

  const filterOptions = [
    {
      value: 'all',
      label: 'All',
      count: interests.length,
    },
    ...PARENT_INTEREST_STATUSES.map((status) => ({
      value: status,
      label: PARENT_INTEREST_STATUS_LABELS[status],
      count: interests.filter((i) => i.status === status).length,
    })),
  ]

  return (
    <div className="space-y-6">
      <AdminCard>
        <AdminPageHeader
          title="Parent Interest"
          description="Parents who registered interest in bringing Confidance to their school"
        />

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        <div className="mt-6 border-b border-charcoal/10 pb-4">
          <FilterTabs options={filterOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as ParentInterestStatus | 'all')} />
        </div>

        <div className="mt-6">
          {loading ? (
            <AdminSpinner />
          ) : interests.length === 0 ? (
            <EmptyState
              title="No parent interest yet"
              description="Share your register-interest page to start collecting."
            />
          ) : (
            <div className="space-y-3">
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
                    <StatusBadge
                      label={PARENT_INTEREST_STATUS_LABELS[interest.status]}
                      status={interest.status}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </AdminCard>

      <Modal
        open={!!selected}
        onClose={closeDetails}
        title={selected?.parent_name}
        size="lg"
        footer={
          <>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSave}
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
        {selected && (
          <>
            <div className="space-y-4">
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
              <FormField label="Status">
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ParentInterestStatus)}
                >
                  {PARENT_INTEREST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {PARENT_INTEREST_STATUS_LABELS[status]}
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
                  placeholder="Add any internal notes about this parent..."
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
