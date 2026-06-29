import Link from 'next/link'
import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq-accordion'
import { FaqTabs } from '@/components/faq-tabs'

export const metadata: Metadata = {
  title: 'FAQs | Confidance',
  description: 'Frequently asked questions about Confidance performing arts clubs for parents and schools.',
}

const parentFaqs = [
  {
    question: 'Do parents stay for class?',
    answer: 'For both Baby Boogie and Confidance Kids, parents or carers must stay in the room throughout class. This creates a supportive environment where children can settle at their own pace, grow in confidence and fully enjoy the experience. In Baby Boogie, parents are also encouraged to join in, especially at the start of class.',
  },
  {
    question: 'What should my child wear?',
    answer: 'Anything they can move freely in, whether it is a ballerina tutu, favourite dress up costume or comfy joggers. We want every child to feel ready to dance, use their imagination and celebrate their own unique sparkle.',
  },
  {
    question: 'Can we try class before committing?',
    answer: 'Yes. Every child gets one free trial class so they can experience a session before you commit. If you then book a full term, you are all set. No pressure, no obligation.',
  },
  {
    question: 'Where do classes take place?',
    answer: 'Classes are held at Grove Neighbourhood Centre, 7 Bradmore Park Road, Hammersmith, W6 0DT. It is a welcoming community space with easy access.',
  },
  {
    question: 'How do classes run?',
    answer: 'Our classes are inspired by Ballet, Jazz and Musical Theatre. Each session includes warm up, drama games, creative movement, singing and a cool down. Children build skills week by week in a fun, supportive environment.',
  },
]

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
  mainEntity: [
    ...parentFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    ...schoolFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  ],
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
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">
              Got questions?
            </p>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Frequently asked <span className="font-script text-teal-light">questions</span>
            </h1>
            <p className="reveal mt-6 max-w-xl mx-auto font-body text-lg text-pale/90">
              Everything you need to know before joining. Can't find your answer? Get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ACCORDION WITH TABS ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-3xl px-6">
          <FaqTabs
            parentFaqsNode={<FaqAccordion faqs={parentFaqs} />}
            schoolFaqsNode={<FaqAccordion faqs={schoolFaqs} />}
          />
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
          <p className="reveal mt-4 max-w-2xl mx-auto font-body text-charcoal-light">
            We're here to help. Email us or register your school for a free taster session.
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
