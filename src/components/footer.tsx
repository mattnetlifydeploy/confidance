import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-white">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-coral/5 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-lilac/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="group inline-block font-heading text-2xl font-bold">
              <span className="transition-colors duration-300 group-hover:text-white/80">Confi</span>
              <span className="text-gradient-animated">dance</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Helping children aged 2 to 6 grow in confidence, creativity, and
              self expression through dance, singing, and movement.
            </p>
            {/* Social placeholder */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/confidancecommunity"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Confidance on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-coral/20 hover:text-coral"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-heading text-sm font-700 uppercase tracking-wider text-white/30">
              Navigate
            </h4>
            <ul className="mt-5 space-y-3">
              <FooterLink href="/about">About Jess</FooterLink>
              <FooterLink href="/classes">Our Classes</FooterLink>
              <FooterLink href="/timetable">Timetable</FooterLink>
              <FooterLink href="/faqs">FAQs</FooterLink>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="font-heading text-sm font-700 uppercase tracking-wider text-white/30">
              Get Started
            </h4>
            <ul className="mt-5 space-y-3">
              <FooterLink href="/register">Sign Up</FooterLink>
              <FooterLink href="/login">Log In</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
            </ul>
            <div className="mt-8">
              <a
                href="mailto:confidancejessica@gmail.com"
                className="group flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-coral"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                confidancejessica@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Confidance. All rights reserved.
          </p>
          <a
            href="https://brightloopmedia.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 transition-colors hover:text-white/40"
          >
            Site by Bright Loop Media
          </a>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Public Liability Insured
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              DBS Checked
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="relative text-sm text-white/50 transition-colors hover:text-coral"
      >
        {children}
      </Link>
    </li>
  )
}
