'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, getCurrentTerm } from '@/lib/constants'
import { getTermSessions } from '@/lib/term-sessions'
import type { Booking, WalkIn } from '@/lib/database.types'
import {
  AdminCard,
  AdminPageHeader,
  Button,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Select,
  Textarea,
  AdminSpinner,
  StatusBadge,
  useToast,
} from '@/components/admin'

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

type WalkInFormState = {
  parentName: string
  parentPhone: string
  parentEmail: string
  childName: string
  childAge: string
  classType: string
  sessionDate: string
  amountPaidPence: string
  paymentMethod: string
  notes: string
}

const EMPTY_WALKIN: WalkInFormState = {
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
}

const CLASS_OPTIONS = Object.entries(CLASSES).map(([key, cls]) => ({
  value: key,
  label: cls.name,
}))

function walkInToForm(w: WalkInRow): WalkInFormState {
  return {
    parentName: w.parent_name,
    parentPhone: w.parent_phone || '',
    parentEmail: w.parent_email || '',
    childName: w.child_name,
    childAge: w.child_age != null ? String(w.child_age) : '',
    classType: w.class_type,
    sessionDate: w.session_date,
    amountPaidPence: w.amount_paid_pence != null ? String(w.amount_paid_pence) : '',
    paymentMethod: w.payment_method || '',
    notes: w.notes || '',
  }
}

function formToPayload(f: WalkInFormState) {
  return {
    parentName: f.parentName,
    parentPhone: f.parentPhone || null,
    parentEmail: f.parentEmail || null,
    childName: f.childName,
    childAge: f.childAge ? parseInt(f.childAge) : null,
    classType: f.classType,
    sessionDate: f.sessionDate,
    amountPaidPence: f.amountPaidPence ? parseInt(f.amountPaidPence) : null,
    paymentMethod: f.paymentMethod || null,
    notes: f.notes || null,
  }
}

// Shared walk-in field grid, used for both capture and edit.
function WalkInFields({
  form,
  set,
}: {
  form: WalkInFormState
  set: (patch: Partial<WalkInFormState>) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Parent name *">
        <Input
          type="text"
          value={form.parentName}
          onChange={(e) => set({ parentName: e.target.value })}
          placeholder="Required"
        />
      </FormField>
      <FormField label="Parent phone">
        <Input
          type="tel"
          value={form.parentPhone}
          onChange={(e) => set({ parentPhone: e.target.value })}
          placeholder="Optional"
        />
      </FormField>
      <FormField label="Parent email">
        <Input
          type="email"
          value={form.parentEmail}
          onChange={(e) => set({ parentEmail: e.target.value })}
          placeholder="Optional"
        />
      </FormField>
      <FormField label="Child name *">
        <Input
          type="text"
          value={form.childName}
          onChange={(e) => set({ childName: e.target.value })}
          placeholder="Required"
        />
      </FormField>
      <FormField label="Child age">
        <Input
          type="number"
          min={0}
          max={18}
          value={form.childAge}
          onChange={(e) => set({ childAge: e.target.value })}
          placeholder="Optional"
        />
      </FormField>
      <FormField label="Class *">
        <Select value={form.classType} onChange={(e) => set({ classType: e.target.value })}>
          <option value="">Select a class</option>
          {CLASS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Session date *">
        <Input
          type="date"
          value={form.sessionDate}
          onChange={(e) => set({ sessionDate: e.target.value })}
        />
      </FormField>
      <FormField label="Amount paid (pence)" hint="e.g. 1200 for £12.00">
        <Input
          type="number"
          min={0}
          value={form.amountPaidPence}
          onChange={(e) => set({ amountPaidPence: e.target.value })}
          placeholder="Optional"
        />
      </FormField>
      <FormField label="Payment method">
        <Select
          value={form.paymentMethod}
          onChange={(e) => set({ paymentMethod: e.target.value })}
        >
          <option value="">Optional</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </Select>
      </FormField>
      <div className="md:col-span-2">
        <FormField label="Notes" hint={`${form.notes.length}/1000`}>
          <Textarea
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value.slice(0, 1000) })}
            placeholder="Optional"
            maxLength={1000}
            rows={3}
          />
        </FormField>
      </div>
    </div>
  )
}

export default function TodayPage() {
  const toast = useToast()
  const [todayIso, setTodayIso] = useState<string>('')
  const [term, setTerm] = useState(getCurrentTerm())
  const [isClassDay, setIsClassDay] = useState(false)
  const [sessionDates, setSessionDates] = useState<string[]>([])

  const [bookings, setBookings] = useState<BookingWithChild[]>([])
  const [walkIns, setWalkIns] = useState<WalkInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [captureForm, setCaptureForm] = useState<WalkInFormState>(EMPTY_WALKIN)
  const [captureSubmitting, setCaptureSubmitting] = useState(false)

  const [editing, setEditing] = useState<WalkInRow | null>(null)
  const [editForm, setEditForm] = useState<WalkInFormState>(EMPTY_WALKIN)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<WalkInRow | null>(null)
  const [deleting, setDeleting] = useState(false)

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
    return sessionDates.find((d) => d >= todayIso)
  }

  const handleCaptureSubmit = async () => {
    if (
      !captureForm.parentName.trim() ||
      !captureForm.childName.trim() ||
      !captureForm.classType ||
      !captureForm.sessionDate
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    setCaptureSubmitting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch('/api/admin/walk-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formToPayload(captureForm)),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save walk-in')
      }

      toast.success('Walk-in saved')
      setCaptureForm({ ...EMPTY_WALKIN, sessionDate: todayIso })
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save walk-in')
    } finally {
      setCaptureSubmitting(false)
    }
  }

  const openEdit = (w: WalkInRow) => {
    setEditing(w)
    setEditForm(walkInToForm(w))
  }

  const handleEditSubmit = async () => {
    if (!editing) return
    if (
      !editForm.parentName.trim() ||
      !editForm.childName.trim() ||
      !editForm.classType ||
      !editForm.sessionDate
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    setEditSubmitting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch(`/api/admin/walk-in/${editing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formToPayload(editForm)),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update walk-in')
      }

      toast.success('Walk-in updated')
      setEditing(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update walk-in')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch(`/api/admin/walk-in/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete walk-in')
      }

      toast.success('Walk-in deleted')
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete walk-in')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AdminCard className="mt-6 flex justify-center">
        <AdminSpinner />
      </AdminCard>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Today, ${formatDate(todayIso)}`} />

      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      {!isClassDay ? (
        <AdminCard>
          <h3 className="font-heading text-lg font-bold text-navy">No classes today</h3>
          <p className="mt-2 text-sm text-charcoal/60">
            {getNextSessionDate()
              ? `Next session: ${formatDate(getNextSessionDate()!)}`
              : 'No more sessions this term'}
          </p>
        </AdminCard>
      ) : (
        <>
          {['baby-boogie', 'confidance-kids'].map((classType) => {
            const typedClassType = classType as keyof typeof CLASSES
            const classInfo = CLASSES[typedClassType]
            const registeredForClass = bookings.filter((b) => b.class_type === classType)
            const walkInsForClass = walkIns.filter((w) => w.class_type === classType)

            return (
              <AdminCard key={classType}>
                <h3 className="font-heading text-lg font-bold text-navy">
                  {classInfo.name} . {classInfo.time}
                </h3>
                <p className="mt-1 text-sm text-charcoal/60">
                  {registeredForClass.length} registered, {walkInsForClass.length} walk-ins
                </p>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-charcoal/10">
                      <tr>
                        <th className="pb-2 font-medium text-charcoal">Child</th>
                        <th className="pb-2 font-medium text-charcoal">Parent</th>
                        <th className="pb-2 font-medium text-charcoal">Type</th>
                        <th className="pb-2 font-medium text-charcoal">Status</th>
                        <th className="pb-2 font-medium text-charcoal">Amount</th>
                        <th className="pb-2 text-right font-medium text-charcoal">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/5">
                      {registeredForClass.length === 0 && walkInsForClass.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 italic text-charcoal/50">
                            No registered children or walk-ins for this class
                          </td>
                        </tr>
                      ) : (
                        <>
                          {registeredForClass.map((booking) => (
                            <tr key={booking.id}>
                              <td className="py-3 text-charcoal">
                                {booking.children?.name || 'Unknown'}
                                {booking.children?.age && (
                                  <span className="ml-1 text-xs text-charcoal/50">
                                    ({booking.children.age})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-charcoal">
                                {booking.profiles?.full_name || 'Unknown'}
                                {booking.profiles?.phone && (
                                  <div className="text-xs text-charcoal/50">
                                    {booking.profiles.phone}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-charcoal/70">Term pass</td>
                              <td className="py-3">
                                <StatusBadge label={booking.status} status={booking.status} />
                              </td>
                              <td className="py-3 text-charcoal/70">-</td>
                              <td className="py-3" />
                            </tr>
                          ))}

                          {walkInsForClass.length > 0 && (
                            <>
                              <tr>
                                <td colSpan={6} className="border-t-2 border-charcoal/10" />
                              </tr>
                              {walkInsForClass.map((walkIn) => (
                                <tr key={walkIn.id}>
                                  <td className="py-3 text-charcoal">
                                    {walkIn.child_name}
                                    {walkIn.child_age && (
                                      <span className="ml-1 text-xs text-charcoal/50">
                                        ({walkIn.child_age})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-charcoal">
                                    {walkIn.parent_name}
                                    {walkIn.parent_phone && (
                                      <div className="text-xs text-charcoal/50">
                                        {walkIn.parent_phone}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 text-charcoal/70">Walk-in</td>
                                  <td className="py-3">
                                    <StatusBadge label="Confirmed" tone="success" />
                                  </td>
                                  <td className="py-3 text-charcoal/70">
                                    {walkIn.amount_paid_pence
                                      ? formatPrice(walkIn.amount_paid_pence)
                                      : '-'}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEdit(walkIn)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-error hover:bg-error/5"
                                        onClick={() => setDeleteTarget(walkIn)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
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
              </AdminCard>
            )
          })}
        </>
      )}

      <AdminCard>
        <h3 className="font-heading text-lg font-bold text-navy">Capture walk-in</h3>
        <div className="mt-6">
          <WalkInFields
            form={captureForm}
            set={(patch) => setCaptureForm({ ...captureForm, ...patch })}
          />
        </div>
        <div className="mt-6">
          <Button onClick={handleCaptureSubmit} loading={captureSubmitting}>
            Save walk-in
          </Button>
        </div>
      </AdminCard>

      {/* Edit walk-in */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit walk-in">
        <div className="space-y-4">
          <WalkInFields
            form={editForm}
            set={(patch) => setEditForm({ ...editForm, ...patch })}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleEditSubmit} loading={editSubmitting}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete walk-in */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete walk-in"
        message={
          deleteTarget
            ? `Delete the walk-in for ${deleteTarget.child_name}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
