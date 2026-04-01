import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for booking Confidance children\'s dance classes in Hammersmith, London. Includes booking, cancellation, payment, and safety policies.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <section className="relative overflow-hidden bg-cream pt-32 pb-24">
      <div className="blob absolute -right-40 -top-20 h-[500px] w-[500px] bg-lilac/8 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6">
        <h1 className="reveal font-heading text-4xl font-bold md:text-5xl">
          Terms & <span className="text-gradient">Conditions</span>
        </h1>
        <p className="reveal mt-4 text-sm text-warm-gray">Last updated: 1 April 2026</p>

        <div className="reveal mt-12 space-y-10 text-charcoal-light leading-relaxed">
          <Section title="1. About these terms">
            <p>
              These terms and conditions govern your use of the Confidance website and
              your booking of our children&apos;s dance classes. By creating an account
              or booking a class, you agree to these terms. Confidance is operated by
              Jessica Lauren Murphy.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              Classes are open to children aged 2 to 6 years. A parent or legal guardian
              must create the account and make all bookings on behalf of the child. By
              booking, you confirm that you are the parent or legal guardian of the child
              attending, or have their parent/guardian&apos;s express permission.
            </p>
          </Section>

          <Section title="3. Bookings and payment">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>All bookings are made through our website and paid for at the time of booking via Stripe.</li>
              <li>Prices are displayed in GBP and include VAT where applicable.</li>
              <li>A <strong>single session</strong> costs &pound;12. A <strong>term pass</strong> is &pound;10 per session.</li>
              <li>Your first class is a <strong>free trial</strong> &mdash; no payment is required.</li>
              <li>A booking is confirmed once payment has been successfully processed and you receive a confirmation email.</li>
              <li>Places are limited and allocated on a first-come, first-served basis.</li>
            </ul>
          </Section>

          <Section title="4. Cancellations and refunds">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                <strong>Single sessions</strong> &mdash; cancellations made more than 48 hours
                before the class will receive a full refund. Cancellations within 48 hours are
                non-refundable but may be offered a session credit at our discretion.
              </li>
              <li>
                <strong>Term passes</strong> &mdash; term bookings are non-refundable once the
                term has started, except in exceptional circumstances (e.g. illness with a
                doctor&apos;s note). Unused sessions cannot be carried forward to future terms
                unless the class is cancelled by us.
              </li>
              <li>
                <strong>Cancellations by us</strong> &mdash; if we need to cancel a class (e.g.
                teacher illness, venue unavailability), all affected families will receive a
                session credit that can be used in the same term or the following term.
              </li>
              <li>
                We reserve the right to cancel or reschedule classes in the event of circumstances
                beyond our control, including severe weather or venue closure.
              </li>
            </ul>
          </Section>

          <Section title="5. Class conduct and safety">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                A parent or guardian must remain in the venue for the duration of every class.
                Children are not to be left unattended.
              </li>
              <li>
                Please inform us of any medical conditions, allergies, or additional needs your
                child may have before their first class. This information is treated confidentially.
              </li>
              <li>
                We reserve the right to refuse entry or ask a child to leave a class if their
                behaviour is disruptive or poses a safety risk to themselves or others.
              </li>
              <li>
                All our staff hold valid DBS checks and we maintain public liability insurance.
              </li>
            </ul>
          </Section>

          <Section title="6. Health and wellbeing">
            <p>
              Please do not bring your child to class if they are unwell, particularly with any
              contagious illness (including but not limited to chickenpox, hand foot and mouth
              disease, conjunctivitis, or gastric illness). Children should be symptom-free for
              at least 48 hours before returning to class. No refund or credit is given for
              missed classes due to illness, though we will consider exceptional circumstances.
            </p>
          </Section>

          <Section title="7. Photography and media">
            <p>
              We may occasionally take photographs or short video clips during classes for use
              on our website and social media channels. We will always ask for your consent
              before using any images featuring your child. If you do not wish your child to
              be photographed, please let us know before the class and we will ensure they are
              not included.
            </p>
          </Section>

          <Section title="8. Liability">
            <p>
              While we take every reasonable precaution to ensure the safety of all children
              during our classes, participation is at the parent/guardian&apos;s own risk.
              Confidance accepts no liability for any injury, loss, or damage to personal
              property arising from participation in our classes, except where caused by our
              negligence.
            </p>
            <p className="mt-3">
              We hold public liability insurance to cover claims arising from our negligence.
              Details are available on request.
            </p>
          </Section>

          <Section title="9. Intellectual property">
            <p>
              All content on this website &mdash; including text, images, branding, class names,
              and choreography &mdash; is the property of Confidance and may not be reproduced,
              distributed, or used without our written permission.
            </p>
          </Section>

          <Section title="10. Account and data">
            <p>
              You are responsible for maintaining the security of your account credentials.
              Please see our{' '}
              <a href="/privacy" className="text-coral hover:underline">
                Privacy Policy
              </a>{' '}
              for full details on how we collect, use, and protect your personal data.
            </p>
          </Section>

          <Section title="11. Changes to these terms">
            <p>
              We may update these terms from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of our services after changes have
              been posted constitutes acceptance of the revised terms.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For any questions about these terms, contact us at{' '}
              <a href="mailto:confidancejessica@gmail.com" className="text-coral hover:underline">
                confidancejessica@gmail.com
              </a>.
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
