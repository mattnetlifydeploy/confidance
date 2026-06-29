import Link from 'next/link'
import type { Metadata } from 'next'
import { ParentInterestForm } from '@/components/parent-interest-form'
import { PlayfulMotionBg } from '@/components/playful-motion-bg'

export const metadata: Metadata = {
  title: 'Register your interest',
  description:
    'Love the idea of Confidance for your child? Register your interest and we will let you know as soon as an after-school musical theatre club opens near you.',
}

const STEPS = [
  { step: '1', title: 'Tell us about your child', desc: 'Share your details and the school you would love a club at. It takes a minute.' },
  { step: '2', title: 'We partner with schools', desc: 'Confidance opens new after-school clubs as we partner with more local schools.' },
  { step: '3', title: 'We let you know', desc: 'As soon as there is a club near you, Jessica gets in touch so you can book a place.' },
]

export default function ParentRegisterInterestPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-24 text-white">
        <div className="blob absolute -right-32 -top-24 h-[480px] w-[480px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[440px] w-[440px] bg-teal-light/10 blur-3xl" />
        <PlayfulMotionBg variant="navy" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 font-heading text-sm font-600 text-pale backdrop-blur-sm">
            For Parents &middot; Register interest
          </span>
          <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl">
            Be first to know when we&apos;re at your <span className="font-script font-600 text-teal-light">child&apos;s school</span>
          </h1>
          <p className="reveal mx-auto mt-6 max-w-xl font-body text-lg text-pale/90">
            We run after-school musical theatre clubs that help children grow in confidence, creativity and
            self-expression. Register and we will let you know as soon as a club opens near you.
          </p>
          <p className="reveal mt-8 font-heading text-sm font-600 uppercase tracking-[0.25em] text-teal-light">
            Inspire &middot; Empower &middot; Shine
          </p>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className={`reveal stagger-${i + 1} card-glow rounded-2xl border border-teal-border bg-white p-7`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal font-heading text-sm font-700 text-white">{s.step}</span>
                <h2 className="mt-5 font-heading text-lg font-700 text-navy">{s.title}</h2>
                <p className="mt-2 font-body text-sm text-charcoal-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FORM ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Register interest</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">Tell us about your child</h2>
            <p className="reveal mt-4 font-body text-charcoal-light">
              No commitment. We will only use your details to let you know about clubs near you.
            </p>
          </div>
          <div className="reveal mt-12">
            <ParentInterestForm />
          </div>
          <p className="reveal mt-8 text-center font-body text-sm text-charcoal-light">
            Are you a school?{' '}
            <Link href="/for-schools/enquire" className="animated-underline font-600 text-teal">
              Enquire about hosting a club
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
