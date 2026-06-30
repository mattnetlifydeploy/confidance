'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, getCurrentTerm, getTermSessionDates } from '@/lib/constants'
import type { ClassType } from '@/lib/constants'
import { AdminSpinner, AdminPageHeader, AdminCard, StatusBadge, statusTone, AdminBanner, EmptyState } from '@/components/admin'

type RosterChild = {
  childId: string
  childName: string
  parentName: string
  parentPhone: string | null
  parentEmail: string | null
  status: string
}

export default function CheckInPage() {
  const [term] = useState(getCurrentTerm())
  const [classType, setClassType] = useState<ClassType>('baby-boogie')
  const [sessionDate, setSessionDate] = useState<string>('')
  const [sessionDates, setSessionDates] = useState<string[]>([])

  const [roster, setRoster] = useState<RosterChild[]>([])
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dates = getTermSessionDates(term)
    setSessionDates(dates)

    if (dates.length > 0) {
      const today = new Date().toISOString().slice(0, 10)
      const todayDate = dates.find(d => d === today)
      const nextDate = dates.find(d => d > today)
      const lastDate = dates[dates.length - 1]

      setSessionDate(todayDate || nextDate || lastDate)
    }
  }, [term])

  const loadRosterAndAttendance = useCallback(async () => {
    if (!sessionDate) return

    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const bookingsRes = await supabase
        .from('bookings')
        .select('id, child_id, parent_id, status')
        .eq('booking_type', 'term')
        .eq('class_type', classType)
        .eq('term_name', term.name)
        .eq('term_year', term.year)
        .in('status', ['pending', 'confirmed'])

      if (bookingsRes.error) throw bookingsRes.error

      const childIds = (bookingsRes.data || []).map(b => b.child_id)
      const parentIds = (bookingsRes.data || []).map(b => b.parent_id)
      const statusMap = new Map(
        (bookingsRes.data || []).map(b => [b.child_id, b.status]),
      )

      const childrenRes = await supabase
        .from('children')
        .select('id, name')
        .in('id', childIds)

      const profilesRes = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', parentIds)

      if (childrenRes.error) throw childrenRes.error
      if (profilesRes.error) throw profilesRes.error

      const childrenMap = new Map(
        (childrenRes.data || []).map(c => [c.id, c]),
      )
      const profilesMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p]),
      )

      const rosterList = (bookingsRes.data || [])
        .map((booking) => {
          const child = childrenMap.get(booking.child_id)
          const parent = profilesMap.get(booking.parent_id)

          if (!child || !parent) return null

          return {
            childId: booking.child_id,
            childName: child.name,
            parentName: parent.full_name,
            parentPhone: parent.phone,
            parentEmail: null,
            status: statusMap.get(booking.child_id) || 'unknown',
          } as const
        })
        .filter((r) => r !== null)
        .map((r) => ({
          childId: r.childId,
          childName: r.childName,
          parentName: r.parentName,
          parentPhone: r.parentPhone,
          parentEmail: r.parentEmail,
          status: r.status,
        }))
        .sort((a, b) => a.childName.localeCompare(b.childName))

      setRoster(rosterList)

      const attendanceRes = await supabase
        .from('attendance')
        .select('child_id')
        .eq('session_date', sessionDate)
        .eq('class_type', classType)

      if (attendanceRes.error) throw attendanceRes.error

      setCheckedInIds(
        new Set((attendanceRes.data || []).map(a => a.child_id)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster')
    } finally {
      setLoading(false)
    }
  }, [sessionDate, classType, term])

  useEffect(() => {
    loadRosterAndAttendance()
  }, [loadRosterAndAttendance])

  const handleToggleCheckIn = async (
    childId: string,
    isChecking: boolean,
  ) => {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError('Not authenticated')
      return
    }

    const optimisticIds = new Set(checkedInIds)
    if (isChecking) {
      optimisticIds.add(childId)
    } else {
      optimisticIds.delete(childId)
    }
    setCheckedInIds(optimisticIds)

    try {
      const method = isChecking ? 'POST' : 'DELETE'
      const url = isChecking
        ? '/api/admin/attendance'
        : `/api/admin/attendance?childId=${childId}&sessionDate=${sessionDate}&classType=${classType}`

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        ...(isChecking && {
          body: JSON.stringify({
            childId,
            sessionDate,
            classType,
          }),
        }),
      })

      if (!res.ok) {
        const errorData = (await res.json()) as { error: string }
        throw new Error(errorData.error || 'Failed to update attendance')
      }
    } catch (err) {
      const prevIds = new Set(checkedInIds)
      if (isChecking) {
        prevIds.delete(childId)
      } else {
        prevIds.add(childId)
      }
      setCheckedInIds(prevIds)
      setError(err instanceof Error ? err.message : 'Failed to update attendance')

      setTimeout(() => setError(null), 4000)
    }
  }

  const formattedDateLong = sessionDate
    ? new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(sessionDate + 'T00:00:00Z'))
    : ''

  const checkedInCount = checkedInIds.size
  const rosterCount = roster.length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Check-in"
        description="Pick a class and date, tick children as they arrive."
      />

      <AdminCard className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-600 text-charcoal-light mb-1">
            Class
          </label>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value as ClassType)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          >
            {Object.entries(CLASSES).map(([key, cls]) => (
              <option key={key} value={key}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-600 text-charcoal-light mb-1">
            Date
          </label>
          <select
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          >
            {sessionDates.map((date) => {
              const formatted = new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }).format(new Date(date + 'T00:00:00Z'))
              return (
                <option key={date} value={date}>
                  {formatted}
                </option>
              )
            })}
          </select>
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-6">
          <h3 className="font-heading text-lg font-semibold">
            {CLASSES[classType].name} . {formattedDateLong}
          </h3>
          <p className="mt-1 text-sm text-charcoal-light">
            {checkedInCount} of {rosterCount} checked in
          </p>
        </div>

        {error && (
          <AdminBanner tone="error" className="mb-4">
            {error}
          </AdminBanner>
        )}

        {loading ? (
          <AdminSpinner className="py-8" />
        ) : rosterCount === 0 ? (
          <EmptyState title="No bookings yet" description="No bookings for this class in this term yet." />
        ) : (
          <div className="space-y-0">
            {roster.map((child) => {
              const isCheckedIn = checkedInIds.has(child.childId)
              const contactInfo =
                child.parentPhone || child.parentEmail || 'No contact'

              return (
                <div
                  key={child.childId}
                  className={`flex items-start gap-4 border-b border-border last:border-0 py-3 ${
                    isCheckedIn ? 'bg-teal/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isCheckedIn}
                    onChange={(e) =>
                      handleToggleCheckIn(child.childId, e.target.checked)
                    }
                    className="mt-1 h-5 w-5 rounded border-2 border-border text-teal focus:ring-teal cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-600 ${
                        isCheckedIn ? 'line-through text-charcoal-light' : ''
                      }`}
                    >
                      {child.childName}
                    </div>
                    <div className="mt-0.5 text-xs text-charcoal-light">
                      {child.parentName} . {contactInfo}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge
                      label={child.status === 'confirmed' ? 'Paid' : 'Unpaid'}
                      status={child.status}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AdminCard>
    </div>
  )
}
