'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const NAV_ITEMS = [
  { label: 'Today', href: '/admin/today' },
  { label: 'Check-in', href: '/admin/check-in' },
  { label: 'Bookings', href: '/admin/bookings' },
  { label: 'Payments Failed', href: '/admin/payments-failed' },
  { label: 'Families', href: '/admin/families' },
  { label: 'Classes', href: '/admin/classes' },
  { label: 'Terms', href: '/admin/terms' },
  { label: 'Waivers', href: '/admin/waivers' },
  { label: 'Waitlists', href: '/admin/waitlists' },
  { label: 'Comms', href: '/admin/comms' },
  { label: 'Messages', href: '/admin/messages' },
  { label: 'Reports', href: '/admin/reports' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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

  if (!user || !profile?.is_admin) {
    router.push('/')
    return null
  }

  return (
    <section className="min-h-screen bg-cream pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:gap-8">
          <aside className="w-full shrink-0 md:w-56">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 font-heading text-sm font-600 transition-all ${
                      isActive
                        ? 'bg-coral text-white'
                        : 'text-warm-gray hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={async () => {
                await signOut()
                router.push('/')
              }}
              className="mt-8 w-full rounded-2xl border border-warm-gray/20 px-4 py-3 font-heading text-sm font-600 text-warm-gray transition-all hover:bg-white/50 hover:text-coral"
            >
              Sign Out
            </button>
          </aside>

          <main className="flex-1 md:pl-8">
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold md:text-4xl">
                Admin <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="mt-2 text-warm-gray">
                Welcome back, {profile.full_name}
              </p>
            </div>

            {children}
          </main>
        </div>
      </div>
    </section>
  )
}
