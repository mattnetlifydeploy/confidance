import Link from 'next/link'
import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq-accordion'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: 'FAQs | Confidance',
  description: 'Frequently asked questions about Confidance children\'s dance and confidence classes.',
}

const faqs = [
  {
    question: 'Do parents stay for the class?',
    answer: 'For both Baby Boogie and Confidance Kids, parents or carers must stay in the room throughout the class. This creates a supportive environment where children can settle in at their own pace, grow in confidence and fully enjoy the experience. In Baby Boogie, parents are also encouraged to join in, especially at the start of class.',
  },
  {
    question: 'What should my child wear?',
    answer: 'Anything they can move freely in, whether that is a ballerina tutu, a favourite dress up costume or comfy joggers. We want every child to feel ready to dance, use their imagination and celebrate their own unique sparkle.',
  },
  {
    question: 'Can we try a class before committing?',
    answer: 'Yes. Every child gets one free trial class so they can experience a session before you commit. If you then book the full term, you are all set. No pressure, no obligation.',
  },
  {
    question: 'Where do classes take place?',
    answer: 'Classes are held at the Grove Neighbourhood Centre, 7 Bradmore Park Road, Hammersmith, W6 0DT. It is a welcoming community space with easy access.',
  },
  {
    question: 'How do the classes run?',
    answer: 'Our classes are inspired by Ballet, Jazz and Musical Theatre. Each session includes warm up games, creative movement, singing and a cool down. Children build skills week by week in a fun, supportive environment.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Got questions?
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Frequently asked{' '}
              <span className="text-gradient-animated">questions</span>
            </h1>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Everything you need to know before booking.
              Can&apos;t find your answer? Get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ACCORDION ═══ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="section-padding relative overflow-hidden bg-cream">
        <AnimatedBubbles count={6} />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="reveal glass mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl">
            <svg className="h-8 w-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="reveal mt-6 font-heading text-2xl font-bold md:text-3xl">
            Still have questions?
          </h2>
          <p className="reveal mt-4 text-charcoal-light">
            Drop us an email and Jessica will get back to you personally.
          </p>
          <div className="reveal mt-8 flex flex-wrap justify-center gap-4">
            <a href="mailto:confidancejessica@gmail.com" className="btn-primary group">
              Email Us
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <Link href="/register" className="btn-secondary">
              Book a Class
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
