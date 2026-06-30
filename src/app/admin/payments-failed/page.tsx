'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { CLASSES } from '@/lib/constants'
import type { Booking, Child, Profile } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'
import { AdminSpinner, AdminBanner, EmptyState, Button, AdminCard } from '@/components/admin'

type PaymentFailedRow = {
  id: string
  parentName: string
  childName: string
  classType: ClassType
  amount: number
  flaggedAt: string
}

export default function PaymentsFailedPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [childrenMap, setChildrenMap] = useState<Map<string, Child>>(new Map())
  const [profilesMap, setProfilesMap] = useState<Map<string, Profile>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()

      const bookingsRes = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'payment_failed')
        .order('created_at', { ascending: false })

      if (bookingsRes.error) throw new Error(bookingsRes.error.message)

      const bookingsList = (bookingsRes.data || []) as Booking[]
      setBookings(bookingsList)

      const childIds = [...new Set(bookingsList.map(b => b.child_id))]
      const parentIds = [...new Set(bookingsList.map(b => b.parent_id))]

      let childrenData: Child[] = []
      let profilesData: Profile[] = []

      if (childIds.length > 0) {
        const childRes = await supabase
          .from('children')
          .select('*')
          .in('id', childIds)
        if (childRes.error) throw new Error(childRes.error.message)
        childrenData = (childRes.data || []) as Child[]
      }

      if (parentIds.length > 0) {
        const profileRes = await supabase
          .from('profiles')
          .select('*')
          .in('id', parentIds)
        if (profileRes.error) throw new Error(profileRes.error.message)
        profilesData = (profileRes.data || []) as Profile[]
      }

      setChildrenMap(new Map(childrenData.map(c => [c.id, c])))
      setProfilesMap(new Map(profilesData.map(p => [p.id, p])))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAction = async (bookingId: string, action: 'retry' | 'cancel') => {
    setActionLoading(bookingId)
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/payments-failed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bookingId, action }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Action failed')
      }

      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const rows: PaymentFailedRow[] = bookings.map(b => ({
    id: b.id,
    parentName: profilesMap.get(b.parent_id)?.full_name || 'Unknown',
    childName: childrenMap.get(b.child_id)?.name || 'Unknown',
    classType: b.class_type as ClassType,
    amount: b.amount_paid_pence,
    flaggedAt: b.created_at,
  }))

  if (loading) {
    return <AdminSpinner className="py-12" />
  }

  if (error) {
    return (
      <AdminBanner tone="error">
        {error}
      </AdminBanner>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState title="No failed payments" description="No bookings with failed payments." />
    )
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-charcoal-light/10 bg-charcoal-light/5">
            <th className="px-6 py-4 text-left font-heading text-sm font-600 text-charcoal-light">
              Parent
            </th>
            <th className="px-6 py-4 text-left font-heading text-sm font-600 text-charcoal-light">
              Child
            </th>
            <th className="px-6 py-4 text-left font-heading text-sm font-600 text-charcoal-light">
              Class
            </th>
            <th className="px-6 py-4 text-left font-heading text-sm font-600 text-charcoal-light">
              Amount
            </th>
            <th className="px-6 py-4 text-left font-heading text-sm font-600 text-charcoal-light">
              Flagged
            </th>
            <th className="px-6 py-4 text-right font-heading text-sm font-600 text-charcoal-light">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const classMeta = CLASSES[row.classType]
            const className = classMeta?.name || row.classType
            return (
              <tr key={row.id} className="border-b border-charcoal-light/10 hover:bg-charcoal-light/2">
                <td className="px-6 py-4 text-sm text-charcoal-light">{row.parentName}</td>
                <td className="px-6 py-4 text-sm text-charcoal-light">{row.childName}</td>
                <td className="px-6 py-4 text-sm text-charcoal-light">{className}</td>
                <td className="px-6 py-4 text-sm font-600 text-charcoal-light">
                  £{(row.amount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-light">
                  {new Date(row.flaggedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleAction(row.id, 'retry')}
                      disabled={actionLoading === row.id}
                      size="sm"
                      loading={actionLoading === row.id}
                    >
                      Resend Link
                    </Button>
                    <Button
                      onClick={() => handleAction(row.id, 'cancel')}
                      disabled={actionLoading === row.id}
                      variant="secondary"
                      size="sm"
                      loading={actionLoading === row.id}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </AdminCard>
  )
}
