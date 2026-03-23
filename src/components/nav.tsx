'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_1px_30px_rgba(45,42,50,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group font-heading text-2xl font-bold text-charcoal">
          <span className="transition-colors duration-300 group-hover:text-charcoal-light">Confi</span>
          <span className="text-gradient-animated">dance</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="/about" active={pathname === '/about'}>About</NavLink>
          <NavLink href="/classes" active={pathname === '/classes'}>Classes</NavLink>
          <NavLink href="/timetable" active={pathname === '/timetable'}>Timetable</NavLink>
          <NavLink href="/faqs" active={pathname === '/faqs'}>FAQs</NavLink>
          <div className="ml-2 flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-cream px-4 py-2 font-heading text-sm font-600 text-charcoal transition-all hover:bg-coral hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-coral to-lilac text-xs font-bold text-white">
                  {profile?.full_name?.[0] || 'U'}
                </span>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-heading text-sm font-600 text-charcoal-light transition-colors hover:text-coral"
                >
                  Log In
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border bg-white/95 backdrop-blur-xl">
          <div className="flex flex-col gap-1 px-6 py-6">
            <MobileLink href="/about" active={pathname === '/about'}>About</MobileLink>
            <MobileLink href="/classes" active={pathname === '/classes'}>Classes</MobileLink>
            <MobileLink href="/timetable" active={pathname === '/timetable'}>Timetable</MobileLink>
            <MobileLink href="/faqs" active={pathname === '/faqs'}>FAQs</MobileLink>

            <div className="mt-4 border-t border-border pt-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl bg-cream p-3 font-heading text-sm font-600"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral to-lilac text-xs font-bold text-white">
                    {profile?.full_name?.[0] || 'U'}
                  </span>
                  My Dashboard
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`animated-underline relative font-heading text-sm font-600 transition-colors hover:text-coral ${
        active ? 'text-coral' : 'text-charcoal-light'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-3 font-heading text-lg font-600 transition-all hover:bg-cream hover:text-coral ${
        active ? 'bg-cream text-coral' : 'text-charcoal'
      }`}
    >
      {children}
    </Link>
  )
}
