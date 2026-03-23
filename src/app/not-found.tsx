import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-cream px-6 pt-20">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <span className="font-heading text-3xl font-bold text-coral">404</span>
        </div>
        <h1 className="mt-8 font-heading text-3xl font-bold md:text-4xl">
          Page not <span className="text-gradient">found</span>
        </h1>
        <p className="mt-4 text-charcoal-light">
          Sorry, we couldn&apos;t find what you were looking for. It might have
          been moved or doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/classes" className="btn-secondary">
            View Classes
          </Link>
        </div>
      </div>
    </section>
  )
}
