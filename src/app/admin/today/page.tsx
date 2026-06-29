'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, getCurrentTerm } from '@/lib/constants'
import { getTermSessions } from '@/lib/term-sessions'
import type { Booking, WalkIn } from '@/lib/database.types'

type BookingWithChild = Booking & {
  children: {
    id: string
    name: string
    age: number
  } | null
  profiles: {
    full_name: string
    phone: string | null
  } | null
}
type WalkInRow = WalkIn

export default function TodayPage() {
  const [todayIso, setTodayIso] = useState<string>('')
  const [term, setTerm] = useState(getCurrentTerm())
  const [isClassDay, setIsClassDay] = useState(false)
  const [sessionDates, setSessionDates] = useState<string[]>([])

  const [bookings, setBookings] = useState<BookingWithChild[]>([])
  const [walkIns, setWalkIns] = useState<WalkInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [walkInForm, setWalkInForm] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    childName: '',
    childAge: '',
    classType: '',
    sessionDate: '',
    amountPaidPence: '',
    paymentMethod: '',
    notes: '',
  })
  const [walkInSubmitting, setWalkInSubmitting] = useState(false)
  const [walkInMessage, setWalkInMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const now = new Date()
    setTodayIso(now.toISOString().slice(0, 10))
  }, [])

  useEffect(() => {
    if (!todayIso) return
    const curTerm = getCurrentTerm()
    setTerm(curTerm)
    ;(async () => {
      const dates = await getTermSessions(curTerm)
      setSessionDates(dates)
      setIsClassDay(dates.includes(todayIso))
    })()
  }, [todayIso])

  const loadData = useCallback(async () => {
    if (!todayIso) return
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()

      const bookingsRes = await supabase
        .from('bookings')
        .select('*, children(id, name, age), profiles(full_name, phone)')
        .eq('booking_type', 'term')
        .in('status', ['pending', 'confirmed'])
        .eq('term_name', term.name)
        .eq('term_year', term.year)

      const walkInsRes = await supabase
        .from('walk_ins')
        .select('*')
        .eq('session_date', todayIso)
        .order('created_at', { ascending: false })

      if (bookingsRes.error) throw new Error(bookingsRes.error.message)
      if (walkInsRes.error) throw new Error(walkInsRes.error.message)

      setBookings((bookingsRes.data as unknown as BookingWithChild[]) || [])
      setWalkIns((walkInsRes.data as unknown as WalkInRow[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [todayIso, term.name, term.year])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (iso: string) => {
    const date = new Date(iso + 'T00:00:00Z')
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`

  const getNextSessionDate = () => {
    if (!todayIso) return null
    return sessionDates.find(d => d >= todayIso)
  }

  const handleWalkInSubmit = async () => {
    if (!walkInForm.parentName.trim() || !walkInForm.childName.trim() || !walkInForm.classType || !walkInForm.sessionDate) {
      setWalkInMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setWalkInSubmitting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/admin/walk-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          parentName: walkInForm.parentName,
          parentPhone: walkInForm.parentPhone || null,
          parentEmail: walkInForm.parentEmail || null,
          childName: walkInForm.childName,
          childAge: walkInForm.childAge ? parseInt(walkInForm.childAge) : null,
          classType: walkInForm.classType,
          sessionDate: walkInForm.sessionDate,
          amountPaidPence: walkInForm.amountPaidPence ? parseInt(walkInForm.amountPaidPence) : null,
          paymentMethod: walkInForm.paymentMethod || null,
          notes: walkInForm.notes || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save walk-in')
      }

      setWalkInMessage({ type: 'success', text: 'Walk-in saved' })
      setWalkInForm({
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        childName: '',
        childAge: '',
        classType: '',
        sessionDate: todayIso,
        amountPaidPence: '',
        paymentMethod: '',
        notes: '',
      })

      setTimeout(() => setWalkInMessage(null), 3000)
      await loadData()
    } catch (err) {
      setWalkInMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save walk-in',
      })
    } finally {
      setWalkInSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6 flex justify-center rounded-3xl bg-white p-8 shadow-sm card-glow">
        <div className="flex gap-2">
          <span className="dancing-dot bg-coral" />
          <span className="dancing-dot bg-lilac" />
          <span className="dancing-dot bg-gold" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mt-6">
        <h2 className="font-heading text-xl font-bold">Today, {formatDate(todayIso)}</h2>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-50 p-6 shadow-sm card-glow">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isClassDay ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
          <h3 className="font-heading text-lg font-semibold">No classes today</h3>
          <p className="mt-2 text-sm text-warm-gray">
            {getNextSessionDate()
              ? `Next session: ${formatDate(getNextSessionDate()!)}`
              : 'No more sessions this term'}
          </p>
        </div>
      ) : (
        <>
          {['baby-boogie', 'confidance-kids'].map((classType) => {
            const typedClassType = classType as keyof typeof CLASSES
            const classInfo = CLASSES[typedClassType]
            const registeredForClass = bookings.filter(b => b.class_type === classType)
            const walkInsForClass = walkIns.filter(w => w.class_type === classType)

            return (
              <div key={classType} className="rounded-3xl bg-white p-8 shadow-sm card-glow">
                <h3 className="font-heading text-lg font-semibold">
                  {classInfo.name} . {classInfo.time}
                </h3>
                <p className="mt-1 text-sm text-warm-gray">
                  {registeredForClass.length} registered, {walkInsForClass.length} walk-ins
                </p>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="pb-2 font-semibold text-warm-gray">Child</th>
                        <th className="pb-2 font-semibold text-warm-gray">Parent</th>
                        <th className="pb-2 font-semibold text-warm-gray">Type</th>
                        <th className="pb-2 font-semibold text-warm-gray">Status</th>
                        <th className="pb-2 font-semibold text-warm-gray">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {registeredForClass.length === 0 && walkInsForClass.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-warm-gray italic">
                            No registered children or walk-ins for this class
                          </td>
                        </tr>
                      ) : (
                        <>
                          {registeredForClass.map((booking) => (
                            <tr key={booking.id}>
                              <td className="py-3">
                                {booking.children?.name || 'Unknown'}
                                {booking.children?.age && (
                                  <span className="ml-1 text-xs text-warm-gray">({booking.children.age})</span>
                                )}
                              </td>
                              <td className="py-3">
                                {booking.profiles?.full_name || 'Unknown'}
                                {booking.profiles?.phone && (
                                  <div className="text-xs text-warm-gray">{booking.profiles.phone}</div>
                                )}
                              </td>
                              <td className="py-3">Term pass</td>
                              <td className="py-3 capitalize">{booking.status}</td>
                              <td className="py-3">-</td>
                            </tr>
                          ))}

                          {walkInsForClass.length > 0 && (
                            <>
                              <tr>
                                <td colSpan={5} className="border-t-2 border-border" />
                              </tr>
                              {walkInsForClass.map((walkIn) => (
                                <tr key={walkIn.id}>
                                  <td className="py-3">
                                    {walkIn.child_name}
                                    {walkIn.child_age && (
                                      <span className="ml-1 text-xs text-warm-gray">({walkIn.child_age})</span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    {walkIn.parent_name}
                                    {walkIn.parent_phone && (
                                      <div className="text-xs text-warm-gray">{walkIn.parent_phone}</div>
                                    )}
                                  </td>
                                  <td className="py-3">Walk-in</td>
                                  <td className="py-3">Confirmed</td>
                                  <td className="py-3">
                                    {walkIn.amount_paid_pence ? formatPrice(walkIn.amount_paid_pence) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </>
      )}

      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h3 className="font-heading text-lg font-semibold">Capture walk-in</h3>

        {walkInMessage && (
          <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            walkInMessage.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {walkInMessage.text}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-warm-gray">Parent name</label>
            <input
              type="text"
              value={walkInForm.parentName}
              onChange={(e) => setWalkInForm({ ...walkInForm, parentName: e.target.value })}
              placeholder="Required"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Parent phone</label>
            <input
              type="tel"
              value={walkInForm.parentPhone}
              onChange={(e) => setWalkInForm({ ...walkInForm, parentPhone: e.target.value })}
              placeholder="Optional"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Parent email</label>
            <input
              type="email"
              value={walkInForm.parentEmail}
              onChange={(e) => setWalkInForm({ ...walkInForm, parentEmail: e.target.value })}
              placeholder="Optional"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Child name</label>
            <input
              type="text"
              value={walkInForm.childName}
              onChange={(e) => setWalkInForm({ ...walkInForm, childName: e.target.value })}
              placeholder="Required"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Child age</label>
            <input
              type="number"
              min="0"
              max="18"
              value={walkInForm.childAge}
              onChange={(e) => setWalkInForm({ ...walkInForm, childAge: e.target.value })}
              placeholder="Optional"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Class</label>
            <select
              value={walkInForm.classType}
              onChange={(e) => setWalkInForm({ ...walkInForm, classType: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            >
              <option value="">Select a class</option>
              {isClassDay && sessionDates.includes(todayIso)
                ? Object.entries(CLASSES).map(([key, cls]) => (
                    <option key={key} value={key}>{cls.name}</option>
                  ))
                : Object.entries(CLASSES).map(([key, cls]) => (
                    <option key={key} value={key}>{cls.name}</option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Session date</label>
            <input
              type="date"
              value={walkInForm.sessionDate}
              onChange={(e) => setWalkInForm({ ...walkInForm, sessionDate: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Amount paid (pence)</label>
            <input
              type="number"
              min="0"
              value={walkInForm.amountPaidPence}
              onChange={(e) => setWalkInForm({ ...walkInForm, amountPaidPence: e.target.value })}
              placeholder="e.g. 1200 for £12.00"
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray">Payment method</label>
            <select
              value={walkInForm.paymentMethod}
              onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            >
              <option value="">Optional</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-warm-gray">Notes</label>
            <textarea
              value={walkInForm.notes}
              onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value.slice(0, 1000) })}
              placeholder="Optional"
              maxLength={1000}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
            <p className="mt-1 text-xs text-warm-gray">{walkInForm.notes.length}/1000</p>
          </div>
        </div>

        <button
          onClick={handleWalkInSubmit}
          disabled={walkInSubmitting}
          className="mt-6 rounded-full bg-coral px-8 py-3 font-heading font-semibold text-white disabled:opacity-50"
        >
          {walkInSubmitting ? 'Saving...' : 'Save walk-in'}
        </button>
      </div>
    </div>
  )
}
