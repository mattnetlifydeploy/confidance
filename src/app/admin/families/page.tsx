'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES } from '@/lib/constants'
import type { Booking, Child, Profile } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'

type ChildWithBookings = {
  child: Child
  bookings: Booking[]
}

type Family = {
  parent: Profile
  children: ChildWithBookings[]
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedChildIds, setExpandedChildIds] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()

      const profilesRes = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      const childrenRes = await supabase
        .from('children')
        .select('*')

      const bookingsRes = await supabase
        .from('bookings')
        .select('*')

      if (profilesRes.error) throw new Error(profilesRes.error.message)
      if (childrenRes.error) throw new Error(childrenRes.error.message)
      if (bookingsRes.error) throw new Error(bookingsRes.error.message)

      const profiles = (profilesRes.data || []) as Profile[]
      const children = (childrenRes.data || []) as Child[]
      const bookings = (bookingsRes.data || []) as Booking[]

      const childrenByParent = new Map<string, Child[]>()
      const bookingsByChild = new Map<string, Booking[]>()

      children.forEach(c => {
        if (!childrenByParent.has(c.parent_id)) {
          childrenByParent.set(c.parent_id, [])
        }
        childrenByParent.get(c.parent_id)!.push(c)
      })

      bookings.forEach(b => {
        if (!bookingsByChild.has(b.child_id)) {
          bookingsByChild.set(b.child_id, [])
        }
        bookingsByChild.get(b.child_id)!.push(b)
      })

      const familiesList: Family[] = profiles.map(parent => ({
        parent,
        children: (childrenByParent.get(parent.id) || []).map(child => ({
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
    return families.filter(fam => {
      if (fam.parent.full_name.toLowerCase().includes(q) ||
          fam.parent.email.toLowerCase().includes(q) ||
          (fam.parent.phone?.toLowerCase().includes(q) ?? false)) {
        return true
      }
      return fam.children.some(cw => cw.child.name.toLowerCase().includes(q))
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
      <div>
        <h2 className="font-heading text-xl font-bold">Families</h2>
        <p className="mt-1 text-sm text-warm-gray">Every parent and their children. Click a family to see booking history.</p>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-50 p-6 shadow-sm card-glow">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Search parent name, email, phone, or child name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
      />

      <div className="space-y-4">
        {filteredFamilies.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm card-glow text-center">
            <p className="text-sm text-warm-gray">No families match your search.</p>
          </div>
        ) : (
          filteredFamilies.map(fam => (
            <div key={fam.parent.id} className="rounded-3xl bg-white p-6 shadow-sm card-glow">
              <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-lilac/20">
                  <span className="font-heading text-sm font-bold text-coral">
                    {fam.parent.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-heading text-base font-bold">{fam.parent.full_name}</p>
                  <p className="text-sm text-warm-gray">
                    {fam.parent.email} . {fam.parent.phone || 'No phone'}
                  </p>
                </div>
                <span className="inline-block rounded-full bg-cream px-3 py-1 text-xs font-600 text-warm-gray">
                  {fam.children.length} child{fam.children.length !== 1 ? 'ren' : ''}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {fam.children.length === 0 ? (
                  <p className="text-sm text-warm-gray italic">No children yet.</p>
                ) : (
                  fam.children.map(cw => {
                    const isExpanded = expandedChildIds.has(cw.child.id)
                    return (
                      <div key={cw.child.id} className="rounded-2xl bg-cream/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-600">{cw.child.name}</p>
                          </div>
                          <div className="flex flex-shrink-0 gap-2">
                            <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs font-600 text-warm-gray">
                              Age {cw.child.age}
                            </span>
                            <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs font-600 text-warm-gray">
                              {cw.bookings.length} booking{cw.bookings.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        {cw.bookings.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(cw.child.id)}
                            className="mt-2 text-xs text-coral"
                          >
                            {isExpanded ? 'Hide history' : 'Show history'}
                          </button>
                        )}
                        {isExpanded && cw.bookings.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-border pt-3">
                            {cw.bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(b => {
                              const classInfo = CLASSES[b.class_type as ClassType]
                              const createdDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(b.created_at))
                              return (
                                <div key={b.id} className="text-xs text-warm-gray">
                                  <div className="flex justify-between">
                                    <span>{createdDate} . {classInfo?.name || b.class_type}</span>
                                    <div className="flex gap-1">
                                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-600 ${
                                        b.booking_type === 'term' ? 'bg-coral/15 text-coral' :
                                        b.booking_type === 'single' ? 'bg-lilac/15 text-lilac' :
                                        b.booking_type === 'trial' ? 'bg-gold/15 text-gold' :
                                        'bg-warm-gray/15 text-warm-gray'
                                      }`}>
                                        {b.booking_type}
                                      </span>
                                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-600 ${
                                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        b.status === 'pending' ? 'bg-gold/15 text-gold' :
                                        b.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                        'bg-warm-gray/15 text-warm-gray'
                                      }`}>
                                        {b.status}
                                      </span>
                                    </div>
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
