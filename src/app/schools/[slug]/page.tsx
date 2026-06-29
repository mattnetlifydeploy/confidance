import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSchoolBySlug } from '@/lib/schools'
import { CLASSES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const school = await getSchoolBySlug(slug)
  if (!school) {
    return { title: 'School not found', description: 'This school could not be found.' }
  }
  return {
    title: `${school.name} - Confidance Clubs`,
    description: `Browse performing arts clubs available at ${school.name}. Professional, performer-led after-school activities by Confidance.`,
  }
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const school = await getSchoolBySlug(slug)

  if (!school) {
    notFound()
  }

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-32 pb-20 text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <h1 className="reveal font-heading text-4xl font-bold leading-tight md:text-5xl">{school.name}</h1>
              <p className="reveal mt-3 font-body text-lg text-pale/90">
                {school.area ? `${school.area}, ` : ''}{school.address || 'Hammersmith'}
              </p>
              <p className="reveal mt-4 font-body text-pale/80">
                Bringing performer-led performing arts clubs to {school.name} this term.
              </p>
            </div>

            <div className="reveal-right overflow-hidden rounded-3xl">
              <Image
                src="/images/happy-child.jpg"
                alt={`Children at ${school.name}`}
                width={640}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CLUBS AVAILABLE ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal">
              Available now
            </p>
            <h2 className="reveal mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              Clubs at {school.name}
            </h2>
            <p className="reveal mx-auto mt-4 max-w-2xl font-body text-charcoal-light">
              Choose the club that fits your child&apos;s age and schedule.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Object.entries(CLASSES).map(([key, classInfo], i) => (
              <div
                key={key}
                className={`reveal stagger-${(i % 4) + 1} card-bezel rounded-2xl border border-border bg-white p-8`}
              >
                <div className="card-bezel-inner rounded-xl bg-pale-light p-6">
                  <h3 className="font-heading text-2xl font-700 text-navy">{classInfo.name}</h3>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-teal shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0zM8.707 7.707a1 1 0 001.414 0L10 7.414l.879.879a1 1 0 001.414-1.414L11.414 6 12.293 5.121a1 1 0 00-1.414-1.414L10 4.586l-.879-.879a1 1 0 00-1.414 1.414L8.586 6 7.707 6.879a1 1 0 000 1.414z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-heading text-sm font-600 text-charcoal">Ages</p>
                        <p className="font-body text-sm text-charcoal-light">{classInfo.ages}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-teal shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <div>
                        <p className="font-heading text-sm font-600 text-charcoal">Day and time</p>
                        <p className="font-body text-sm text-charcoal-light">{classInfo.day}, {classInfo.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-teal shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-heading text-sm font-600 text-charcoal">Duration</p>
                        <p className="font-body text-sm text-charcoal-light">{classInfo.durationMins} minutes per session</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <Link href="/book" className="btn-primary">
                    Book now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-teal-border bg-pale-light p-8 text-center">
            <p className="reveal font-body text-charcoal-light">
              New clubs are added each term. Check back to see what else is coming to {school.name}.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ BACK LINK ═══ */}
      <section className="section-padding relative bg-cream border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <Link href="/schools" className="animated-underline inline-flex items-center gap-2 font-heading text-sm font-700 text-teal hover:text-teal-dark transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all schools
          </Link>
        </div>
      </section>
    </>
  )
}
