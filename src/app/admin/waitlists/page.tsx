'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, ClassType } from '@/lib/constants'
import {
  AdminCard,
  AdminPageHeader,
  AdminSpinner,
  Button,
  ConfirmDialog,
  EmptyState,
  StatusBadge,
  useToast,
} from '@/components/admin'

type WaitlistEntry = {
  id: string
  position: number
  created_at: string
  notified_at: string | null
  expires_at: string | null
  parent_id: string
  child_id: string
  child_name: string
  parent_name: string
  parent_email: string
}

type GroupedWaitlists = {
  [key: string]: WaitlistEntry[]
}

type PendingAction = {
  type: 'promote' | 'remove'
  entry: WaitlistEntry
}

export default function WaitlistsPage() {
  const toast = useToast()
  const [waitlists, setWaitlists] = useState<GroupedWaitlists>({})
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [working, setWorking] = useState(false)

  const loadWaitlists = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('waitlists')
        .select(
          `id,
           position,
           created_at,
           notified_at,
           expires_at,
           parent_id,
           child_id,
           class_type,
           term_name,
           term_year,
           session_date,
           profiles!parent_id (full_name, email),
           children!child_id (name)`,
        )
        .order('class_type', { ascending: true })
        .order('term_name', { ascending: true })
        .order('term_year', { ascending: true })
        .order('position', { ascending: true })

      if (error) {
        console.error('Failed to load waitlists:', error)
        return
      }

      const grouped: GroupedWaitlists = {}

      ;(data as any[]).forEach((row) => {
        const key = `${row.class_type}|${row.term_name || 'any'}|${row.term_year || 'any'}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          id: row.id,
          position: row.position,
          created_at: row.created_at,
          notified_at: row.notified_at,
          expires_at: row.expires_at,
          parent_id: row.parent_id,
          child_id: row.child_id,
          child_name: row.children?.name || 'Unknown',
          parent_name: row.profiles?.full_name || 'Unknown',
          parent_email: row.profiles?.email || 'Unknown',
        })
      })

      setWaitlists(grouped)
    } catch (err) {
      console.error('Error loading waitlists:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWaitlists()
  }, [loadWaitlists])

  const runAction = async () => {
    if (!pending) return
    const { type, entry } = pending
    try {
      setWorking(true)
      const { data: session } = await getSupabase().auth.getSession()
      const token = session?.session?.access_token
      if (!token) throw new Error('Not authenticated')

      const res = await fetch(`/api/admin/waitlists/${entry.id}`, {
        method: type === 'promote' ? 'POST' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Action failed')
      }

      toast.success(type === 'promote' ? 'Promoted to a confirmed booking' : 'Removed from waitlist')
      setPending(null)
      await loadWaitlists()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6">
        <AdminSpinner />
      </div>
    )
  }

  const groups = Object.entries(waitlists)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Demand"
        title="Waitlists"
        description="People waiting for a space, grouped by class and term. Promote the next in line or remove an entry."
      />

      {groups.length === 0 ? (
        <EmptyState
          title="No waitlist entries"
          description="When classes fill up, parents who join the waitlist will appear here."
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([key, entries]) => {
            const [classType, termName, termYear] = key.split('|')
            const className = CLASSES[classType as ClassType]?.name || classType
            const displayTerm = termName === 'any' ? 'All Terms' : `${termName} ${termYear}`

            return (
              <AdminCard key={key} className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/10 px-6 py-4">
                  <h3 className="font-heading text-lg font-bold text-navy">
                    {className} . {displayTerm}
                  </h3>
                  <StatusBadge label={`${entries.length} waiting`} tone="teal" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-cream/60">
                      <tr>
                        {['#', 'Child', 'Parent', 'Email', 'Joined', 'Status', ''].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold text-charcoal-light"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const expired =
                          entry.expires_at && new Date(entry.expires_at) < new Date()
                        return (
                          <tr key={entry.id} className="border-b border-charcoal/5">
                            <td className="px-4 py-3 font-heading font-bold text-teal">
                              #{entry.position}
                            </td>
                            <td className="px-4 py-3 text-charcoal">{entry.child_name}</td>
                            <td className="px-4 py-3 text-charcoal">{entry.parent_name}</td>
                            <td className="px-4 py-3 text-xs text-charcoal-light">
                              {entry.parent_email}
                            </td>
                            <td className="px-4 py-3 text-xs text-charcoal-light">
                              {new Date(entry.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-4 py-3">
                              {entry.notified_at ? (
                                <StatusBadge
                                  label={expired ? 'Offer expired' : 'Notified'}
                                  tone={expired ? 'neutral' : 'warning'}
                                />
                              ) : (
                                <StatusBadge label="Waiting" tone="info" />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setPending({ type: 'promote', entry })}
                                >
                                  Promote
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-error hover:bg-error/5"
                                  onClick={() => setPending({ type: 'remove', entry })}
                                >
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        variant={pending?.type === 'remove' ? 'danger' : 'primary'}
        title={pending?.type === 'promote' ? 'Promote to booking' : 'Remove from waitlist'}
        message={
          pending?.type === 'promote'
            ? `Create a confirmed booking for ${pending?.entry.child_name} and remove them from the waitlist?`
            : `Remove ${pending?.entry.child_name} from the waitlist? This cannot be undone.`
        }
        confirmLabel={pending?.type === 'promote' ? 'Promote' : 'Remove'}
        loading={working}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
