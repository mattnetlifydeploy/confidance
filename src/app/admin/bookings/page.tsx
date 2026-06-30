'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES } from '@/lib/constants'
import type { Booking, Child, Profile } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'
import {
  AdminBanner,
  AdminCard,
  AdminPageHeader,
  AdminSpinner,
  Button,
  ConfirmDialog,
  EmptyState,
  FormField,
  Input,
  Modal,
  Select,
  StatTile,
  StatusBadge,
  type BadgeTone,
  useToast,
} from '@/components/admin'

type BookingRow = {
  id: string
  createdAt: string
  parentName: string
  childName: string
  classType: ClassType
  bookingType: string
  termLabel: string
  status: string
  amountPaidPence: number
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'refunded'] as const
type StatusOption = (typeof STATUS_OPTIONS)[number]

// cancelled / refunded are irreversible-feeling moves: confirm before applying.
const DESTRUCTIVE: StatusOption[] = ['cancelled', 'refunded']

const TYPE_TONE: Record<string, BadgeTone> = {
  term: 'teal',
  single: 'info',
  trial: 'warning',
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function BookingsPage() {
  const toast = useToast()
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

  // Manage modal: the booking being edited + the chosen next status.
  const [manageId, setManageId] = useState<string | null>(null)
  const [nextStatus, setNextStatus] = useState<StatusOption>('pending')
  const [saving, setSaving] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<StatusOption | null>(null)

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

      const childIds = [...new Set(bookingsList.map((b) => b.child_id))]
      const parentIds = [...new Set(bookingsList.map((b) => b.parent_id))]

      let childrenData: Child[] = []
      let profilesData: Profile[] = []

      if (childIds.length > 0) {
        const childRes = await supabase.from('children').select('*').in('id', childIds)
        if (childRes.error) throw new Error(childRes.error.message)
        childrenData = (childRes.data || []) as Child[]
      }

      if (parentIds.length > 0) {
        const profileRes = await supabase.from('profiles').select('*').in('id', parentIds)
        if (profileRes.error) throw new Error(profileRes.error.message)
        profilesData = (profileRes.data || []) as Profile[]
      }

      setChildrenMap(new Map(childrenData.map((c) => [c.id, c])))
      setProfilesMap(new Map(profilesData.map((p) => [p.id, p])))
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
    const terms = new Map<string, { name: string; year: number }>()
    bookings.forEach((b) => {
      if (b.term_name && b.term_year) {
        const key = `${b.term_name}-${b.term_year}`
        terms.set(key, { name: b.term_name, year: b.term_year })
      }
    })
    return Array.from(terms.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      const termOrder = { Spring: 0, Summer: 1, Autumn: 2 }
      return (
        (termOrder[a.name as keyof typeof termOrder] ?? 99) -
        (termOrder[b.name as keyof typeof termOrder] ?? 99)
      )
    })
  }, [bookings])

  const rows: BookingRow[] = useMemo(() => {
    return bookings.map((b) => ({
      id: b.id,
      createdAt: new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      }).format(new Date(b.created_at)),
      parentName: profilesMap.get(b.parent_id)?.full_name || 'Unknown',
      childName: childrenMap.get(b.child_id)?.name || 'Unknown',
      classType: b.class_type as ClassType,
      bookingType: b.booking_type,
      termLabel: b.term_name && b.term_year ? `${b.term_name} ${b.term_year}` : '.',
      status: b.status,
      amountPaidPence: b.amount_paid_pence,
    }))
  }, [bookings, childrenMap, profilesMap])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
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
    const confirmed = rows.filter((r) => r.status === 'confirmed').length
    const pending = rows.filter((r) => r.status === 'pending').length
    const cancelled = rows.filter((r) => r.status === 'cancelled').length
    const termPasses = rows.filter((r) => r.bookingType === 'term').length
    return { total, confirmed, pending, cancelled, termPasses }
  }, [rows])

  const manageRow = useMemo(
    () => rows.find((r) => r.id === manageId) ?? null,
    [rows, manageId],
  )

  const openManage = (row: BookingRow) => {
    setManageId(row.id)
    setNextStatus(row.status as StatusOption)
  }

  const closeManage = () => {
    setManageId(null)
    setConfirmStatus(null)
  }

  const applyStatus = async (status: StatusOption) => {
    if (!manageId) return
    try {
      setSaving(true)
      const { data: session } = await getSupabase().auth.getSession()
      const token = session?.session?.access_token
      if (!token) throw new Error('Not authenticated')

      const res = await fetch(`/api/admin/bookings/${manageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to update booking')
      }

      setBookings((prev) => prev.map((b) => (b.id === manageId ? { ...b, status } : b)))
      toast.success(`Booking marked ${status}`)
      closeManage()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update booking')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    if (!manageRow) return
    if (nextStatus === manageRow.status) {
      closeManage()
      return
    }
    if (DESTRUCTIVE.includes(nextStatus)) {
      setConfirmStatus(nextStatus)
      return
    }
    applyStatus(nextStatus)
  }

  if (loading) {
    return (
      <div className="mt-6">
        <AdminSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Bookings"
        description="All bookings across term. Filter to narrow down, then manage status per booking."
      />

      {error && <AdminBanner tone="error">{error}</AdminBanner>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="Total" value={stats.total} />
        <StatTile label="Confirmed" value={stats.confirmed} tone="success" />
        <StatTile label="Pending" value={stats.pending} tone="warning" />
        <StatTile label="Cancelled" value={stats.cancelled} tone="danger" />
        <StatTile label="Term passes" value={stats.termPasses} tone="teal" />
      </div>

      <AdminCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <Input
            type="text"
            placeholder="Search parent or child name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="all">All classes</option>
            {Object.entries(CLASSES).map(([key, cls]) => (
              <option key={key} value={key}>
                {cls.name}
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="trial">Trial</option>
            <option value="single">Single</option>
            <option value="term">Term</option>
          </Select>
          <Select value={termFilter} onChange={(e) => setTermFilter(e.target.value)}>
            <option value="all">All terms</option>
            {uniqueTerms.map((t) => (
              <option key={`${t.name}-${t.year}`} value={`${t.name} ${t.year}`}>
                {t.name} {t.year}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60">
              <tr>
                {['Created', 'Parent', 'Child', 'Class', 'Type', 'Term', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-charcoal-light">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <EmptyState
                      title="No bookings match your filters"
                      description="Adjust the filters above to see more results."
                    />
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-cream/30'}
                  >
                    <td className="px-4 py-3 text-charcoal">{row.createdAt}</td>
                    <td className="px-4 py-3 text-charcoal">{row.parentName}</td>
                    <td className="px-4 py-3 text-charcoal">{row.childName}</td>
                    <td className="px-4 py-3 text-charcoal">
                      {CLASSES[row.classType]?.name || row.classType}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={cap(row.bookingType)}
                        tone={TYPE_TONE[row.bookingType] ?? 'neutral'}
                      />
                    </td>
                    <td className="px-4 py-3 text-charcoal">{row.termLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={cap(row.status)} status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => openManage(row)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <Modal
        open={manageRow !== null}
        onClose={closeManage}
        title="Manage booking"
        size="md"
        footer={
          <>
            <Button loading={saving} onClick={handleSave}>
              Save
            </Button>
            <Button variant="secondary" onClick={closeManage} disabled={saving}>
              Cancel
            </Button>
          </>
        }
      >
        {manageRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-charcoal/10 bg-cream/40 p-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-charcoal/50">Parent</p>
                <p className="font-medium text-charcoal">{manageRow.parentName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-charcoal/50">Child</p>
                <p className="font-medium text-charcoal">{manageRow.childName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-charcoal/50">Class</p>
                <p className="font-medium text-charcoal">
                  {CLASSES[manageRow.classType]?.name || manageRow.classType}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-charcoal/50">Paid</p>
                <p className="font-medium text-charcoal">
                  £{(manageRow.amountPaidPence / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <FormField
              label="Status"
              hint="Cancelled or refunded frees the class slot. No Stripe refund is triggered here."
            >
              <Select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as StatusOption)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {cap(s)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmStatus !== null}
        title={confirmStatus === 'refunded' ? 'Mark as refunded' : 'Cancel booking'}
        message={
          confirmStatus === 'refunded'
            ? 'This marks the booking as refunded and frees the class slot. Process the actual Stripe refund separately.'
            : 'This cancels the booking and frees the class slot. Continue?'
        }
        confirmLabel={confirmStatus === 'refunded' ? 'Mark refunded' : 'Cancel booking'}
        loading={saving}
        onConfirm={() => confirmStatus && applyStatus(confirmStatus)}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  )
}
