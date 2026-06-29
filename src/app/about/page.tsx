import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Jessica | Confidance',
  description: 'Meet Jessica, Musical Theatre performer leading after-school performing arts clubs in partner schools, building confidence in young children.',
}

export default function AboutPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-white pt-36 pb-28">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/15 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <span className="reveal inline-flex items-center gap-2 rounded-full border border-teal-border bg-pale/30 px-5 py-2 font-heading text-sm font-600 text-teal backdrop-blur-sm">
                About Jessica
              </span>
              <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight text-navy md:text-5xl lg:text-6xl">
                Musical Theatre performer <span className="font-script text-teal">leading performing arts clubs</span>
              </h1>
              <p className="reveal mt-6 max-w-xl font-body text-lg text-charcoal-light">
                Jessica is a Trinity Laban graduate building confidence in young children through performing arts. She leads after-school singing, acting and dance clubs in partner schools, creating spaces where every child feels seen and celebrated.
              </p>
            </div>

            <div className="reveal-scale">
              <div className="img-glow overflow-hidden rounded-3xl">
                <Image
                  src="/images/jessica-headshot.jpg"
                  alt="Jessica, founder of Confidance"
                  width={500}
                  height={625}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PHILOSOPHY CARDS ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">
              Teaching philosophy
            </p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              How Jessica builds <span className="text-gradient">confidence</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Safe space',
                desc: 'Every child is celebrated for trying. No competition, no pressure. Just joy and encouragement.',
              },
              {
                title: 'Performer-led',
                desc: 'Classically trained Musical Theatre performer with 5+ years professional experience guiding every session.',
              },
              {
                title: 'Inclusive',
                desc: 'Singing, acting, dance adapted for every age and ability. Every child gets attention and space to shine.',
              },
              {
                title: 'Creative',
                desc: 'Drama games, improvisation, choreography. Children discover their own unique voice and movement.',
              },
              {
                title: 'Supportive',
                desc: 'Enhanced DBS checked, fully insured, safeguarding trained. Your child is in expert hands.',
              },
              {
                title: 'Joyful',
                desc: 'The goal is simple: children leave every session smiling, proud and excited to come back.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`reveal stagger-${(i % 3) + 1} card-glow rounded-2xl border border-teal-border bg-white p-7`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-5 font-heading text-lg font-700 text-navy">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-charcoal-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA PAIR ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="reveal font-heading text-3xl font-bold text-navy md:text-4xl">
            Ready to join Confidance?
          </h2>
          <p className="reveal mt-4 font-body text-charcoal-light">
            Browse our clubs or register your school for a free taster session.
          </p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/for-schools" className="btn-primary">
              Register your school
            </Link>
            <Link href="/schools" className="btn-secondary">
              Browse clubs
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FULL BIO ═══ */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <p className="reveal font-script text-3xl text-teal mb-6">The full story</p>
          <div className="reveal space-y-4 font-body text-charcoal-light leading-relaxed">
            <p>
              Jessica is a Musical Theatre performer and children's performing arts teacher. She graduated with First Class Honours from Trinity Laban Conservatoire of Music and Dance, where she trained classically in dance, voice and drama.
            </p>
            <p>
              After working professionally in theatre and musical theatre productions, Jessica discovered her true passion: helping young children grow in confidence through performing arts. She has been teaching children aged 2 to 9 for over three years, leading after-school clubs that combine singing, acting and dance in a safe, joyful, non-competitive environment.
            </p>
            <p>
              Jessica is Enhanced DBS checked, fully insured and safeguarding trained. She works with schools across London to bring professional, performer-led performing arts clubs that build confidence, communication and creativity in every child.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ LINK TO FULL FOUNDER BIO ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="reveal font-body text-charcoal-light">
            Want to know more about Jessica's background and approach?
          </p>
          <div className="reveal mt-6">
            <Link href="/about-jessica" className="font-heading text-teal font-600 hover:text-teal-dark transition-colors">
              Read her full founder bio
              <svg className="ml-2 h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
