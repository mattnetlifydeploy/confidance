'use client'

import { useState, useEffect, useCallback } from 'react'
import { TERMS, getCurrentTerm, getNextTerm, getTermSessionDates } from '@/lib/constants'
import { getSupabase } from '@/lib/supabase'

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
  const current = getCurrentTerm()
  const next = getNextTerm()
  const todayIso = new Date().toISOString().slice(0, 10)

  const [exclusions, setExclusions] = useState<TermExclusion[]>([])
  const [loadingExclusions, setLoadingExclusions] = useState(true)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [addingExclusionFor, setAddingExclusionFor] = useState<string | null>(null)
  const [newExclusionForm, setNewExclusionForm] = useState({ date: '', reason: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      setMessage({ type: 'error', text: 'Please select a date' })
      return
    }

    try {
      const { data: session } = await getSupabase().auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/term-exclusions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
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

      setMessage({ type: 'success', text: 'Exclusion added' })
      setNewExclusionForm({ date: '', reason: '' })
      setAddingExclusionFor(null)
      await loadExclusions()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add exclusion',
      })
    }
  }

  const handleDeleteExclusion = async (exclusionId: string) => {
    try {
      const { data: session } = await getSupabase().auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/term-exclusions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ id: exclusionId }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete exclusion')
      }

      setMessage({ type: 'success', text: 'Exclusion removed' })
      await loadExclusions()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete exclusion',
      })
    }
  }

  const getTermExclusions = (termName: string, termYear: number) =>
    exclusions.filter((e) => e.term_name === termName && e.term_year === termYear)

  const termKey = (t: any) => `${t.year}-${t.name}`

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Terms</h2>
        <p className="mt-1 text-sm text-warm-gray">
          Term schedule from 2026 to 2029. Highlighted: current and next.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-3xl px-6 py-4 shadow-sm card-glow ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

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
              className={`rounded-3xl p-6 shadow-sm card-glow ${
                isCurrent
                  ? 'bg-coral/10 ring-2 ring-coral'
                  : isNext
                  ? 'bg-lilac/10 ring-2 ring-lilac'
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
                    <h3 className="font-heading text-lg font-bold">
                      {t.name} {t.year}
                    </h3>
                    <p className="text-sm text-warm-gray">
                      {formatDate(t.startDate)} to {formatDate(t.endDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isCurrent && (
                      <span className="rounded-full bg-coral px-3 py-1 text-xs font-600 text-white">
                        Current
                      </span>
                    )}
                    {isNext && (
                      <span className="rounded-full bg-lilac px-3 py-1 text-xs font-600 text-white">
                        Next
                      </span>
                    )}
                    <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-600 text-warm-gray">
                      {sessionDates.length} sessions
                    </span>
                    {!isPast && (
                      <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-600 text-warm-gray">
                        {upcomingCount} upcoming
                      </span>
                    )}
                    {termExclusions.length > 0 && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-600 text-orange-700">
                        {termExclusions.length} excluded
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {t.noClassDates.length > 0 && (
                <p className="mt-3 text-xs text-warm-gray">
                  Hardcoded holidays: {t.noClassDates.map(formatDate).join(', ')}
                </p>
              )}

              {isExpanded && (
                <div className="mt-6 space-y-4 border-t border-border pt-4">
                  <div>
                    <h4 className="font-semibold text-sm">Excluded dates</h4>
                    {loadingExclusions ? (
                      <p className="mt-2 text-xs text-warm-gray">Loading...</p>
                    ) : termExclusions.length === 0 ? (
                      <p className="mt-2 text-xs text-warm-gray">None yet</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {termExclusions.map((exc) => (
                          <div
                            key={exc.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-white/50 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium">{formatDate(exc.exclusion_date)}</p>
                              {exc.reason && <p className="text-xs text-warm-gray">{exc.reason}</p>}
                            </div>
                            <button
                              onClick={() => handleDeleteExclusion(exc.id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-sm">
                      {addingExclusionFor === termKey(t) ? 'Add exclusion' : 'Add new exclusion'}
                    </h4>
                    {addingExclusionFor === termKey(t) ? (
                      <div className="mt-3 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-warm-gray">Date</label>
                          <input
                            type="date"
                            value={newExclusionForm.date}
                            onChange={(e) =>
                              setNewExclusionForm({ ...newExclusionForm, date: e.target.value })
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-gray">
                            Reason (optional)
                          </label>
                          <input
                            type="text"
                            value={newExclusionForm.reason}
                            onChange={(e) =>
                              setNewExclusionForm({ ...newExclusionForm, reason: e.target.value })
                            }
                            placeholder="e.g. Bank holiday, venue unavailable"
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddExclusion(t.name, t.year)}
                            className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white hover:bg-coral/90"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddingExclusionFor(null)
                              setNewExclusionForm({ date: '', reason: '' })
                            }}
                            className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingExclusionFor(termKey(t))}
                        className="mt-2 text-xs font-semibold text-coral hover:text-coral/80"
                      >
                        + Add date
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
