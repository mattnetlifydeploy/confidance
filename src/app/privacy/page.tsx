import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Confidance collects, uses, and protects your personal data. GDPR-compliant privacy policy for our children\'s dance classes in Hammersmith.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <section className="relative overflow-hidden bg-cream pt-32 pb-24">
      <div className="blob absolute -right-40 -top-20 h-[500px] w-[500px] bg-lilac/8 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6">
        <h1 className="reveal font-heading text-4xl font-bold md:text-5xl">
          Privacy <span className="text-gradient">Policy</span>
        </h1>
        <p className="reveal mt-4 text-sm text-warm-gray">Last updated: 1 April 2026</p>

        <div className="reveal mt-12 space-y-10 text-charcoal-light leading-relaxed">
          <Section title="1. Who we are">
            <p>
              Confidance is a children&apos;s dance and confidence-building class operated by
              Jessica Lauren Murphy (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
              We are based in Hammersmith, London and run classes at the Grove Neighbourhood
              Centre, 7 Bradmore Park Road, W6 0DT.
            </p>
            <p className="mt-3">
              For any questions about this policy, contact us at{' '}
              <a href="mailto:confidancejessica@gmail.com" className="text-coral hover:underline">
                confidancejessica@gmail.com
              </a>.
            </p>
          </Section>

          <Section title="2. What data we collect">
            <p>When you create an account and book classes, we collect:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>Parent/guardian name and email address</li>
              <li>Child&apos;s first name, date of birth, and age</li>
              <li>Any medical conditions or additional needs you choose to share</li>
              <li>Emergency contact details</li>
              <li>Booking history and payment records</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> collect or store credit/debit card numbers.
              All payments are processed securely by Stripe, our PCI-DSS Level 1 compliant
              payment processor.
            </p>
          </Section>

          <Section title="3. Why we collect it (legal basis)">
            <p>We process your personal data on the following bases under UK GDPR:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                <strong>Contract</strong> &mdash; to manage your bookings, process payments,
                and deliver the classes you have paid for
              </li>
              <li>
                <strong>Legitimate interest</strong> &mdash; to keep children safe during classes
                (medical/allergy information, emergency contacts)
              </li>
              <li>
                <strong>Consent</strong> &mdash; to send you occasional updates about new terms,
                schedule changes, or class news (you can opt out at any time)
              </li>
            </ul>
          </Section>

          <Section title="4. How we store and protect your data">
            <p>
              Your data is stored securely using Supabase, a cloud database provider with
              ISO 27001 certification and SOC 2 Type II compliance. Data is encrypted at
              rest and in transit. Access is controlled through row-level security policies,
              meaning users can only access their own data.
            </p>
            <p className="mt-3">
              Payment processing is handled entirely by Stripe. We never see, store, or
              have access to your full card details.
            </p>
          </Section>

          <Section title="5. Who we share your data with">
            <p>We share data only with the following third-party processors:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li><strong>Supabase</strong> &mdash; database hosting and authentication</li>
              <li><strong>Stripe</strong> &mdash; payment processing</li>
              <li><strong>Vercel</strong> &mdash; website hosting</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with any other third parties
              for marketing purposes.
            </p>
          </Section>

          <Section title="6. How long we keep your data">
            <p>
              We retain your account data for as long as your account is active. Booking and
              payment records are kept for 6 years after the transaction to comply with UK
              tax and accounting obligations. If you delete your account, we will remove your
              personal data within 30 days, except where we are legally required to retain it.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li><strong>Access</strong> &mdash; request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> &mdash; ask us to correct inaccurate data</li>
              <li><strong>Erasure</strong> &mdash; ask us to delete your data (subject to legal retention requirements)</li>
              <li><strong>Restriction</strong> &mdash; ask us to limit how we use your data</li>
              <li><strong>Portability</strong> &mdash; receive your data in a machine-readable format</li>
              <li><strong>Object</strong> &mdash; object to processing based on legitimate interest</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:confidancejessica@gmail.com" className="text-coral hover:underline">
                confidancejessica@gmail.com
              </a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Children's data">
            <p>
              We collect limited data about children (first name, date of birth, medical
              information) solely for the purpose of safely delivering our classes. This
              data is provided by a parent or guardian and is never shared publicly.
              Children do not have accounts &mdash; all data is managed through the
              parent/guardian&apos;s account.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              Our website uses only essential cookies required for authentication and
              session management. We do not use tracking cookies, analytics cookies, or
              third-party advertising cookies. No cookie consent banner is required as we
              only use strictly necessary cookies under the UK Privacy and Electronic
              Communications Regulations (PECR).
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this policy from time to time. Any changes will be posted on
              this page with an updated revision date. If we make significant changes, we
              will notify you by email.
            </p>
          </Section>

          <Section title="11. Complaints">
            <p>
              If you are unhappy with how we handle your data, you have the right to
              complain to the Information Commissioner&apos;s Office (ICO) at{' '}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:underline"
              >
                ico.org.uk
              </a>{' '}
              or by calling 0303 123 1113.
            </p>
          </Section>
        </div>
      </div>
    </section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-charcoal">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}
