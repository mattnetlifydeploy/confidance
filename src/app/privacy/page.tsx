import Link from 'next/link'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy | Confidance',
  description: 'Privacy policy for Confidance. Information about how we protect your data and comply with UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-cream pt-32 pb-24">
        <AnimatedBubbles count={8} />
        <div className="blob absolute -right-40 -top-20 h-[400px] w-[400px] bg-lilac/8 blur-3xl" />

        {/* Decorative elements */}
        <div className="absolute left-[10%] top-[20%] text-coral/10 text-3xl">&#9733;</div>
        <div className="absolute right-[12%] bottom-[18%] text-lilac/10 text-2xl">&#9829;</div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 font-heading text-sm font-600 text-lilac-dark shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your privacy matters
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Privacy <span className="text-gradient-animated">Policy</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              How we collect, use, and protect your personal data.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 prose prose-sm max-w-none text-charcoal">
          <p className="text-sm text-warm-gray mb-8">Last updated: 29 June 2026</p>

          <h2 className="font-heading text-2xl font-bold">Data Controller</h2>
          <p>
            Confidance is the data controller of your personal information. You can contact us at {CONTACT_EMAIL}.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">What data we collect</h2>
          <p>
            When you book classes, we collect:
          </p>
          <ul>
            <li>Parent/guardian name, email, and phone number</li>
            <li>Child name, age, and date of birth</li>
            <li>Medical information you choose to share (e.g. allergies, medications)</li>
            <li>Emergency contact information</li>
            <li>Payment information (handled securely by Stripe)</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">Legal basis for processing</h2>
          <p>
            We process your data to fulfill our booking contract with you and to keep children safe. We also process some data to comply with UK law (e.g. keeping financial records).
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Data retention</h2>
          <ul>
            <li><strong>Financial records:</strong> Kept for 7 years (UK tax requirement)</li>
            <li><strong>Booking records:</strong> Kept for the duration of our service relationship and 1 year after the final class</li>
            <li><strong>Other personal data:</strong> Deleted on request or when no longer needed</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">Your rights under UK GDPR</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
            <li><strong>Rectification:</strong> Ask us to correct inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
            <li><strong>Restrict processing:</strong> Ask us to limit what we do with your data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
          </ul>
          <p>
            To exercise any of these rights, email {CONTACT_EMAIL}.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Data processors we use</h2>
          <ul>
            <li><strong>Stripe:</strong> Processes all payment information securely</li>
            <li><strong>Resend:</strong> Sends booking confirmation and class reminder emails</li>
            <li><strong>Supabase:</strong> Hosts our database and booking system</li>
          </ul>
          <p>
            We only share the minimum data needed with these services, and all are GDPR compliant.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Cookies</h2>
          <p>
            We only use essential session cookies to keep you logged in. We do not use tracking cookies, analytics cookies, or advertising cookies.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Security</h2>
          <p>
            Your data is encrypted in transit and at rest. We take security seriously and implement industry-standard protections. However, no system is 100% secure, so we cannot guarantee absolute security.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Children's privacy</h2>
          <p>
            We comply with UK law regarding children's online privacy. If you believe a child's data is being processed inappropriately, please contact us immediately.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of any significant changes by email or by posting a notice on our website.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">Contact us</h2>
          <p>
            If you have questions about this policy or your data, please contact us at {CONTACT_EMAIL}.
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-warm-gray">
              Have a question? / <Link href="/faqs" className="text-coral font-600 hover:text-coral-dark">See our FAQs</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
