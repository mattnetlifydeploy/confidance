import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export const metadata: Metadata = {
  title: 'About Jessica',
  description:
    'Meet Jessica Murphy, Musical Theatre performer and founder of Confidance. Trinity Laban graduate, DBS checked, building confidence in children aged 2 to 9 through performing arts.',
}

export default function AboutJessicaPage() {
  return (
    <>
      {/* ═══ HERO SPLIT ═══ */}
      <section className="relative overflow-hidden bg-white pt-36 pb-28">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div>
              <p className="reveal font-script text-3xl text-teal">Hi, I'm Jess</p>
              <h1 className="reveal mt-4 font-heading text-4xl font-bold leading-tight text-navy md:text-5xl lg:text-6xl">
                A Musical Theatre performer who builds children's confidence
              </h1>
              <p className="reveal mt-6 max-w-lg font-heading text-sm font-600 uppercase tracking-[0.25em] text-teal">
                Inspire. Empower. Shine.
              </p>
            </div>

            {/* Right: Image */}
            <div className="reveal-scale">
              <div className="img-glow overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                  src="/images/jessica-headshot.jpg"
                  alt="Jessica, founder of Confidance"
                  width={600}
                  height={750}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BIO ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="reveal font-body text-lg leading-relaxed text-charcoal-light">
            I'm a Musical Theatre performer and children's performing arts teacher. I teach ballet to children aged 2 to 6
            and musical theatre to children aged 6 to 9 across London. My goal is to create a positive, encouraging space where
            children build confidence, express themselves and discover the joy of performing arts.
          </p>
        </div>
      </section>

      {/* ═══ CREDENTIALS GRID ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">
              Professional credentials
            </p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              Fully qualified, <span className="text-gradient">DBS checked</span>, and insured
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Musical Theatre Performer', desc: 'Classically trained with 5+ years professional experience' },
              { title: 'First Class Honours Graduate', desc: 'Trinity Laban Conservatoire of Music and Dance' },
              { title: 'Enhanced DBS Checked', desc: 'Current DBS certificate on file, renewed annually' },
              { title: 'Fully Insured', desc: 'Public liability insurance covers all classes and activities' },
              { title: 'Safeguarding Trained', desc: 'Full safeguarding and child protection certification' },
              { title: 'Hundreds of Children Taught', desc: '3+ years of continuous children\'s performing arts teaching' },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`reveal stagger-${(i % 3) + 1} card-bezel`}
              >
                <div className="card-bezel-inner">
                  <h3 className="font-heading text-lg font-700 text-navy">{item.title}</h3>
                  <p className="mt-2 font-body text-sm text-charcoal-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEACHING PHILOSOPHY SPLIT ═══ */}
      <section className="section-padding relative overflow-hidden bg-pale-light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="reveal-left">
              <div className="img-glow overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/images/about-jess.jpg"
                  alt="Jessica teaching a performing arts class"
                  width={640}
                  height={760}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h2 className="reveal font-heading text-3xl font-bold text-navy md:text-4xl">
                My teaching philosophy
              </h2>
              <div className="reveal mt-6 space-y-4 font-body text-charcoal-light">
                <p>
                  Teaching performing arts is not just about steps and songs. It's about creating a safe, joyful space where
                  every child feels seen, heard and valued.
                </p>
                <p>
                  I believe children learn best when they're having fun, moving freely and feeling encouraged at every step.
                  Confidence grows when children know they belong, can be themselves and are celebrated for trying.
                </p>
                <p>
                  My classes balance structured learning with creative play. Each child progresses at their own pace, with
                  no competition or pressure. The goal is simple: children leave every session smiling, proud of what they've
                  done, and excited to come back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PULL QUOTE ON NAVY BAND ═══ */}
      <section className="relative bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <svg className="reveal mx-auto h-8 w-8 text-teal-light opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.044-5-6.5-5C.5 0 0 1.972 0 4.972 0 7.259.495 10.157 2.966 10.157c.196 0 .605-.088 1.08-.088.405 0 .763.041 1.235-.041-.495.1-.9.3-1.54.9-.635.615-.935 1.098-.935 1.22 0 .216.09.315.648.315.547 0 1.075-.057 1.242-.102.703-.23 1.851-.905 2.54-2.467.34-.795.744-2.323.744-4.108C10 4.505 8.397 2.29 6.747 2.29c-.535 0-1.006.104-1.385.374C5.56 2.887 5.51 4.374 5.51 5.868c0 3.95.137 8.905 3.reconsider 8.905 2.34 0 4.372-1.637 5.580-0z" />
          </svg>
          <p className="reveal mt-4 font-script text-4xl leading-tight text-teal-light">
            Every child deserves to feel confident, celebrated and proud of who they are.
          </p>
        </div>
      </section>

      {/* ═══ GALLERY / ACTION IMAGES ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="reveal text-center font-heading text-3xl font-bold text-navy md:text-4xl">
            In action with children
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: '/images/girl-ballet.jpg', alt: 'Child performing in ballet pose' },
              { src: '/images/ballet-class.jpg', alt: 'Children learning ballet together' },
              { src: '/images/happy-child.jpg', alt: 'Happy child after class' },
            ].map((image, i) => (
              <div
                key={image.src}
                className={`reveal stagger-${(i % 3) + 1} overflow-hidden rounded-2xl shadow-lg`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA PAIR ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="reveal font-heading text-3xl font-bold text-navy md:text-4xl">
            Ready to join Confidance?
          </h2>
          <p className="reveal mt-4 font-body text-charcoal-light">
            Browse our clubs or register your school for a free taster session.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/schools" className="btn-primary">
              Browse clubs
            </Link>
            <Link href="/for-schools" className="btn-secondary">
              Register your school
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
