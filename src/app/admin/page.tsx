'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@supabase/supabase-js'
import type { Child, Profile, Booking } from '@/lib/database.types'
import { CLASSES, CURRENT_TERM, getTermSessionDates } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

type BookingWithChild = Booking & {
  childName: string
  className: string
}

type ChildWithParent = Child & {
  parent: Profile | null
  trialUsed: boolean
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'bookings' | 'families'>('bookings')
  const [dataLoading, setDataLoading] = useState(true)

  // Bookings state
  const [bookings, setBookings] = useState<BookingWithChild[]>([])
  const [bookingFilter, setBookingFilter] = useState<string>('all')

  // Families state
  const [children, setChildren] = useState<ChildWithParent[]>([])
  const [parents, setParents] = useState<Map<string, Profile>>(new Map())

  useEffect(() => {
    if (loading) return
    if (!user || !profile?.is_admin) {
      router.push('/')
      return
    }

    fetchData()
  }, [user, profile, loading])

  async function fetchData() {
    if (!supabase) return
    setDataLoading(true)

    try {
      const [bookingsRes, childrenRes, parentsRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('children').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ])

      const bookingsData = (bookingsRes.data || []) as Booking[]
      const childrenData = (childrenRes.data || []) as Child[]
      const parentsData = (parentsRes.data || []) as Profile[]

      // Build parent map
      const parentMap = new Map<string, Profile>()
      parentsData.forEach((p) => parentMap.set(p.id, p))
      setParents(parentMap)

      // Build child name map
      const childNameMap = new Map<string, string>()
      childrenData.forEach((c) => childNameMap.set(c.id, c.name))

      // Track which children have used their trial
      const trialChildIds = new Set<string>()
      bookingsData.forEach((b) => {
        if (b.booking_type === 'trial') trialChildIds.add(b.child_id)
      })

      // Enrich bookings with child/class names
      const enrichedBookings: BookingWithChild[] = bookingsData.map((b) => ({
        ...b,
        childName: childNameMap.get(b.child_id) || 'Unknown',
        className: CLASSES[b.class_type as keyof typeof CLASSES]?.name || b.class_type,
      }))
      setBookings(enrichedBookings)

      // Enrich children with parent info and trial status
      const enrichedChildren: ChildWithParent[] = childrenData.map((c) => ({
        ...c,
        parent: parentMap.get(c.parent_id) || null,
        trialUsed: trialChildIds.has(c.id),
      }))
      setChildren(enrichedChildren)
    } catch (error) {
      // Error fetching admin data
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-20">
        <div className="flex gap-2">
          <span className="dancing-dot bg-coral" />
          <span className="dancing-dot bg-lilac" />
          <span className="dancing-dot bg-gold" />
        </div>
      </div>
    )
  }

  if (!user || !profile?.is_admin) return null

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === bookingFilter)

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  return (
    <section className="min-h-screen bg-cream px-6 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="mt-1 text-charcoal-light">Manage sessions, families &amp; credits</p>
          </div>
          <button onClick={fetchData} className="btn-secondary text-sm">
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-2 border-b border-border">
          {[
            { key: 'bookings' as const, label: `Bookings (${bookings.length})` },
            { key: 'families' as const, label: `Families (${new Set(children.map((c) => c.parent_id)).size})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 font-heading text-sm font-600 transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-coral text-coral'
                  : 'text-warm-gray hover:text-charcoal'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ==================== BOOKINGS TAB ==================== */}
        {tab === 'bookings' && (
          <div className="mt-6">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="font-heading text-2xl font-bold text-coral">{bookings.length}</p>
                <p className="text-xs text-warm-gray">Total</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="font-heading text-2xl font-bold text-green-600">{confirmedCount}</p>
                <p className="text-xs text-warm-gray">Confirmed</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="font-heading text-2xl font-bold text-gold">{pendingCount}</p>
                <p className="text-xs text-warm-gray">Pending</p>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm transition-all focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                <p className="text-warm-gray">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-gold/15 text-gold',
                    confirmed: 'bg-green-100 text-green-700',
                    cancelled: 'bg-red-100 text-red-600',
                  }
                  const statusColor = statusColors[booking.status] || 'bg-cream text-warm-gray'
                  const parentProfile = parents.get(booking.parent_id)
                  const formattedDate = new Date(booking.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })

                  return (
                    <div key={booking.id} className="card-glow rounded-3xl bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-heading text-sm font-bold">{booking.className}</h4>
                          <p className="text-xs text-warm-gray">
                            {booking.childName} &middot; {parentProfile?.full_name || 'Unknown parent'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-700 capitalize ${statusColor}`}>
                            {booking.status}
                          </span>
                          <span className="rounded-full bg-cream px-3 py-1 text-xs font-600 text-charcoal-light">
                            {booking.booking_type === 'term' ? 'Term' : booking.booking_type === 'single' ? 'Single' : 'Trial'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-warm-gray">
                        <span>Booked: {formattedDate}</span>
                        {parentProfile?.email && <span>{parentProfile.email}</span>}
                        {parentProfile?.phone && <span>{parentProfile.phone}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== FAMILIES TAB ==================== */}
        {tab === 'families' && (
          <div className="mt-6">
            {children.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                <p className="text-warm-gray">No children registered</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Group children by parent_id
                  const familyMap = new Map<string, ChildWithParent[]>()
                  children.forEach((child) => {
                    const key = child.parent_id || 'unknown'
                    const existing = familyMap.get(key) || []
                    existing.push(child)
                    familyMap.set(key, existing)
                  })

                  return Array.from(familyMap.entries()).map(([parentId, familyChildren]) => {
                    const parent = parents.get(parentId)
                    return (
                      <div key={parentId} className="rounded-3xl bg-white p-6 shadow-sm card-glow">
                        {/* Family header */}
                        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-lilac/20 font-heading text-sm font-bold text-coral">
                            {parent?.full_name?.[0] || '?'}
                          </div>
                          <div>
                            <h3 className="font-heading text-base font-bold">
                              {parent?.full_name || 'Unknown Parent'}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-gray">
                              {parent?.email && <span>{parent.email}</span>}
                              {parent?.phone && <span>{parent.phone}</span>}
                            </div>
                          </div>
                          <span className="ml-auto rounded-full bg-lilac/10 px-3 py-1 text-xs font-600 text-lilac-dark">
                            {familyChildren.length} {familyChildren.length === 1 ? 'child' : 'children'}
                          </span>
                        </div>

                        {/* Children in this family */}
                        <div className="space-y-3">
                          {familyChildren.map((child) => (
                            <div key={child.id} className="rounded-2xl bg-cream/50 p-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="font-heading text-sm font-bold">{child.name}</h4>
                                <span className="rounded-full bg-cream px-3 py-1 text-xs font-600 text-charcoal-light">
                                  Age {child.age}
                                </span>
                                {child.trialUsed ? (
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-700 text-green-700">
                                    Trial Used
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-700 text-gold">
                                    Trial Available
                                  </span>
                                )}
                              </div>

                              {child.medical_info && (
                                <div className="mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm">
                                  <span className="font-600 text-red-700">Medical Info:</span>{' '}
                                  <span className="text-red-600">{child.medical_info}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
