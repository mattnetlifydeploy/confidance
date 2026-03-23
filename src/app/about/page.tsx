import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: 'About Jessica | Confidance',
  description: 'Meet Jessica, founder of Confidance and Trinity Laban graduate, passionate about helping young children grow in confidence through dance.',
}

export default function AboutPage() {
  return (
    <>
      {/* ═══ HERO — Meet Jessica ═══ */}
      <section className="relative overflow-hidden bg-cream pt-32 pb-24">
        <AnimatedBubbles count={8} />
        <div className="blob absolute -right-40 -top-20 h-[500px] w-[500px] bg-lilac/8 blur-3xl" />

        {/* Decorative elements */}
        <div className="absolute left-[8%] top-[20%] text-coral/10 text-4xl">&#9733;</div>
        <div className="absolute right-[10%] bottom-[15%] text-lilac/10 text-3xl">&#9829;</div>
        <div className="absolute left-[15%] bottom-[20%] text-gold/10 text-2xl">&#9834;</div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <span className="reveal inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 font-heading text-sm font-600 text-lilac-dark shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Meet the Teacher
              </span>
              <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Hello, I&apos;m <span className="text-gradient-animated">Jessica</span>
              </h1>
              <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
                I&apos;m the founder of Confidance and a graduate of Trinity Laban
                Conservatoire, where I achieved a First Class Honours degree in
                Musical Theatre.
              </p>
              <p className="reveal mt-4 text-lg leading-relaxed text-charcoal-light">
                I&apos;ve been teaching young children for over three years and
                discovered along the way that helping children grow in confidence
                through dance is something I am truly passionate about.
              </p>
            </div>

            <div className="reveal-right relative">
              <div className="gradient-border">
                <div className="overflow-hidden rounded-[22px]">
                  <Image
                    src="/images/jessica-headshot.jpg"
                    alt="Jessica, founder and teacher at Confidance"
                    width={500}
                    height={625}
                    className="aspect-[4/5] w-full object-cover"
                    priority
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══ Jessica's Story ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="reveal text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Why I created <span className="text-gradient">Confidance</span>
          </h2>

          <div className="reveal mt-10 space-y-6 text-lg leading-relaxed text-charcoal-light">
            <p>
              One of the most rewarding parts of teaching is watching children
              blossom week by week. Whether that&apos;s finding the courage to try
              something new, making friends, or proudly showing their dance moves.
            </p>
            <p>
              I created Confidance to give children a joyful and supportive space
              where they can express themselves, build confidence and have lots of fun.
            </p>
            <p>
              Inspired by Ballet, Jazz and Musical Theatre, my classes help children
              develop coordination, rhythm and performance skills while feeling
              encouraged and proud of themselves.
            </p>
            <p className="font-heading text-xl font-700 text-charcoal">
              My aim is for every child to leave class smiling, full of confidence,
              and ready to sparkle.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Teaching Philosophy ═══ */}
      <section className="section-padding relative bg-cream">
        <AnimatedBubbles count={5} />

        {/* Decorative elements */}
        <div className="absolute right-[5%] top-[10%] text-coral/8 text-5xl">&#9733;</div>
        <div className="absolute left-[8%] bottom-[10%] text-lilac/8 text-4xl">&#9835;</div>

        <div className="mx-auto max-w-6xl">
          <h2 className="reveal text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            My teaching <span className="text-gradient">philosophy</span>
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Encouragement first',
                desc: 'Every child learns at their own pace. I meet them where they are and celebrate every step forward.',
                gradient: 'from-coral/10 to-coral/5',
                iconBg: 'bg-coral/15',
                accent: 'text-coral',
                icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
              },
              {
                title: 'Positive reinforcement',
                desc: 'Children thrive when they feel seen. Praise is specific, genuine, and helps them believe in themselves.',
                gradient: 'from-lilac/10 to-lilac/5',
                iconBg: 'bg-lilac/15',
                accent: 'text-lilac-dark',
                icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              },
              {
                title: 'Everyone belongs',
                desc: 'No child is left out. My classes are inclusive, non competitive, and designed so every child can participate.',
                gradient: 'from-gold/10 to-gold/5',
                iconBg: 'bg-gold/15',
                accent: 'text-gold',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              },
              {
                title: 'Fun above all',
                desc: 'Learning happens best when children are laughing, moving, and playing. If they are having fun, everything else follows.',
                gradient: 'from-coral/10 to-coral/5',
                iconBg: 'bg-coral/15',
                accent: 'text-coral',
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`reveal stagger-${i + 1} card-glow group relative overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient} p-8 border border-white/80`}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 transition-transform duration-700 group-hover:scale-[2]" />
                <div className={`relative ${item.iconBg} flex h-12 w-12 items-center justify-center rounded-xl ${item.accent} transition-all duration-500 group-hover:scale-110`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="relative mt-5 font-heading text-lg font-bold">{item.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-charcoal-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Promise + CTA ═══ */}
      <section className="section-padding relative overflow-hidden bg-pastel-peach text-charcoal">
        <AnimatedBubbles count={6} />
        <div className="blob absolute -right-40 -top-40 h-96 w-96 bg-coral/15 blur-3xl" />
        <div className="blob absolute -left-40 bottom-0 h-80 w-80 bg-lilac/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="reveal font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to <span className="text-coral">sparkle</span>?
          </h2>
          <p className="reveal mt-6 text-lg leading-relaxed text-charcoal-light">
            Your child will leave every class feeling more confident than when they
            walked in. They will make friends, discover new skills, and have the
            time of their lives.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary group">
              Join Confidance
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/classes" className="btn-secondary">
              See Our Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
