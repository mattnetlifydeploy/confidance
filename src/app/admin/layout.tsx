'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AdminSpinner, ToastProvider } from '@/components/admin'

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Today', href: '/admin/today' },
      { label: 'Check-in', href: '/admin/check-in' },
      { label: 'Bookings', href: '/admin/bookings' },
      { label: 'Waitlists', href: '/admin/waitlists' },
      { label: 'Payments Failed', href: '/admin/payments-failed' },
    ],
  },
  {
    label: 'Setup',
    items: [
      { label: 'Venues', href: '/admin/schools' },
      { label: 'Class Blueprints', href: '/admin/class-blueprints' },
      { label: 'Classes', href: '/admin/classes' },
      { label: 'Terms', href: '/admin/terms' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Families', href: '/admin/families' },
      { label: 'Parents', href: '/admin/parents' },
      { label: 'Waivers', href: '/admin/waivers' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Enquiries', href: '/admin/enquiries' },
      { label: 'Comms', href: '/admin/comms' },
      { label: 'Messages', href: '/admin/messages' },
      { label: 'Reports', href: '/admin/reports' },
    ],
  },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-20">
        <AdminSpinner />
      </div>
    )
  }

  if (!user || !profile?.is_admin) {
    router.push('/')
    return null
  }

  return (
    <ToastProvider>
      <section className="min-h-screen bg-cream pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:gap-8">
            <aside className="w-full shrink-0 md:w-56">
              <nav className="space-y-6">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-4 pb-1 font-heading text-[0.7rem] font-bold uppercase tracking-wider text-charcoal/40">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block rounded-2xl px-4 py-3 font-heading text-sm font-600 transition-all ${
                            isActive
                              ? 'bg-teal text-white'
                              : 'text-charcoal/70 hover:bg-white/50'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>

              <button
                onClick={async () => {
                  await signOut()
                  router.push('/')
                }}
                className="mt-8 w-full rounded-2xl border border-charcoal/20 px-4 py-3 font-heading text-sm font-600 text-charcoal/70 transition-all hover:bg-white/50 hover:text-teal"
              >
                Sign Out
              </button>
            </aside>

            <main className="flex-1 md:pl-8">
              <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                  Admin <span className="text-gradient">Dashboard</span>
                </h1>
                <p className="mt-2 text-charcoal/60">
                  Welcome back, {profile.full_name}
                </p>
              </div>

              {children}
            </main>
          </div>
        </div>
      </section>
    </ToastProvider>
  )
}
