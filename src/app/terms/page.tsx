import Link from 'next/link'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Confidance',
  description: 'Terms and conditions for booking Confidance children\'s dance classes. Includes cancellation policy and photo policy.',
}

export default function TermsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Terms & Conditions
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Terms &amp; <span className="text-gradient-animated">Conditions</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Everything you need to know about booking with Confidance.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 prose prose-sm max-w-none text-charcoal">
          <p className="text-sm text-warm-gray mb-8">Last updated: 29 June 2026</p>

          <h2 className="font-heading text-2xl font-bold">1. Booking & Payment</h2>
          <ul>
            <li>All bookings are made through our online portal and require immediate payment via Stripe</li>
            <li>Payment must be received before your booking is confirmed</li>
            <li>Bookings are non-transferable unless agreed in advance</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">2. Cancellation Policy</h2>
          <p className="font-heading font-600">Free Trial Classes</p>
          <ul>
            <li>Free trial bookings can be cancelled free of charge up to 24 hours before the class</li>
            <li>Less than 24 hours notice: the trial slot is forfeited</li>
          </ul>

          <p className="font-heading font-600 mt-4">Single Session &amp; Term Pass Bookings</p>
          <ul>
            <li><strong>24 hours or more before the session:</strong> Full refund will be issued</li>
            <li><strong>Less than 24 hours before the session:</strong> No refund available</li>
            <li>Refunds are processed within 5-7 working days</li>
          </ul>

          <p className="text-sm text-warm-gray mt-4">
            Please note: Cancellations must be made through your dashboard or by emailing {CONTACT_EMAIL}.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">3. Absence &amp; No-Shows</h2>
          <ul>
            <li>If you cannot attend a class, you must cancel through your dashboard or email {CONTACT_EMAIL}</li>
            <li>No-shows (classes missed without cancellation) are not refundable</li>
            <li>If you have a valid reason for a no-show (e.g. illness), please contact us to discuss</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">4. Class Changes &amp; Rescheduling</h2>
          <ul>
            <li>Classes are scheduled for a set term and term dates are published in advance</li>
            <li>Single session dates can be rescheduled if spaces are available in another class</li>
            <li>Reschedules made 24 hours or more before a session receive a full refund of the original. Reschedules within 24 hours are not refunded but you will receive account credit.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">5. Activity Waiver</h2>
          <p>
            All children must have a parent or guardian sign an Activity Waiver before their first class. This waiver covers the inherent risks of physical movement and dance activities. You must read and understand this waiver before signing.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">6. Photo &amp; Video Policy</h2>
          <p>
            Photos and videos may be taken during classes for promotional use on our website, social media, and marketing materials. This includes:
          </p>
          <ul>
            <li>Class photos showing children dancing and enjoying themselves</li>
            <li>Videos of performances or activities (if applicable)</li>
            <li>Testimonials or quotes from parents</li>
          </ul>

          <p className="font-heading font-600 mt-4">Opting Out</p>
          <p>
            If you do not want your child to appear in photos or videos, please email {CONTACT_EMAIL} and we will ensure your child is not photographed. Your child will still fully participate in all classes.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">7. Health &amp; Safety</h2>
          <ul>
            <li>Parents/guardians must stay with their child throughout the class (unless otherwise agreed)</li>
            <li>If your child is unwell, please do not bring them to class to protect other children</li>
            <li>You must inform us of any medical conditions, allergies, or additional needs before the first class</li>
            <li>We reserve the right to refuse a booking if we believe the venue or activity is unsuitable for a child</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">8. Behavior &amp; Code of Conduct</h2>
          <p>
            We expect all children and parents to be respectful and follow our code of conduct:
          </p>
          <ul>
            <li>Children and parents must treat the venue, equipment, and others with respect</li>
            <li>Bullying, aggression, or disruptive behavior will not be tolerated</li>
            <li>We reserve the right to cancel a booking if a child or parent violates this code</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">9. Liability</h2>
          <p>
            Confidance provides a safe, supervised environment. However:
          </p>
          <ul>
            <li>Parents/guardians are responsible for their child's supervision at the venue before and after class</li>
            <li>We are not responsible for lost, stolen, or damaged belongings</li>
            <li>By booking, you acknowledge the inherent risks of physical activity and assume responsibility for any injury (subject to the Activity Waiver)</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mt-8">10. Data Protection</h2>
          <p>
            Your personal and your child's data is handled in accordance with our Privacy Policy and UK GDPR. Please read our <Link href="/privacy" className="text-coral font-600 hover:text-coral-dark">Privacy Policy</Link> for full details.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">11. Changes to These Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Changes will be notified to you by email or posted on our website. Continued use of our services constitutes acceptance of updated terms.
          </p>

          <h2 className="font-heading text-2xl font-bold mt-8">12. Contact Us</h2>
          <p>
            If you have questions about these terms, please contact us at {CONTACT_EMAIL}.
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-warm-gray">
              Questions? / <Link href="/faqs" className="text-coral font-600 hover:text-coral-dark">See our FAQs</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
