import Link from 'next/link'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: 'Our Classes',
  description:
    'After School Musical Theatre Clubs. Performer-led singing, acting and dance for primary-school children. Supportive, age-appropriate and designed to create joy.',
}

export default function ClassesPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-cream pt-36 pb-28">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />
        <AnimatedBubbles tone="light" count={8} />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-teal-border bg-pale/50 px-5 py-2 font-heading text-sm font-600 text-navy backdrop-blur-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Musical theatre clubs
            </span>
            <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight text-navy md:text-5xl lg:text-6xl">
              Performer-led performing arts{' '}
              <span className="font-script font-600 text-teal">for young learners</span>
            </h1>
            <p className="reveal mx-auto mt-6 max-w-xl font-body text-lg text-charcoal-light">
              After School Musical Theatre Clubs. Classes are supportive, age-appropriate and designed to create joy!
            </p>
          </div>
        </div>
      </section>

      {/* ═══ WHAT A CLASS LOOKS LIKE ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Inside a session</p>
              <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
                What a class looks like
              </h2>
              <p className="reveal mt-4 max-w-xl font-body text-lg text-charcoal-light">
                Every club follows the same warm, predictable rhythm, so children always know what is coming next and feel safe to join in.
              </p>
              <ol className="mt-10 space-y-4">
                {[
                  { n: '1', title: 'Warm welcome', desc: 'A gentle group warm-up and hello game to settle in and shake off the school day.' },
                  { n: '2', title: 'Singing', desc: 'Vocal play, songs and breath work that grow expression and self-belief.' },
                  { n: '3', title: 'Acting', desc: 'Drama games and storytelling that build the confidence to speak up and be heard.' },
                  { n: '4', title: 'Dance', desc: 'Age-appropriate choreography and creative movement that builds coordination and stage presence.' },
                  { n: '5', title: 'Share and shine', desc: 'Finishing together and celebrating what each child has made that day.' },
                ].map((step, i) => (
                  <li
                    key={step.title}
                    className={`reveal stagger-${(i % 3) + 1} flex gap-5 rounded-2xl border border-teal-border bg-pale/40 p-5`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/15 font-heading text-base font-bold text-teal">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-700 text-navy">{step.title}</h3>
                      <p className="mt-1 font-body text-sm leading-relaxed text-charcoal-light">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Practical facts */}
            <aside className="reveal-scale lg:sticky lg:top-28">
              <div className="card-glow rounded-3xl border border-teal-border bg-gradient-to-br from-pale to-pale-light p-8">
                <h3 className="font-heading text-xl font-bold text-navy">The essentials</h3>
                <ul className="mt-6 space-y-4">
                  {[
                    'Runs in your child’s own school, straight after the bell',
                    'Small, supportive groups led by Jessica',
                    'Singing, acting and dance in every single session',
                    'Made for primary-school children',
                    'Supportive, age-appropriate and full of joy',
                  ].map((fact) => (
                    <li key={fact} className="flex items-start gap-3 font-body text-sm text-charcoal">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {fact}
                    </li>
                  ))}
                </ul>
                <Link href="/for-schools" className="btn-primary mt-8 w-full text-center text-sm">
                  Bring Confidance to your school
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="section-padding relative overflow-hidden bg-cream">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="reveal text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl text-navy">
            Why performing arts builds <span className="text-gradient">confidence</span>
          </h2>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Physical confidence',
                desc: 'Coordination, balance, and body awareness grow every class. Children learn to trust their bodies.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
              {
                title: 'Social confidence',
                desc: 'Working with others, performing together, and making new friends teaches children they belong.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              },
              {
                title: 'Creative expression',
                desc: 'Acting, singing and dance give children a way to express themselves freely. A powerful skill at any age.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
              },
              {
                title: 'Rhythm and musicality',
                desc: 'Connecting movement to music develops focus, timing, and an appreciation for the performing arts.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
              },
              {
                title: 'Resilience',
                desc: 'Learning step by step teaches children that practice pays off and mistakes are part of learning.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
              },
              {
                title: 'Pure joy',
                desc: 'The simplest benefit and the most important. Your child will have fun. Every single class.',
                iconBg: 'bg-teal/15',
                accent: 'text-teal',
                icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`reveal stagger-${(i % 3) + 1} card-glow group relative overflow-hidden rounded-3xl bg-white border border-border p-8`}
              >
                <div className={`relative ${item.iconBg} flex h-12 w-12 items-center justify-center rounded-xl ${item.accent} transition-all duration-500 group-hover:scale-110`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="relative mt-5 font-heading text-lg font-bold text-navy">{item.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-charcoal-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section-padding relative overflow-hidden bg-navy text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />
        <AnimatedBubbles tone="dark" count={8} />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="reveal font-heading text-3xl font-bold md:text-4xl">
            Ready to give it a <span className="text-teal-light">go?</span>
          </h2>
          <p className="reveal mt-6 text-lg leading-relaxed text-pale">
            Come and watch your child light up. Jessica will make sure they feel right at home from the very first session.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-primary group">
              Book a trial
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/timetable" className="btn-secondary">
              View Timetable
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
