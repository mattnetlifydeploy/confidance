'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getSupabase } from '@/lib/supabase'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { WaiverNudge } from '@/components/waiver-nudge'
import { CURRENT_TERM } from '@/lib/constants'
import { useClasses } from '@/lib/use-classes'
import { nextSessionDate, formatFullSession, whatToBring } from '@/lib/booking-display'
import type { Child, Booking } from '@/lib/database.types'

type PastBooking = Booking & { childName: string; className?: string }

type BannerRow = {
  id: string
  body: string
  audience: string
  published_at: string
  expires_at: string | null
}

export default function DashboardPage() {
  const { classes: CLASSES, venue: VENUE } = useClasses()
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [showAddChild, setShowAddChild] = useState(false)

  const [children, setChildren] = useState<Child[]>([])
  const [childrenLoading, setChildrenLoading] = useState(true)

  const [trialChildIds, setTrialChildIds] = useState<Set<string>>(new Set())

  const [pastBookings, setPastBookings] = useState<PastBooking[]>([])
  const [pastBookingsLoading, setPastBookingsLoading] = useState(true)

  const [banners, setBanners] = useState<BannerRow[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)

  const [activeWaiverNeeded, setActiveWaiverNeeded] = useState(false)

  type WaiverEntry = {
    waiver: { id: string; title: string; body_md: string; published_at: string }
    signed: boolean
    signedAt: string | null
  }
  const [waiverEntries, setWaiverEntries] = useState<WaiverEntry[]>([])
  const [waiversLoading, setWaiversLoading] = useState(true)
  const [signingWaiverId, setSigningWaiverId] = useState<string | null>(null)
  const [waiverSignatureText, setWaiverSignatureText] = useState('')

  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null)

  // Fetch children
  useEffect(() => {
    async function fetchChildren() {
      if (!user) return
      const supabase = getSupabase()
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .returns<Child[]>()
      setChildren(data || [])
      setChildrenLoading(false)
    }
    if (user) fetchChildren()
  }, [user])

  // Fetch bookings
  useEffect(() => {
    async function fetchPastBookings() {
      if (!user) return
      const supabase = getSupabase()

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .returns<Booking[]>()

      if (!bookingsData) {
        setPastBookingsLoading(false)
        return
      }

      // Track which children have used their trial
      const trialIds = new Set<string>()
      bookingsData.forEach((b) => {
        if (b.booking_type === 'trial') trialIds.add(b.child_id)
      })
      setTrialChildIds(trialIds)

      // Enrich with child names
      const enriched: PastBooking[] = bookingsData.map((booking) => {
        const child = children.find((c) => c.id === booking.child_id)
        const classInfo = CLASSES[booking.class_type as keyof typeof CLASSES]

        return {
          ...booking,
          childName: child?.name || 'Unknown',
          className: classInfo?.name ?? booking.class_type,
        }
      })

      setPastBookings(enriched)
      setPastBookingsLoading(false)
    }
    if (user) fetchPastBookings()
  }, [user, children])

  // Fetch banners
  useEffect(() => {
    async function fetchBanners() {
      if (!user) return
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch('/api/admin/banner', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setBanners(data.banners || [])
        }
      } catch {
        // Silent fail by design: banners are non-critical UI.
      } finally {
        setBannersLoading(false)
      }
    }
    if (user) fetchBanners()
  }, [user])

  // Fetch active waiver status
  useEffect(() => {
    async function fetchActiveWaiverStatus() {
      if (!user) return
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const res = await fetch('/api/waivers/active', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setActiveWaiverNeeded(!!data.waiver && !data.signed)
        }
      } catch {
        // Silent fail by design
      }
    }
    if (user) fetchActiveWaiverStatus()
  }, [user])

  // Fetch waivers
  const fetchWaivers = async () => {
    if (!user) return
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/waivers/mine', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setWaiverEntries(data.entries || [])
      }
    } catch {
      // Silent fail by design
    } finally {
      setWaiversLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchWaivers()
  }, [user, fetchWaivers])

  if (loading) {
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

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <section className="relative min-h-screen bg-cream px-6 pt-32 pb-20">
      <AnimatedBubbles count={6} />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Waiver Nudge */}
        {activeWaiverNeeded && <WaiverNudge needsWaiver={true} />}

        {/* Header */}
        <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">
              Hello, <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="mt-1 text-charcoal-light">{profile?.email}</p>
          </div>
          <div className="flex gap-2 sm:flex-row">
            <Link href="/account" className="btn-secondary text-sm">
              Account
            </Link>
            <button onClick={signOut} className="btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </div>

        {/* Banners */}
        {banners.length > 0 && !bannersLoading && (
          <div className="reveal mt-10 space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-3xl bg-coral/10 p-6 shadow-sm card-glow">
                <p className="text-sm text-charcoal">{banner.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="reveal mt-10 grid gap-4 sm:grid-cols-3">
          <Link href="/book" className="card-glow group rounded-3xl bg-white p-6 text-center transition-all">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10 text-coral transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="mt-3 font-heading text-sm font-700">Book a Class</p>
          </Link>
          <button
            onClick={() => setShowAddChild(true)}
            className="card-glow group rounded-3xl bg-white p-6 text-center transition-all"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-lilac/10 text-lilac-dark transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="mt-3 font-heading text-sm font-700">Add Child</p>
          </button>
          <Link href="/timetable" className="card-glow group rounded-3xl bg-white p-6 text-center transition-all">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mt-3 font-heading text-sm font-700">View Timetable</p>
          </Link>
        </div>

        {/* Active Bookings */}
        {(() => {
          const activeBookings = pastBookings.filter((b) => b.status === 'confirmed')
          if (pastBookingsLoading || activeBookings.length === 0) return null
          return (
            <div className="reveal mt-10">
              <h2 className="font-heading text-xl font-bold">Active Bookings</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {activeBookings.map((booking) => {
                  const today = new Date().toISOString().slice(0, 10)
                  const nextSession = booking.booking_type === 'term'
                    ? nextSessionDate(booking.term_name, booking.term_year, today)
                    : null
                  const sessionDisplay = nextSession
                    ? formatFullSession(nextSession, booking.class_type, CLASSES)
                    : `${CLASSES[booking.class_type as keyof typeof CLASSES]?.day || 'Thursday'}, ${CLASSES[booking.class_type as keyof typeof CLASSES]?.time || 'TBA'}`

                  return (
                    <div key={booking.id} className="card-glow rounded-3xl bg-white p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/15 to-lilac/15">
                          <svg className="h-6 w-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading text-base font-bold">{booking.className}</h3>
                          <p className="text-xs text-warm-gray">
                            {booking.booking_type === 'term' ? `${CURRENT_TERM.name} Term ${CURRENT_TERM.year}` : booking.booking_type === 'single' ? 'Single Session' : 'Free Trial'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-700 text-green-700">Active</span>
                        </div>

                        <div className="text-warm-gray">
                          <strong className="text-charcoal">{booking.childName}</strong>
                        </div>

                        <div className="text-warm-gray">
                          Next session<span className="font-medium text-charcoal">: {sessionDisplay}</span>
                        </div>

                        <div className="text-warm-gray">
                          <strong className="text-charcoal">{VENUE.name}</strong>
                          <div className="mt-1 text-xs text-charcoal-light">{VENUE.address}</div>
                        </div>

                        <div className="text-xs text-warm-gray italic">
                          {whatToBring()}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {booking.stripe_session_id && (
                            <a
                              href={`/api/bookings/${booking.id}/invoice`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-600 text-blue-600 transition-all hover:bg-blue-100"
                            >
                              Download Invoice
                            </a>
                          )}
                          {booking.booking_type === 'single' && (
                            <button
                              onClick={() => setRescheduleBookingId(booking.id)}
                              className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-600 text-indigo-600 transition-all hover:bg-indigo-100"
                            >
                              Reschedule
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to cancel this booking?')) return
                              const supabase = getSupabase()
                              await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
                              setPastBookings((prev) =>
                                prev.map((b) => b.id === booking.id ? { ...b, status: 'cancelled' } : b),
                              )
                            }}
                            className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-600 text-red-600 transition-all hover:bg-red-100"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Waivers */}
        {!waiversLoading && waiverEntries.length > 0 && (
          <div id="waivers" className="reveal mt-12">
            <h2 className="font-heading text-xl font-bold">Waivers</h2>
            <div className="mt-6 space-y-4">
              {waiverEntries.map((entry) => {
                const statusText = entry.signed
                  ? `Signed on ${new Date(entry.signedAt || '').toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Not signed'

                return (
                  <div
                    key={entry.waiver.id}
                    className="rounded-3xl bg-white p-6 shadow-sm card-glow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading text-base font-bold">{entry.waiver.title}</h3>
                        <p className={`mt-1 text-sm ${entry.signed ? 'text-green-600' : 'text-warm-gray'}`}>
                          {statusText}
                        </p>
                      </div>
                      {(!entry.signed || true) && (
                        <button
                          onClick={() => {
                            if (signingWaiverId === entry.waiver.id) {
                              setSigningWaiverId(null)
                              setWaiverSignatureText('')
                            } else {
                              setSigningWaiverId(entry.waiver.id)
                              setWaiverSignatureText('')
                            }
                          }}
                          className="shrink-0 font-heading text-sm font-600 text-coral transition-colors hover:text-coral-dark"
                        >
                          {entry.signed ? 'Re-sign' : 'Sign'}
                        </button>
                      )}
                    </div>

                    {signingWaiverId === entry.waiver.id && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        <input
                          type="text"
                          value={waiverSignatureText}
                          onChange={(e) => setWaiverSignatureText(e.target.value)}
                          placeholder="Enter your full name to sign"
                          maxLength={120}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        />
                        <button
                          onClick={async () => {
                            if (waiverSignatureText.trim().length < 2) return
                            try {
                              const supabase = getSupabase()
                              const { data: { session } } = await supabase.auth.getSession()
                              if (!session?.access_token) throw new Error('Not authenticated')

                              const res = await fetch('/api/waivers/sign', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${session.access_token}`,
                                },
                                body: JSON.stringify({
                                  waiverId: entry.waiver.id,
                                  signatureText: waiverSignatureText,
                                }),
                              })

                              if (!res.ok) throw new Error('Failed to sign waiver')

                              setSigningWaiverId(null)
                              setWaiverSignatureText('')
                              await fetchWaivers()
                            } catch {
                              // Silent fail - user can retry
                            }
                          }}
                          disabled={waiverSignatureText.trim().length < 2}
                          className="w-full rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Confirm Signature
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Children */}
        <div className="reveal mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Your Children</h2>
            <button
              onClick={() => setShowAddChild(true)}
              className="font-heading text-sm font-600 text-coral transition-colors hover:text-coral-dark"
            >
              + Add child
            </button>
          </div>

          {childrenLoading ? (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <span className="dancing-dot bg-coral" />
                <span className="dancing-dot bg-lilac" />
                <span className="dancing-dot bg-gold" />
              </div>
            </div>
          ) : children.length === 0 ? (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-border bg-white/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lilac/10">
                <svg
                  className="h-8 w-8 text-lilac-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold">No children added yet</h3>
              <p className="mt-2 text-sm text-charcoal-light">Add your child to start booking dance classes</p>
              <button onClick={() => setShowAddChild(true)} className="btn-primary mt-6 text-sm">
                Add Your First Child
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  trialUsed={trialChildIds.has(child.id)}
                  onDelete={() => {
                    setChildren(children.filter((c) => c.id !== child.id))
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Booking History */}
        <div className="reveal mt-12">
          <h2 className="font-heading text-xl font-bold">Booking History</h2>

          {pastBookingsLoading ? (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <span className="dancing-dot bg-coral" />
                <span className="dancing-dot bg-lilac" />
                <span className="dancing-dot bg-gold" />
              </div>
            </div>
          ) : pastBookings.length === 0 ? (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-border bg-white/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral/10">
                <svg
                  className="h-8 w-8 text-coral"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold">No booking history yet</h3>
              <p className="mt-2 text-sm text-charcoal-light">Book a class to get started</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {pastBookings.map((booking) => (
                <BookingHistoryCard
                  key={booking.id}
                  booking={booking}
                  onCancel={(id) => {
                    setPastBookings((prev) =>
                      prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b),
                    )
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Child Modal */}
        {showAddChild && (
          <AddChildModal
            onClose={() => setShowAddChild(false)}
            onAdded={(newChild) => {
              setShowAddChild(false)
              setChildren([...children, newChild])
            }}
            parentId={user.id}
          />
        )}

        {/* Reschedule Modal */}
        {rescheduleBookingId && (
          <RescheduleModal
            bookingId={rescheduleBookingId}
            onClose={() => setRescheduleBookingId(null)}
            onSuccess={async () => {
              setRescheduleBookingId(null)
              // Refetch bookings to show updated date
              if (!user) return
              const supabase = getSupabase()
              const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .eq('parent_id', user.id)
                .order('created_at', { ascending: false })
              if (bookingsData && Array.isArray(bookingsData)) {
                const enriched: PastBooking[] = (bookingsData as Booking[]).map((booking) => {
                  const child = children.find((c) => c.id === booking.child_id)
                  const classInfo = CLASSES[booking.class_type as keyof typeof CLASSES]
                  return {
                    ...booking,
                    childName: child?.name || 'Unknown',
                    className: classInfo?.name || booking.class_type,
                  } as PastBooking
                })
                setPastBookings(enriched)
              }
            }}
          />
        )}
      </div>
    </section>
  )
}

function BookingHistoryCard({ booking, onCancel }: { booking: PastBooking; onCancel?: (id: string) => void }) {
  const { venue: VENUE } = useClasses()
  const [cancelling, setCancelling] = useState(false)
  const formattedDate = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A'

  const statusColors: Record<string, string> = {
    pending: 'bg-gold/15 text-gold',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  }
  const statusColor = statusColors[booking.status] || 'bg-cream text-warm-gray'

  return (
    <div className="card-glow rounded-3xl bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/15 to-lilac/15">
            <svg className="h-6 w-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-heading text-base font-bold">{booking.className}</h3>
            <p className="text-sm text-warm-gray">{VENUE.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-700 capitalize ${statusColor}`}>
            {booking.status}
          </span>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-600 text-charcoal-light">
            {booking.booking_type === 'term' ? 'Full Term' : booking.booking_type === 'single' ? 'Single Session' : 'Trial'}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-warm-gray">
        <span>Child: <strong className="text-charcoal">{booking.childName}</strong></span>
        <span>Booked: <strong className="text-charcoal">{formattedDate}</strong></span>
        <span>Class: <strong className="text-charcoal">{booking.className}</strong></span>
        <div className="ml-auto flex gap-2">
          {booking.stripe_session_id && (
            <a
              href={`/api/bookings/${booking.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-600 text-blue-600 transition-all hover:bg-blue-100"
            >
              Download Invoice
            </a>
          )}
          {booking.status === 'confirmed' && onCancel && (
            <button
              onClick={async () => {
                if (!confirm('Are you sure you want to cancel this booking?')) return
                setCancelling(true)
                const supabase = getSupabase()
                await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
                onCancel(booking.id)
                setCancelling(false)
              }}
              disabled={cancelling}
              className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-600 text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ChildCard({ child, trialUsed, onDelete }: { child: Child; trialUsed: boolean; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Remove ${child.name}?`)) return
    setDeleting(true)
    const supabase = getSupabase()
    await supabase.from('children').delete().eq('id', child.id)
    onDelete()
  }

  return (
    <div className="card-glow group rounded-3xl bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-lilac/20 font-heading text-lg font-bold text-coral">
            {child.name[0]}
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold">{child.name}</h3>
            <p className="text-sm text-warm-gray">
              Age {child.age} {trialUsed ? '(Trial used)' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-warm-gray transition-colors hover:text-red-500"
          title="Remove child"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      {child.medical_info && (
        <div className="mt-4 rounded-xl bg-cream-dark p-3">
          <p className="text-xs text-warm-gray">Medical: {child.medical_info}</p>
        </div>
      )}
      <Link href="/book" className="btn-primary mt-4 w-full text-center text-sm">
        Book for {child.name}
      </Link>
    </div>
  )
}

type RescheduleOption = {
  date: string
  available: boolean
}

function RescheduleModal({
  bookingId,
  onClose,
  onSuccess,
}: {
  bookingId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [options, setOptions] = useState<RescheduleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function fetchOptions() {
      try {
        setError('')
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setError('Authentication failed')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/bookings/${bookingId}/reschedule-options`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to load available dates')
          setLoading(false)
          return
        }

        const data = await res.json()
        setOptions(data.options || [])
        setLoading(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(msg)
        setLoading(false)
      }
    }

    fetchOptions()
  }, [bookingId])

  async function handleConfirm() {
    if (!selectedDate) return

    setSubmitting(true)
    setError('')

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Authentication failed')
        setSubmitting(false)
        return
      }

      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ newDate: selectedDate }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          setError('This date is now full. Please choose another.')
        } else {
          setError(data.error || 'Failed to reschedule')
        }
        setSubmitting(false)
        return
      }

      setSuccessMsg('Booking rescheduled successfully')
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm px-6">
      <div className="gradient-border w-full max-w-md">
        <div className="rounded-3xl bg-white p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Reschedule Booking</h2>
            <button onClick={onClose} className="text-warm-gray hover:text-charcoal transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <span className="dancing-dot bg-coral" />
                <span className="dancing-dot bg-lilac" />
                <span className="dancing-dot bg-gold" />
              </div>
            </div>
          )}

          {!loading && error && !successMsg && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && successMsg && (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600">
              {successMsg}
            </div>
          )}

          {!loading && !successMsg && options.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="text-sm text-warm-gray">
                Select an available date for your session:
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.date}
                    onClick={() => option.available && setSelectedDate(option.date)}
                    disabled={!option.available}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      option.available
                        ? selectedDate === option.date
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${option.available ? 'text-charcoal' : 'text-charcoal-light'}`}>
                        {new Date(option.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {!option.available && (
                        <span className="text-xs font-600 text-warm-gray">Full</span>
                      )}
                      {option.available && selectedDate === option.date && (
                        <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedDate || submitting}
                  className="btn-primary flex-1 text-sm disabled:opacity-50"
                >
                  {submitting ? 'Rescheduling...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {!loading && !successMsg && options.length === 0 && !error && (
            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-600">
              No available dates at this time
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddChildModal({
  onClose,
  onAdded,
  parentId,
}: {
  onClose: () => void
  onAdded: (child: Child) => void
  parentId: string
}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [medicalInfo, setMedicalInfo] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (name.length < 2) {
      setError("Please enter your child's name")
      return
    }

    const ageNum = parseInt(age)
    if (!ageNum || ageNum < 2 || ageNum > 6) {
      setError('Age must be between 2 and 6')
      return
    }

    setSaving(true)

    const supabase = getSupabase()
    const { data, error: dbError } = await supabase
      .from('children')
      .insert({
        parent_id: parentId,
        name,
        age: ageNum,
        medical_info: medicalInfo || null,
      })
      .select()
      .single()

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    if (data) {
      onAdded(data as Child)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm px-6">
      <div className="gradient-border w-full max-w-md">
        <div className="rounded-3xl bg-white p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Add a child</h2>
            <button onClick={onClose} className="text-warm-gray hover:text-charcoal transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="font-heading text-sm font-700">Child&apos;s name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input mt-2"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="font-heading text-sm font-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="auth-input mt-2"
                placeholder="2 to 6"
                min="2"
                max="6"
                required
              />
            </div>

            <div>
              <label className="font-heading text-sm font-700">Medical info / allergies</label>
              <textarea
                value={medicalInfo}
                onChange={(e) => setMedicalInfo(e.target.value)}
                className="auth-input mt-2"
                placeholder="Leave blank if none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Child'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
