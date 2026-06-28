'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES } from '@/lib/constants'
import type { Booking, Child, Profile } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'

type BookingRow = {
  id: string
  createdAt: string
  parentName: string
  childName: string
  classType: ClassType
  bookingType: string
  termLabel: string
  status: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [childrenMap, setChildrenMap] = useState<Map<string, Child>>(new Map())
  const [profilesMap, setProfilesMap] = useState<Map<string, Profile>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [termFilter, setTermFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()

      const bookingsRes = await supabase
        .from('bookings')
        .select('*')
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

  const uniqueTerms = useMemo(() => {
    const terms = new Map<string, { name: string, year: number }>()
    bookings.forEach(b => {
      if (b.term_name && b.term_year) {
        const key = `${b.term_name}-${b.term_year}`
        terms.set(key, { name: b.term_name, year: b.term_year })
      }
    })
    return Array.from(terms.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      const termOrder = { 'Spring': 0, 'Summer': 1, 'Autumn': 2 }
      return (termOrder[a.name as keyof typeof termOrder] ?? 99) - (termOrder[b.name as keyof typeof termOrder] ?? 99)
    })
  }, [bookings])

  const rows: BookingRow[] = useMemo(() => {
    return bookings.map(b => ({
      id: b.id,
      createdAt: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(b.created_at)),
      parentName: profilesMap.get(b.parent_id)?.full_name || 'Unknown',
      childName: childrenMap.get(b.child_id)?.name || 'Unknown',
      classType: b.class_type as ClassType,
      bookingType: b.booking_type,
      termLabel: b.term_name && b.term_year ? `${b.term_name} ${b.term_year}` : '.',
      status: b.status,
    }))
  }, [bookings, childrenMap, profilesMap])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!r.parentName.toLowerCase().includes(q) && !r.childName.toLowerCase().includes(q)) {
          return false
        }
      }
      if (classFilter !== 'all' && r.classType !== classFilter) return false
      if (typeFilter !== 'all' && r.bookingType !== typeFilter) return false
      if (termFilter !== 'all' && r.termLabel !== termFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      return true
    })
  }, [rows, search, classFilter, typeFilter, termFilter, statusFilter])

  const stats = useMemo(() => {
    const total = rows.length
    const confirmed = rows.filter(r => r.status === 'confirmed').length
    const pending = rows.filter(r => r.status === 'pending').length
    const cancelled = rows.filter(r => r.status === 'cancelled').length
    const termPasses = rows.filter(r => r.bookingType === 'term').length
    return { total, confirmed, pending, cancelled, termPasses }
  }, [rows])

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
        <h2 className="font-heading text-xl font-bold">Bookings</h2>
        <p className="mt-1 text-sm text-warm-gray">All bookings across every term. Filter to narrow down.</p>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-50 p-6 shadow-sm card-glow">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm card-glow text-center">
          <p className="font-heading text-2xl font-bold">{stats.total}</p>
          <p className="mt-1 text-xs text-warm-gray">Total</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm card-glow text-center">
          <p className="font-heading text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="mt-1 text-xs text-warm-gray">Confirmed</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm card-glow text-center">
          <p className="font-heading text-2xl font-bold text-gold">{stats.pending}</p>
          <p className="mt-1 text-xs text-warm-gray">Pending</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm card-glow text-center">
          <p className="font-heading text-2xl font-bold text-warm-gray">{stats.cancelled}</p>
          <p className="mt-1 text-xs text-warm-gray">Cancelled</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm card-glow text-center">
          <p className="font-heading text-2xl font-bold text-coral">{stats.termPasses}</p>
          <p className="mt-1 text-xs text-warm-gray">Term passes</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm card-glow">
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <input
            type="text"
            placeholder="Search parent or child name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          >
            <option value="all">All classes</option>
            {Object.entries(CLASSES).map(([key, cls]) => (
              <option key={key} value={key}>{cls.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          >
            <option value="all">All types</option>
            <option value="trial">Trial</option>
            <option value="single">Single</option>
            <option value="term">Term</option>
          </select>
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          >
            <option value="all">All terms</option>
            {uniqueTerms.map(t => (
              <option key={`${t.name}-${t.year}`} value={`${t.name} ${t.year}`}>
                {t.name} {t.year}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm card-glow">
        <table className="w-full text-sm">
          <thead className="bg-cream/60">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Created</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Parent</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Child</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Class</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Term</th>
              <th className="px-4 py-3 text-left font-semibold text-warm-gray">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-warm-gray">
                  No bookings match your filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream/30'}>
                  <td className="px-4 py-3">{row.createdAt}</td>
                  <td className="px-4 py-3">{row.parentName}</td>
                  <td className="px-4 py-3">{row.childName}</td>
                  <td className="px-4 py-3">{CLASSES[row.classType]?.name || row.classType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-600 ${
                      row.bookingType === 'term' ? 'bg-coral/15 text-coral' :
                      row.bookingType === 'single' ? 'bg-lilac/15 text-lilac' :
                      row.bookingType === 'trial' ? 'bg-gold/15 text-gold' :
                      'bg-warm-gray/15 text-warm-gray'
                    }`}>
                      {row.bookingType.charAt(0).toUpperCase() + row.bookingType.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.termLabel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-600 ${
                      row.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      row.status === 'pending' ? 'bg-gold/15 text-gold' :
                      row.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-warm-gray/15 text-warm-gray'
                    }`}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
