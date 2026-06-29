import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getActiveSchools } from '@/lib/schools'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Schools',
  description: 'Find Confidance performing arts clubs at your child\'s school. Professional, performer-led after-school activities delivered by Jessica.',
}

export default async function SchoolsPage() {
  const schools = await getActiveSchools()

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-navy pt-36 pb-28 text-white">
        <div className="blob absolute -right-32 -top-24 h-[520px] w-[520px] bg-teal/20 blur-3xl" />
        <div className="blob absolute -left-40 bottom-[-10rem] h-[480px] w-[480px] bg-teal-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="reveal font-heading text-sm font-600 uppercase tracking-[0.2em] text-teal-light">
              Find a club
            </p>
            <h1 className="reveal mt-4 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Find a club at your <span className="font-script font-600 text-teal-light">child&apos;s school</span>
            </h1>
            <p className="reveal mx-auto mt-6 max-w-2xl font-body text-lg text-pale/90">
              Performer-led after-school performing arts clubs at partner schools. Same professional, confident-building experience. New schools added each term.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SCHOOLS GRID OR EMPTY STATE ═══ */}
      <section className="section-padding relative bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          {schools.length === 0 ? (
            <div className="card-bezel rounded-3xl border border-border bg-white p-12 text-center">
              <div className="card-bezel-inner rounded-2xl bg-pale-light p-8">
                <div className="flex justify-center">
                  <svg
                    className="h-20 w-20 text-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 3h18M3.75 6h16.5v2.25m0 0v11.25A2.25 2.25 0 0121 20.25H3A2.25 2.25 0 013 17.75V8.25"
                    />
                  </svg>
                </div>
                <h2 className="reveal mt-6 font-heading text-3xl font-bold text-navy md:text-4xl">
                  More schools coming soon
                </h2>
                <p className="reveal mx-auto mt-4 max-w-xl font-body text-charcoal-light">
                  Jessica is partnering with local schools to bring performing arts clubs to your area. Schools are
                  currently registering. Check back soon.
                </p>
                <div className="reveal mt-8">
                  <Link href="/for-schools" className="btn-primary">
                    Register your school
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {schools.map((school, i) => (
                <div
                  key={school.id}
                  className={`reveal stagger-${(i % 6) + 1} card-bezel rounded-2xl border border-border bg-white overflow-hidden transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="card-bezel-inner rounded-xl overflow-hidden bg-pale-light">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src="/images/kids-dance-studio.jpg"
                        alt={school.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-heading text-xl font-700 text-navy line-clamp-2">{school.name}</h3>
                    <p className="mt-1 font-body text-sm text-charcoal-light line-clamp-1">
                      {school.area || school.address || 'Hammersmith'}
                    </p>

                    <p className="mt-3 font-body text-xs text-teal font-600">
                      New clubs available this term
                    </p>

                    <div className="mt-5 pt-5 border-t border-border">
                      <Link
                        href={`/schools/${school.slug}`}
                        className="animated-underline font-heading text-sm font-700 text-teal hover:text-teal-dark transition-colors"
                      >
                        View clubs
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
