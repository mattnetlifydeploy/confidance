import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { PlayfulMotionBg } from '@/components/playful-motion-bg'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: { absolute: 'Confidance | After-School Performing Arts Clubs in Schools' },
  description:
    'Building confidence through performing arts. Jessica, a Musical Theatre performer, leads singing, acting and dance clubs in partner schools. Register your school or browse clubs for your child.',
}

const DISCIPLINES = [
  {
    title: 'Singing',
    desc: 'Vocal play, songs and breath work that grow expression and self-belief week by week.',
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  },
  {
    title: 'Acting',
    desc: 'Drama games and storytelling that build clear, expressive communication and quiet courage.',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Dance',
    desc: 'Age-appropriate choreography and creative movement that builds coordination and stage presence.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
]

const TRUST_BADGES = [
  'Musical Theatre Performer',
  'First Class Honours',
  'Enhanced DBS',
  'Schools Partner',
]

const MARQUEE = [
  'Professional performer',
  'School partnerships',
  'Structured curriculum',
  'DBS verified',
  'Parents trust us',
  'Up to 15 per class',
  'KS1 and KS2 welcome',
  'Free taster session',
]

export default function Home() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-28 text-white">
        <div className="blob absolute -right-32 -top-24 h-[560px] w-[560px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-12rem] h-[520px] w-[520px] bg-teal-light/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-[1px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
        <PlayfulMotionBg variant="navy" />
        <AnimatedBubbles tone="dark" count={9} />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 font-heading text-sm font-600 text-pale backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-light" />
                Hi, I&apos;m Jessica
              </span>
              <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-[1.08] md:text-5xl lg:text-6xl">
                Building confidence through{' '}
                <span className="font-script font-600 text-teal-light">performing arts</span>
              </h1>
              <p className="reveal mt-6 max-w-xl font-body text-lg text-pale/90">
                I&apos;m a professional musical theatre performer, and I run after-school singing,
                acting and dance clubs inside primary schools. One joyful hour a week where every
                child gets their moment to shine, with zero admin for your team.
              </p>
              <div className="reveal mt-9 flex flex-wrap gap-4">
                <Link href="/for-schools/enquire" className="btn-primary">Enquire for your school</Link>
                <Link href="/parents/register-interest" className="btn-glass">I&apos;m a parent</Link>
              </div>
              <div className="reveal mt-10 flex flex-wrap gap-2.5">
                {TRUST_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 font-heading text-xs font-600 text-pale/90 backdrop-blur-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-light" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="reveal-scale relative">
              <div className="img-glow">
                <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-white/80 shadow-2xl">
                  <Image
                    src="/images/kids-performing-stage.jpg"
                    alt="A group of young children performing a dance routine together on an outdoor stage"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="reveal mt-6 text-center font-heading text-sm font-600 uppercase tracking-[0.28em] text-teal-light">
                Inspire &middot; Empower &middot; Shine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE TRUST BAR ═══ */}
      <section className="overflow-hidden border-b border-border bg-white py-6">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center">
              {MARQUEE.map((item) => (
                <span key={`${setIndex}-${item}`} className="mx-8 flex items-center gap-3 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  <span className="font-heading text-sm font-600 text-charcoal-light">{item}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THREE DISCIPLINES ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">What we teach</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              One club. Three ways to{' '}
              <span className="text-gradient">find your spark</span>
            </h2>
            <p className="reveal mt-4 font-body text-charcoal-light">
              Every Confidance session weaves singing, acting and dance into a single hour, building
              the whole child through performance.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {DISCIPLINES.map((d, i) => (
              <div key={d.title} className={`reveal stagger-${i + 1} card-glow rounded-2xl border border-teal-border bg-pale p-7`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={d.icon} />
                  </svg>
                </div>
                <h3 className="mt-5 font-heading text-xl font-700 text-navy">{d.title}</h3>
                <p className="mt-2 font-body text-sm text-charcoal-light">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* mint accent strip */}
      <div aria-hidden="true" className="h-2 w-full bg-gradient-to-r from-pale via-teal to-pale" />

      {/* ═══ TWO AUDIENCES ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Get involved</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              Two ways to bring Confidance to your children
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {/* Schools */}
            <div className="reveal stagger-1 card-bezel card-glow">
              <div className="card-bezel-inner flex h-full flex-col p-8">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-teal/10 px-4 py-1.5 font-heading text-xs font-700 uppercase tracking-wide text-teal">
                  For schools
                </span>
                <h3 className="mt-5 font-heading text-2xl font-700 text-navy">Host a professional programme</h3>
                <p className="mt-3 font-body text-sm text-charcoal-light">
                  A fully planned curriculum, performer-led, with all bookings and billing handled for
                  you. Every school gets a free taster session.
                </p>
                <ul className="mt-6 space-y-3">
                  {['Zero admin for your staff', 'Enhanced DBS and fully insured', 'Free taster for every school'].map((item) => (
                    <li key={item} className="flex items-center gap-3 font-body text-sm text-charcoal">
                      <svg className="h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/for-schools" className="btn-primary mt-8 w-full">Register your school</Link>
              </div>
            </div>

            {/* Parents */}
            <div className="reveal stagger-2 card-bezel card-glow">
              <div className="card-bezel-inner flex h-full flex-col p-8">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-navy/8 px-4 py-1.5 font-heading text-xs font-700 uppercase tracking-wide text-navy">
                  For parents
                </span>
                <h3 className="mt-5 font-heading text-2xl font-700 text-navy">Find a club at your child&apos;s school</h3>
                <p className="mt-3 font-body text-sm text-charcoal-light">
                  Book your child into a performing arts club at a participating school. Simple booking,
                  attendance tracking and a free trial session.
                </p>
                <ul className="mt-6 space-y-3">
                  {['Free trial session for every child', 'Up to 15 children per class', 'Sibling discount on term passes'].map((item) => (
                    <li key={item} className="flex items-center gap-3 font-body text-sm text-charcoal">
                      <svg className="h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/schools" className="btn-secondary mt-8 w-full">Browse clubs</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MEET JESSICA ═══ */}
      <section className="section-padding relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="reveal-left order-2 md:order-1">
              <div className="img-glow overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/images/jessica-headshot.jpg"
                  alt="Jessica, founder of Confidance"
                  width={640}
                  height={760}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="reveal font-script text-3xl text-teal">Hi, I&apos;m Jess</p>
              <h2 className="reveal mt-2 font-heading text-3xl font-bold text-navy md:text-4xl">
                A performer who loves to teach
              </h2>
              <p className="reveal mt-5 font-body text-charcoal-light">
                I&apos;m a Musical Theatre performer and children&apos;s performing arts teacher with a
                First Class Honours degree from Trinity Laban. I teach across London, building a
                positive, encouraging space where children grow in confidence, express themselves and
                discover the joy of performing.
              </p>
              <div className="reveal mt-6 flex flex-wrap gap-2.5">
                {['Trinity Laban graduate', 'Enhanced DBS', 'Fully insured', 'Safeguarding trained'].map((tag) => (
                  <span key={tag} className="rounded-full border border-teal-border bg-pale px-4 py-1.5 font-heading text-xs font-600 text-navy">{tag}</span>
                ))}
              </div>
              <Link href="/about-jessica" className="reveal animated-underline mt-7 inline-block font-heading text-sm font-600 text-teal">
                Read Jessica&apos;s full story &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* mint accent strip */}
      <div aria-hidden="true" className="h-2 w-full bg-gradient-to-r from-pale via-teal-light to-pale" />

      {/* ═══ FEATURED SCHOOLS / LOADING ═══ */}
      <section className="section-padding relative overflow-hidden bg-gradient-to-b from-pale-light to-cream">
        <div className="blob absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 bg-teal/10 blur-3xl" />
        <div className="blob absolute -right-24 bottom-[-6rem] h-72 w-72 bg-teal-light/10 blur-3xl" />
        <PlayfulMotionBg variant="light" />
        <AnimatedBubbles tone="light" count={7} />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Where we run</p>
          <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
            More schools coming soon
          </h2>
          <p className="reveal mx-auto mt-4 max-w-xl font-body text-charcoal-light">
            Jessica is partnering with local schools to bring performing arts clubs to your area.
            Schools are registering now. Be the first to bring Confidance to yours.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/for-schools" className="btn-primary">Register your school</Link>
            <Link href="/schools" className="btn-secondary">See participating schools</Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="section-padding relative overflow-hidden bg-navy text-white">
        <div className="blob absolute -right-32 -top-24 h-96 w-96 bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-32 bottom-0 h-80 w-80 bg-teal-light/10 blur-3xl" />
        <AnimatedBubbles tone="dark" count={8} />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.28em] text-teal-light">
            Inspire &middot; Empower &middot; Shine
          </p>
          <h2 className="reveal mt-4 font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to give children their{' '}
            <span className="font-script font-600 text-teal-light">moment to shine?</span>
          </h2>
          <p className="reveal mt-6 font-body text-lg text-pale/85">
            Whether you run a school or you&apos;re booking for your child, getting started takes minutes.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/for-schools" className="btn-primary">Register your school</Link>
            <Link href="/schools" className="btn-glass">Browse clubs</Link>
          </div>
        </div>
      </section>
    </>
  )
}
