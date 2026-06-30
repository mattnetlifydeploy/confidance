'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES } from '@/lib/constants'
import type { Booking, Child, Profile } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'
import {
  AdminCard,
  AdminPageHeader,
  Button,
  Modal,
  FormField,
  Input,
  Textarea,
  StatusBadge,
  EmptyState,
  AdminSpinner,
  useToast,
} from '@/components/admin'

type ChildWithBookings = {
  child: Child
  bookings: Booking[]
}

type Family = {
  parent: Profile
  children: ChildWithBookings[]
}

export default function FamiliesPage() {
  const toast = useToast()
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedChildIds, setExpandedChildIds] = useState<Set<string>>(new Set())
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set())

  const [editParent, setEditParent] = useState<Profile | null>(null)
  const [parentForm, setParentForm] = useState({ fullName: '', phone: '' })
  const [parentSaving, setParentSaving] = useState(false)

  const [editChild, setEditChild] = useState<Child | null>(null)
  const [childForm, setChildForm] = useState({ name: '', age: '', medicalInfo: '' })
  const [childSaving, setChildSaving] = useState(false)

  const getToken = async () => {
    const { data: { session } } = await getSupabase().auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')
    return session.access_token
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()

      const profilesRes = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      const childrenRes = await supabase.from('children').select('*')

      const bookingsRes = await supabase.from('bookings').select('*')

      if (profilesRes.error) throw new Error(profilesRes.error.message)
      if (childrenRes.error) throw new Error(childrenRes.error.message)
      if (bookingsRes.error) throw new Error(bookingsRes.error.message)

      const profiles = (profilesRes.data || []) as Profile[]
      const children = (childrenRes.data || []) as Child[]
      const bookings = (bookingsRes.data || []) as Booking[]

      const childrenByParent = new Map<string, Child[]>()
      const bookingsByChild = new Map<string, Booking[]>()

      children.forEach((c) => {
        if (!childrenByParent.has(c.parent_id)) {
          childrenByParent.set(c.parent_id, [])
        }
        childrenByParent.get(c.parent_id)!.push(c)
      })

      bookings.forEach((b) => {
        if (!bookingsByChild.has(b.child_id)) {
          bookingsByChild.set(b.child_id, [])
        }
        bookingsByChild.get(b.child_id)!.push(b)
      })

      const familiesList: Family[] = profiles.map((parent) => ({
        parent,
        children: (childrenByParent.get(parent.id) || []).map((child) => ({
          child,
          bookings: bookingsByChild.get(child.id) || [],
        })),
      }))

      setFamilies(familiesList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredFamilies = useMemo(() => {
    if (!search.trim()) return families

    const q = search.toLowerCase()
    return families.filter((fam) => {
      if (
        fam.parent.full_name.toLowerCase().includes(q) ||
        fam.parent.email.toLowerCase().includes(q) ||
        (fam.parent.phone?.toLowerCase().includes(q) ?? false)
      ) {
        return true
      }
      return fam.children.some((cw) => cw.child.name.toLowerCase().includes(q))
    })
  }, [families, search])

  const toggleExpanded = (childId: string) => {
    const newSet = new Set(expandedChildIds)
    if (newSet.has(childId)) {
      newSet.delete(childId)
    } else {
      newSet.add(childId)
    }
    setExpandedChildIds(newSet)
  }

  const saveNotes = async (parentId: string, notes: string | null) => {
    setSavingNotes((prev) => new Set(prev).add(parentId))
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/family-notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parentId, notes: notes || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save notes')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setSavingNotes((prev) => {
        const next = new Set(prev)
        next.delete(parentId)
        return next
      })
    }
  }

  const openEditParent = (parent: Profile) => {
    setEditParent(parent)
    setParentForm({ fullName: parent.full_name, phone: parent.phone || '' })
  }

  const handleParentSave = async () => {
    if (!editParent) return
    if (!parentForm.fullName.trim()) {
      toast.error('Name is required')
      return
    }
    setParentSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/admin/families/profile/${editParent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: parentForm.fullName,
          phone: parentForm.phone || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update parent')
      }
      toast.success('Parent updated')
      setEditParent(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update parent')
    } finally {
      setParentSaving(false)
    }
  }

  const openEditChild = (child: Child) => {
    setEditChild(child)
    setChildForm({
      name: child.name,
      age: String(child.age),
      medicalInfo: child.medical_info || '',
    })
  }

  const handleChildSave = async () => {
    if (!editChild) return
    if (!childForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    const ageNum = parseInt(childForm.age)
    if (Number.isNaN(ageNum)) {
      toast.error('Valid age is required')
      return
    }
    setChildSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/admin/families/child/${editChild.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: childForm.name,
          age: ageNum,
          medicalInfo: childForm.medicalInfo || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update child')
      }
      toast.success('Child updated')
      setEditChild(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update child')
    } finally {
      setChildSaving(false)
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
      <AdminPageHeader
        title="Families"
        description="Every parent and their children. Click a family to see booking history."
      />

      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      <Input
        type="text"
        placeholder="Search parent name, email, phone, or child name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-4">
        {filteredFamilies.length === 0 ? (
          <AdminCard>
            <EmptyState
              title="No families found"
              description="No families match your search."
            />
          </AdminCard>
        ) : (
          filteredFamilies.map((fam) => (
            <AdminCard key={fam.parent.id}>
              <div className="flex flex-wrap items-center gap-3 border-b border-charcoal/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal/20 to-navy/20">
                  <span className="font-heading text-sm font-bold text-teal">
                    {fam.parent.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-heading text-base font-bold text-navy">
                    {fam.parent.full_name}
                  </p>
                  <p className="text-sm text-charcoal/60">
                    {fam.parent.email} . {fam.parent.phone || 'No phone'}
                  </p>
                </div>
                <StatusBadge
                  label={`${fam.children.length} child${fam.children.length !== 1 ? 'ren' : ''}`}
                  tone="neutral"
                />
                <Button variant="ghost" size="sm" onClick={() => openEditParent(fam.parent)}>
                  Edit
                </Button>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-charcoal/60">
                  Admin notes
                </label>
                <Textarea
                  value={fam.parent.admin_notes || ''}
                  onChange={(e) => {
                    setFamilies(
                      families.map((f) =>
                        f.parent.id === fam.parent.id
                          ? { ...f, parent: { ...f.parent, admin_notes: e.target.value } }
                          : f,
                      ),
                    )
                  }}
                  onBlur={() => saveNotes(fam.parent.id, fam.parent.admin_notes || null)}
                  placeholder="Add internal notes about this family..."
                  rows={3}
                  className="resize-none"
                />
                {savingNotes.has(fam.parent.id) && (
                  <p className="mt-1 text-xs text-charcoal/50">Saving...</p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {fam.children.length === 0 ? (
                  <p className="text-sm italic text-charcoal/50">No children yet.</p>
                ) : (
                  fam.children.map((cw) => {
                    const isExpanded = expandedChildIds.has(cw.child.id)
                    return (
                      <div key={cw.child.id} className="rounded-2xl bg-cream/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-navy">{cw.child.name}</p>
                            {cw.child.medical_info && (
                              <p className="mt-0.5 text-xs text-charcoal/60">
                                Medical: {cw.child.medical_info}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <StatusBadge label={`Age ${cw.child.age}`} tone="neutral" />
                            <StatusBadge
                              label={`${cw.bookings.length} booking${cw.bookings.length !== 1 ? 's' : ''}`}
                              tone="neutral"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditChild(cw.child)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                        {cw.bookings.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(cw.child.id)}
                            className="mt-2 text-xs font-medium text-teal"
                          >
                            {isExpanded ? 'Hide history' : 'Show history'}
                          </button>
                        )}
                        {isExpanded && cw.bookings.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-charcoal/10 pt-3">
                            {cw.bookings
                              .slice()
                              .sort(
                                (a, b) =>
                                  new Date(b.created_at).getTime() -
                                  new Date(a.created_at).getTime(),
                              )
                              .map((b) => {
                                const classInfo = CLASSES[b.class_type as ClassType]
                                const createdDate = new Intl.DateTimeFormat('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: '2-digit',
                                }).format(new Date(b.created_at))
                                return (
                                  <div
                                    key={b.id}
                                    className="flex items-center justify-between text-xs text-charcoal/70"
                                  >
                                    <span>
                                      {createdDate} . {classInfo?.name || b.class_type}
                                    </span>
                                    <div className="flex gap-1">
                                      <StatusBadge label={b.booking_type} tone="teal" />
                                      <StatusBadge label={b.status} status={b.status} />
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </AdminCard>
          ))
        )}
      </div>

      {/* Edit parent */}
      <Modal
        open={editParent !== null}
        onClose={() => setEditParent(null)}
        title="Edit parent"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Full name *">
            <Input
              type="text"
              value={parentForm.fullName}
              onChange={(e) => setParentForm({ ...parentForm, fullName: e.target.value })}
            />
          </FormField>
          <FormField label="Phone">
            <Input
              type="tel"
              value={parentForm.phone}
              onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
              placeholder="Optional"
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleParentSave} loading={parentSaving}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={() => setEditParent(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit child */}
      <Modal
        open={editChild !== null}
        onClose={() => setEditChild(null)}
        title="Edit child"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Name *">
            <Input
              type="text"
              value={childForm.name}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
            />
          </FormField>
          <FormField label="Age *">
            <Input
              type="number"
              min={0}
              max={18}
              value={childForm.age}
              onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
            />
          </FormField>
          <FormField label="Medical info" hint="Allergies, conditions, anything staff should know.">
            <Textarea
              value={childForm.medicalInfo}
              onChange={(e) => setChildForm({ ...childForm, medicalInfo: e.target.value })}
              placeholder="Optional"
              rows={3}
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleChildSave} loading={childSaving}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={() => setEditChild(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
