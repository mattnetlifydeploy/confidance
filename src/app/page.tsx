import Link from 'next/link'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'
import { HeroVideo } from '@/components/hero-video'
import { TERM_LABEL, TERM_START, CURRENT_TERM, CONTACT_EMAIL, VENUE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Confidance | Children\'s Dance & Confidence Classes for Ages 2-6',
  description: 'Fun, supportive dance and singing classes for children aged 2 to 6. Build confidence, creativity, and friendships through movement. Baby Boogie and Confidance classes available.',
}

export default function Home() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-cream">
        {/* Animated bubbles */}
        <AnimatedBubbles count={15} />

        {/* Decorative blobs */}
        <div className="blob absolute -right-40 -top-40 h-[600px] w-[600px] bg-coral/6 blur-3xl" />
        <div className="blob absolute -left-32 bottom-0 h-[500px] w-[500px] bg-lilac/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-80 w-80 rounded-full bg-gold/6 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <div className="reveal stagger-1 mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coral to-coral-dark px-6 py-3 font-heading text-sm font-700 text-white shadow-lg">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
              {TERM_LABEL} Launch: {TERM_START}
            </span>
          </div>

          <h1 className="reveal stagger-2 font-heading text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Little dancers.
            <br />
            <span className="text-gradient-animated">Big confidence.</span>
          </h1>

          <p className="reveal stagger-3 mx-auto mt-8 max-w-xl text-lg leading-relaxed text-charcoal-light">
            Fun, supportive dance classes for children aged 2 to 6. Build confidence, creativity, and friendships through movement.
          </p>

          <div className="reveal stagger-4 mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary group">
              Get Started
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/classes" className="btn-secondary">
              Explore Classes
            </Link>
          </div>

          {/* Trust badges */}
          <div className="reveal stagger-5 mt-10 flex flex-wrap items-center justify-center gap-3">
            {[
              'Musical Theatre trained',
              'First Class Honours',
              'DBS Checked',
              'Fully Insured',
            ].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-4 py-2 text-xs font-600 text-charcoal-light shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE TRUST BAR ═══ */}
      <section className="overflow-hidden bg-white py-6 border-b border-border">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center">
              {[
                'First Class Honours',
                'Musical Theatre trained',
                '3+ Years Teaching',
                'Public Liability Insured',
                'DBS Checked',
                'Non Competitive',
                'Ages 2 to 6',
                'Small Class Sizes',
              ].map((item) => (
                <span key={`${setIndex}-${item}`} className="mx-8 flex items-center gap-3 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                  <span className="font-heading text-sm font-600 text-charcoal-light">{item}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WHAT IS CONFIDANCE ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="reveal font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
              Building confidence through the <span className="text-gradient">joy of dance</span>
            </h2>
            <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
              Confidance is about so much more than dance steps. It&apos;s about helping
              your child discover what they&apos;re capable of.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Confidence',
                description: 'Children leave class feeling proud and braver than when they arrived. Every child is celebrated.',
                gradient: 'from-coral/10 to-coral/5',
                iconBg: 'bg-coral/15',
                accent: 'text-coral',
                icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
              },
              {
                title: 'Creativity',
                description: 'Imaginative play, creative movement, singing and self expression through music. Every class brings a new adventure, full of fun, creativity and magic.',
                gradient: 'from-lilac/10 to-lilac/5',
                iconBg: 'bg-lilac/15',
                accent: 'text-lilac-dark',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
              },
              {
                title: 'Connection',
                description: 'Social skills, teamwork, and new friendships in a warm, supportive environment.',
                gradient: 'from-gold/10 to-gold/5',
                iconBg: 'bg-gold/15',
                accent: 'text-gold',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              },
            ].map((card, i) => (
              <div
                key={card.title}
                className={`reveal stagger-${i + 1} card-glow group relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-8 border border-white/80`}
              >
                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 transition-transform duration-700 group-hover:scale-150" />

                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg} ${card.accent} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
                <h3 className="relative mt-6 font-heading text-xl font-bold">{card.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-charcoal-light">
                  {card.description}
                </p>

                {/* Bottom accent line */}
                <div className={`mt-6 h-1 w-12 rounded-full ${card.iconBg} transition-all duration-500 group-hover:w-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FLIP CARD CLASSES ═══ */}
      <section className="section-padding relative bg-cream">
        <AnimatedBubbles count={6} />

        {/* Decorative elements */}
        <div className="absolute left-[5%] top-[20%] text-coral/10 text-5xl">&#9733;</div>
        <div className="absolute right-[8%] bottom-[15%] text-lilac/10 text-4xl">&#9829;</div>
        <div className="absolute left-[15%] bottom-[10%] text-gold/10 text-3xl">&#9834;</div>

        <div className="relative mx-auto max-w-6xl">
          <h2 className="reveal text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Our <span className="text-gradient">Classes</span>
          </h2>
          <p className="reveal mx-auto mt-4 max-w-lg text-center text-charcoal-light">
            Two class types designed to meet your child where they are. Tap or hover to discover more.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Baby Boogie Flip Card */}
            <div className="reveal flip-card" tabIndex={0} role="button" aria-label="Baby Boogie class details - press Enter to flip">
              <div className="flip-card-inner">
                <div className="flip-card-front relative overflow-hidden rounded-3xl bg-gradient-to-br from-lilac via-lilac-dark to-[#8B7BB5]">
                  {/* Illustrated decorations instead of photo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/10">
                      <div className="text-[120px] leading-none">&#9835;</div>
                    </div>
                  </div>
                  <div className="absolute left-6 top-8 text-white/15 text-3xl">&#9733;</div>
                  <div className="absolute right-8 top-12 text-white/10 text-4xl">&#9829;</div>
                  <div className="absolute left-12 bottom-28 text-white/10 text-2xl">&#9834;</div>

                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 font-heading text-xs font-700 text-white">
                      Ages 2 to 4
                    </span>
                    <h3 className="mt-3 font-heading text-3xl font-bold text-white">Baby Boogie</h3>
                    <p className="mt-2 text-sm text-white/80">Tap to learn more</p>
                  </div>
                  {/* Corner accent */}
                  <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="flip-card-back flex flex-col justify-between bg-gradient-to-br from-lilac-dark to-lilac p-8 text-white">
                  <div>
                    <h3 className="font-heading text-2xl font-bold">Baby Boogie</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/90">
                      A playful introduction to dance, singing and movement for little ones finding their feet.
                    </p>
                    <ul className="mt-6 space-y-3">
                      {['Music, singing and rhythm games', 'Basic dance movement', 'Imaginative play', 'Coordination skills', '30 min classes'].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/book" className="mt-6 btn-glass w-full text-center">
                    Book Baby Boogie
                  </Link>
                </div>
              </div>
            </div>

            {/* Confidance Flip Card */}
            <div className="reveal stagger-2 flip-card" tabIndex={0} role="button" aria-label="Confidance Kids class details - press Enter to flip">
              <div className="flip-card-inner">
                <div className="flip-card-front relative overflow-hidden rounded-3xl bg-gradient-to-br from-coral via-coral-dark to-[#D4614E]">
                  {/* Illustrated decorations instead of photo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/10">
                      <div className="text-[120px] leading-none">&#9733;</div>
                    </div>
                  </div>
                  <div className="absolute left-8 top-10 text-white/15 text-3xl">&#9834;</div>
                  <div className="absolute right-6 top-8 text-white/10 text-4xl">&#9733;</div>
                  <div className="absolute left-10 bottom-28 text-white/10 text-2xl">&#9829;</div>

                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 font-heading text-xs font-700 text-white">
                      Ages 3 to 6
                    </span>
                    <h3 className="mt-3 font-heading text-3xl font-bold text-white">Confidance Kids</h3>
                    <p className="mt-2 text-sm text-white/80">Tap to learn more</p>
                  </div>
                  <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="flip-card-back flex flex-col justify-between bg-gradient-to-br from-coral-dark to-coral p-8 text-white">
                  <div>
                    <h3 className="font-heading text-2xl font-bold">Confidance Kids</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/90">
                      More structured but still playful. Real dance routines, singing, confidence games and creative expression.
                    </p>
                    <ul className="mt-6 space-y-3">
                      {['Dance routines and choreography', 'Singing and musical games', 'Creative movement', 'Confidence building', '30 min classes'].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/book" className="mt-6 btn-glass w-full text-center">
                    Book Confidance Kids
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VIDEO ═══ */}
      <section className="section-padding relative bg-white">
        <div className="reveal mx-auto max-w-3xl">
          <HeroVideo />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section-padding relative overflow-hidden bg-pastel-pink text-charcoal">
        <AnimatedBubbles count={8} />
        <div className="blob absolute -right-40 -top-40 h-96 w-96 bg-coral/10 blur-3xl" />
        <div className="blob absolute -left-40 bottom-0 h-80 w-80 bg-lilac/8 blur-3xl" />

        {/* Decorative stars */}
        <div className="absolute left-[10%] top-[20%] text-coral/10 text-4xl">&#9733;</div>
        <div className="absolute right-[12%] bottom-[20%] text-lilac/10 text-3xl">&#9829;</div>

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="reveal font-heading text-3xl font-bold md:text-5xl">
            <span className="text-gradient-animated">Sign Up</span>
          </h2>
          <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
            Create your free account, add your child, and book a free trial class.
          </p>
          <p className="reveal mt-3 font-heading text-base font-600 text-coral">
            {CURRENT_TERM.name} term starts {CURRENT_TERM.displayStart} in Hammersmith
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary group">
              Create Free Account
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/faqs" className="btn-secondary">
              Got Questions?
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
