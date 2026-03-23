'use client'

import { useState } from 'react'

interface Faq {
  question: string
  answer: string
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={`card-glow overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen ? 'border-coral/20 bg-white shadow-md' : 'border-border bg-cream hover:border-coral/10'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-6 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
            >
              <span className="pr-4 font-heading text-base font-700">{faq.question}</span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isOpen
                    ? 'rotate-45 bg-coral text-white shadow-md'
                    : 'bg-coral/10 text-coral'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              </span>
            </button>
            <div
              id={`faq-answer-${i}`}
              role="region"
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96 pb-6' : 'max-h-0'
              }`}
            >
              <div className="mx-6 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-charcoal-light">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
