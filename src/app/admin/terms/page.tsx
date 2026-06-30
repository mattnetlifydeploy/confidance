'use client'

import { useState, useEffect, useCallback } from 'react'
import { TERMS, getCurrentTerm, getNextTerm, getTermSessionDates } from '@/lib/constants'
import { getSupabase } from '@/lib/supabase'
import {
  AdminCard,
  AdminPageHeader,
  Button,
  ConfirmDialog,
  FormField,
  Input,
  StatusBadge,
  useToast,
} from '@/components/admin'

type TermExclusion = {
  id: string
  term_name: string
  term_year: number
  exclusion_date: string
  reason: string | null
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function TermsPage() {
  const toast = useToast()
  const current = getCurrentTerm()
  const next = getNextTerm()
  const todayIso = new Date().toISOString().slice(0, 10)

  const [exclusions, setExclusions] = useState<TermExclusion[]>([])
  const [loadingExclusions, setLoadingExclusions] = useState(true)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [addingExclusionFor, setAddingExclusionFor] = useState<string | null>(null)
  const [newExclusionForm, setNewExclusionForm] = useState({ date: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<TermExclusion | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadExclusions = useCallback(async () => {
    try {
      setLoadingExclusions(true)
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('term_exclusions')
        .select('*')
        .order('exclusion_date', { ascending: true })

      if (error) throw error
      setExclusions(data || [])
    } catch (err) {
      console.error('Failed to load exclusions:', err)
    } finally {
      setLoadingExclusions(false)
    }
  }, [])

  useEffect(() => {
    loadExclusions()
  }, [loadExclusions])

  const handleAddExclusion = async (termName: string, termYear: number) => {
    if (!newExclusionForm.date) {
      toast.error('Please select a date')
      return
    }

    try {
      setSaving(true)
      const { data: session } = await getSupabase().auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/term-exclusions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          term_name: termName,
          term_year: termYear,
          exclusion_date: newExclusionForm.date,
          reason: newExclusionForm.reason || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to add exclusion')
      }

      toast.success('Exclusion added')
      setNewExclusionForm({ date: '', reason: '' })
      setAddingExclusionFor(null)
      await loadExclusions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add exclusion')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExclusion = async () => {
    if (!pendingDelete) return
    try {
      setDeleting(true)
      const { data: session } = await getSupabase().auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/term-exclusions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ id: pendingDelete.id }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete exclusion')
      }

      toast.success('Exclusion removed')
      setPendingDelete(null)
      await loadExclusions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete exclusion')
    } finally {
      setDeleting(false)
    }
  }

  const getTermExclusions = (termName: string, termYear: number) =>
    exclusions.filter((e) => e.term_name === termName && e.term_year === termYear)

  const termKey = (t: (typeof TERMS)[number]) => `${t.year}-${t.name}`

  return (
    <div className="mt-6 space-y-4">
      <AdminCard>
        <AdminPageHeader
          eyebrow="Schedule"
          title="Terms"
          description="Term schedule from 2026 to 2029. Highlighted: current and next. Add per-term excluded dates below."
        />
      </AdminCard>

      <div className="space-y-3">
        {TERMS.map((t) => {
          const isCurrent = t.name === current.name && t.year === current.year
          const isNext = next && t.name === next.name && t.year === next.year
          const isPast = t.endDate < todayIso
          const sessionDates = getTermSessionDates(t)
          const upcomingCount = sessionDates.filter((d) => d >= todayIso).length
          const termExclusions = getTermExclusions(t.name, t.year)
          const isExpanded = expandedTerm === termKey(t)

          return (
            <div
              key={termKey(t)}
              className={`card-bezel rounded-3xl p-6 ${
                isCurrent
                  ? 'bg-teal/10 ring-2 ring-teal'
                  : isNext
                  ? 'bg-navy-light/10 ring-2 ring-navy-light'
                  : isPast
                  ? 'bg-cream/50 opacity-70'
                  : 'bg-white'
              }`}
            >
              <button
                onClick={() => setExpandedTerm(isExpanded ? null : termKey(t))}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-navy">
                      {t.name} {t.year}
                    </h3>
                    <p className="text-sm text-charcoal-light">
                      {formatDate(t.startDate)} to {formatDate(t.endDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isCurrent && <StatusBadge label="Current" tone="teal" />}
                    {isNext && <StatusBadge label="Next" tone="info" />}
                    <StatusBadge label={`${sessionDates.length} sessions`} tone="neutral" />
                    {!isPast && (
                      <StatusBadge label={`${upcomingCount} upcoming`} tone="neutral" />
                    )}
                    {termExclusions.length > 0 && (
                      <StatusBadge label={`${termExclusions.length} excluded`} tone="warning" />
                    )}
                  </div>
                </div>
              </button>

              {t.noClassDates.length > 0 && (
                <p className="mt-3 text-xs text-charcoal-light">
                  Hardcoded holidays: {t.noClassDates.map(formatDate).join(', ')}
                </p>
              )}

              {isExpanded && (
                <div className="mt-6 space-y-4 border-t border-charcoal/10 pt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal">Excluded dates</h4>
                    {loadingExclusions ? (
                      <p className="mt-2 text-xs text-charcoal-light">Loading...</p>
                    ) : termExclusions.length === 0 ? (
                      <p className="mt-2 text-xs text-charcoal-light">None yet</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {termExclusions.map((exc) => (
                          <div
                            key={exc.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-white/50 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-charcoal">
                                {formatDate(exc.exclusion_date)}
                              </p>
                              {exc.reason && (
                                <p className="text-xs text-charcoal-light">{exc.reason}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error hover:bg-error/5"
                              onClick={() => setPendingDelete(exc)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-charcoal/10 pt-4">
                    {addingExclusionFor === termKey(t) ? (
                      <div className="space-y-3">
                        <FormField label="Date">
                          <Input
                            type="date"
                            value={newExclusionForm.date}
                            onChange={(e) =>
                              setNewExclusionForm({ ...newExclusionForm, date: e.target.value })
                            }
                          />
                        </FormField>
                        <FormField label="Reason" hint="Optional">
                          <Input
                            type="text"
                            value={newExclusionForm.reason}
                            onChange={(e) =>
                              setNewExclusionForm({ ...newExclusionForm, reason: e.target.value })
                            }
                            placeholder="e.g. Bank holiday, venue unavailable"
                          />
                        </FormField>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={saving}
                            onClick={() => handleAddExclusion(t.name, t.year)}
                          >
                            Add
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={saving}
                            onClick={() => {
                              setAddingExclusionFor(null)
                              setNewExclusionForm({ date: '', reason: '' })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingExclusionFor(termKey(t))}
                      >
                        + Add excluded date
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove excluded date"
        message={
          pendingDelete
            ? `Remove ${formatDate(pendingDelete.exclusion_date)} from this term's exclusions?`
            : undefined
        }
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDeleteExclusion}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
