import Link from 'next/link'
import type { Metadata } from 'next'
import { SchoolEnquiryForm } from '@/components/school-enquiry-form'
import { PlayfulMotionBg } from '@/components/playful-motion-bg'

export const metadata: Metadata = {
  title: 'Enquire for your school',
  description:
    'Register your school for Confidance after-school musical theatre clubs. Fully planned, performer-led and completely hands-off for your team. Free taster session for every school.',
}

const REASSURANCE = [
  { title: 'Zero admin', desc: 'We handle every booking, payment and parent message. Nothing for your staff to manage.' },
  { title: 'Free taster', desc: 'Every school gets a free taster session so pupils and staff can experience a club first-hand.' },
  { title: 'No commitment', desc: 'Jessica reviews every enquiry personally and replies within two working days.' },
]

export default function SchoolEnquirePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-24 text-white">
        <div className="blob absolute -right-32 -top-24 h-[480px] w-[480px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[440px] w-[440px] bg-teal-light/10 blur-3xl" />
        <PlayfulMotionBg variant="navy" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 font-heading text-sm font-600 text-pale backdrop-blur-sm">
            For Schools &middot; Enquiry
          </span>
          <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl">
            Bring Confidance to your <span className="font-script font-600 text-teal-light">school</span>
          </h1>
          <p className="reveal mx-auto mt-6 max-w-xl font-body text-lg text-pale/90">
            Tell us a little about your school and Jessica will be in touch within two working days to arrange a free
            taster session.
          </p>
          <p className="reveal mt-8 font-heading text-sm font-600 uppercase tracking-[0.25em] text-teal-light">
            Inspire &middot; Empower &middot; Shine
          </p>
        </div>
      </section>

      {/* ═══ FORM ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-12 grid max-w-4xl gap-5 sm:grid-cols-3">
            {REASSURANCE.map((r, i) => (
              <div key={r.title} className={`reveal stagger-${i + 1} card-glow rounded-2xl border border-teal-border bg-white p-6 text-center`}>
                <h2 className="font-heading text-lg font-700 text-navy">{r.title}</h2>
                <p className="mt-2 font-body text-sm text-charcoal-light">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="reveal">
            <SchoolEnquiryForm />
          </div>
          <p className="reveal mt-8 text-center font-body text-sm text-charcoal-light">
            Prefer to read more first?{' '}
            <Link href="/for-schools" className="animated-underline font-600 text-teal">
              See how the partnership works
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
