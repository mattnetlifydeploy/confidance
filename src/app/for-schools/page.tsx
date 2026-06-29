import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SchoolEnquiryForm } from '@/components/school-enquiry-form'

export const metadata: Metadata = {
  title: 'For Schools',
  description:
    'Partner with Confidance to bring professional, performer-led performing arts clubs to your school. Fully planned curriculum, DBS verified, zero admin. Free taster session for every school.',
}

const BENEFITS = [
  { title: 'Confidence', desc: 'Children find their voice and learn to perform in front of others.', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { title: 'Communication', desc: 'Drama games and singing build clear, expressive speaking skills.', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
  { title: 'Creativity', desc: 'Imaginative play and storytelling spark original thinking.', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z' },
  { title: 'Teamwork', desc: 'Group routines teach children to listen, share and support.', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
  { title: 'Resilience', desc: 'Trying, rehearsing and performing builds quiet determination.', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Wellbeing', desc: 'A joyful, inclusive space where every child feels they belong.', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
]

const SESSION_FLOW = [
  { step: 'Welcome', desc: 'A warm, settling start so every child feels ready.' },
  { step: 'Warm Up', desc: 'Music and movement to wake up bodies and minds.' },
  { step: 'Drama Games', desc: 'Playful exercises that build confidence and listening.' },
  { step: 'Singing', desc: 'Vocal play and songs that grow expression and breath.' },
  { step: 'Dance', desc: 'Age-appropriate choreography and creative movement.' },
  { step: 'Performance', desc: 'A chance to share and shine in a safe group.' },
  { step: 'Reflection', desc: 'Calm close, celebrating what each child achieved.' },
]

const WHY_PARTNER = [
  { title: 'Fully planned curriculum', desc: 'A structured, age-appropriate programme. No extra planning or resources needed from your staff.' },
  { title: 'Professional performer', desc: 'Classically trained Musical Theatre performer. Enhanced DBS, fully insured, safeguarding trained.' },
  { title: 'We handle everything', desc: 'Confidance deals with all bookings, billing, reminders and parent communication. Stress-free for schools.' },
  { title: 'Supports PSHE', desc: 'Promotes communication, creativity, teamwork, self-expression and confidence across personal development.' },
  { title: 'Flexible to your school', desc: 'We work around your year groups, timings and space. KS1 and KS2 welcome.' },
]

const SCHOOL_FAQS = [
  { q: 'Do parents pay the school?', a: 'No. Confidance deals with all bookings and payments directly with families. There is no billing or admin for your staff.' },
  { q: 'What room do you need?', a: 'Anything with space and a good floor for physical activity. A school hall, dance studio or drama room is ideal.' },
  { q: 'How many children per class?', a: 'Up to 15 children per class, so every child gets attention and space to take part.' },
  { q: 'What equipment is required?', a: 'None. Confidance brings everything needed for each session.' },
  { q: 'Can we offer a free taster?', a: 'Yes. Every school gets a free taster session so children and staff can experience a club first-hand.' },
]

export default function ForSchoolsPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-28 text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 font-heading text-sm font-600 text-pale backdrop-blur-sm">
                For Schools &middot; Partnership
              </span>
              <h1 className="reveal mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Professional performing arts clubs for your <span className="font-script font-600 text-teal-light">school</span>
              </h1>
              <p className="reveal mt-6 max-w-xl font-body text-lg text-pale/90">
                Partner with Jessica to bring confidence-building singing, acting and dance to your students. Fully
                planned, performer-led and completely hands-off for your team.
              </p>
              <div className="reveal mt-9 flex flex-wrap gap-4">
                <Link href="#enquiry" className="btn-primary">Register your school</Link>
                <Link href="/about-jessica" className="btn-glass">Meet Jessica</Link>
              </div>
              <p className="reveal mt-8 font-heading text-sm font-600 uppercase tracking-[0.25em] text-teal-light">
                Inspire &middot; Empower &middot; Shine
              </p>
            </div>
            <div className="reveal-scale relative">
              <div className="img-glow overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image src="/images/kids-singing.jpg" alt="A group of happy young children singing together in a bright classroom" width={720} height={820} className="h-full w-full object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCHOOLS DON'T LIFT A FINGER ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Zero admin for staff</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              We handle every booking and admin task directly
            </h2>
            <p className="reveal mx-auto mt-4 max-w-xl font-body text-lg text-charcoal-light">
              Schools don’t lift a finger. No registers, no payment chasing, no parent comms.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'No registers', desc: 'We manage sign-ups, attendance and waiting lists for every club.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { title: 'No payment chasing', desc: 'Families book and pay Confidance directly. Nothing touches your finance office.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              { title: 'No parent comms', desc: 'All confirmations, reminders and questions come through us, not your staff.', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            ].map((item, i) => (
              <div key={item.title} className={`reveal stagger-${i + 1} card-glow rounded-3xl border border-teal-border bg-white p-7 text-center`}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal/15 text-teal">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="mt-5 font-heading text-lg font-700 text-navy">{item.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-charcoal-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY PERFORMING ARTS ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Why it matters</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              More than dancing. It builds the <span className="text-gradient">whole child</span>
            </h2>
            <p className="reveal mt-4 font-body text-charcoal-light">
              Every Confidance session is designed around six skills that support children across the curriculum and beyond.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className={`reveal stagger-${(i % 3) + 1} card-glow rounded-2xl border border-border bg-cream p-7`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                </div>
                <h3 className="mt-5 font-heading text-xl font-700 text-navy">{b.title}</h3>
                <p className="mt-2 font-body text-sm text-charcoal-light">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT JESSICA EXCERPT ═══ */}
      <section className="section-padding relative overflow-hidden bg-pale-light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="reveal-left order-2 md:order-1">
              <div className="img-glow overflow-hidden rounded-3xl shadow-xl">
                <Image src="/images/jessica-headshot.jpg" alt="Jessica, founder of Confidance" width={640} height={760} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="reveal font-script text-3xl text-teal">Hi, I&apos;m Jess</p>
              <h2 className="reveal mt-2 font-heading text-3xl font-bold text-navy md:text-4xl">A performer who loves to teach</h2>
              <p className="reveal mt-5 font-body text-charcoal-light">
                I&apos;m a Musical Theatre performer and children&apos;s performing arts teacher. I teach ballet to
                children aged 2 to 6 and musical theatre to children aged 6 to 9 across London. My goal is to create a
                positive, encouraging space where children build confidence, express themselves and discover the joy of
                performing arts.
              </p>
              <Link href="/about-jessica" className="reveal animated-underline mt-6 inline-block font-heading text-sm font-600 text-teal">
                Read Jessica&apos;s full story &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OUR CLUBS ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">After-school clubs</p>
          <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">What we bring to your school</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Suitable for KS1 and KS2',
              'One-hour weekly sessions after school',
              'Led by a Musical Theatre performer',
              'Inclusive and welcoming to all',
              'Optional end-of-term performances',
              'Up to 15 children per class',
            ].map((item, i) => (
              <div key={item} className={`reveal stagger-${(i % 3) + 1} flex items-center gap-3 rounded-xl border border-border bg-cream px-5 py-4 text-left`}>
                <svg className="h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="font-body text-sm font-500 text-charcoal">{item}</span>
              </div>
            ))}
          </div>
          <p className="reveal mt-10 font-script text-2xl text-teal">Plus a free taster session for every school</p>
        </div>
      </section>

      {/* ═══ SESSION TIMELINE ═══ */}
      <section className="section-padding relative bg-navy text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal-light">The structure</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold md:text-4xl">What a session looks like</h2>
            <p className="reveal mt-4 font-body text-pale/80">Schools love seeing the structure. Every club follows the same trusted rhythm.</p>
          </div>
          <ol className="mt-14 space-y-4">
            {SESSION_FLOW.map((s, i) => (
              <li key={s.step} className={`reveal stagger-${(i % 5) + 1} flex items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal font-heading text-sm font-700 text-white">{i + 1}</span>
                <div>
                  <h3 className="font-heading text-lg font-700">{s.step}</h3>
                  <p className="mt-1 font-body text-sm text-pale/80">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ WHY PARTNER ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="reveal font-heading text-3xl font-bold text-navy md:text-4xl">Why partner with <span className="text-gradient">Confidance</span></h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {WHY_PARTNER.map((c, i) => (
              <div key={c.title} className={`reveal stagger-${(i % 3) + 1} card-bezel`}>
                <div className="card-bezel-inner h-full">
                  <h3 className="font-heading text-xl font-700 text-navy">{c.title}</h3>
                  <p className="mt-3 font-body text-sm text-charcoal-light">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SAFEGUARDING ═══ */}
      <section className="section-padding relative bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Peace of mind</p>
          <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">Safeguarding &amp; professional standards</h2>
          <p className="reveal mt-4 font-body text-charcoal-light">
            Confidance is run to professional standards so your school can welcome us with complete confidence.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['Enhanced DBS', 'Public Liability Insurance', 'Safeguarding Training', 'Risk Assessments', 'Clear Policies', 'Emergency Procedures'].map((tag) => (
              <span key={tag} className="reveal rounded-full border border-teal-border bg-pale px-5 py-2 font-heading text-sm font-600 text-navy">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCHOOL FAQs ═══ */}
      <section className="section-padding relative bg-pale-light">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="reveal text-center font-heading text-3xl font-bold text-navy md:text-4xl">School questions, answered</h2>
          <div className="mt-12 space-y-4">
            {SCHOOL_FAQS.map((f, i) => (
              <div key={f.q} className={`reveal stagger-${(i % 5) + 1} rounded-2xl border border-border bg-white p-6`}>
                <h3 className="font-heading text-lg font-700 text-navy">{f.q}</h3>
                <p className="mt-2 font-body text-sm text-charcoal-light">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ENQUIRY FORM ═══ */}
      <section id="enquiry" className="section-padding relative scroll-mt-24 bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">Get started</p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">Register your school</h2>
            <p className="reveal mt-4 font-body text-charcoal-light">
              Tell us a little about your school and Jessica will be in touch within two working days to arrange a free taster.
            </p>
          </div>
          <div className="reveal mt-12">
            <SchoolEnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}
