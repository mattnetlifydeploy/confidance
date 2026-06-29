import Link from 'next/link'
import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq-accordion'

export const metadata: Metadata = {
  title: 'FAQs for Schools',
  description: 'Frequently asked questions about bringing Confidance performing arts clubs to your school.',
}

const schoolFaqs = [
  {
    question: 'Do parents pay the school?',
    answer: 'No. Confidance deals with all bookings and payments directly with families. There is no billing or admin for your staff.',
  },
  {
    question: 'What room do you need?',
    answer: 'Anything with space and a good floor for physical activity. A school hall, dance studio or drama room is ideal.',
  },
  {
    question: 'How many children per class?',
    answer: 'Up to 15 children per class, so every child gets attention and space to take part.',
  },
  {
    question: 'What equipment is required?',
    answer: 'None. Confidance brings everything needed for each session.',
  },
  {
    question: 'Can we offer a free taster?',
    answer: 'Yes. Every school gets a free taster session so children and staff can experience a club first-hand.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: schoolFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-28 text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal-light">
              For schools
            </p>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Frequently asked <span className="font-script text-teal-light">questions</span>
            </h1>
            <p className="reveal mx-auto mt-6 max-w-xl font-body text-lg text-pale/90">
              Everything you need to know about bringing Confidance to your school. Can&apos;t find your answer? Get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ACCORDION ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="reveal mb-10 text-center font-heading text-2xl font-bold text-navy md:text-3xl">
            FAQs for Schools
          </h2>
          <FaqAccordion faqs={schoolFaqs} />
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">
            Still have questions?
          </p>
          <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
            Get in touch
          </h2>
          <p className="reveal mx-auto mt-4 max-w-2xl font-body text-charcoal-light">
            We&apos;re here to help. Email us or register your school for a free taster session.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <a href="mailto:hello@confidance.co.uk" className="btn-primary">
              Email us
            </a>
            <Link href="/for-schools" className="btn-secondary">
              Register your school
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
