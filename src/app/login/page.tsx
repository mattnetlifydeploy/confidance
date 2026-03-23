'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-cream px-6 pt-20">
      <AnimatedBubbles count={8} />

      <div className="relative z-10 w-full max-w-md">
        <div className="reveal text-center">
          <h1 className="font-heading text-4xl font-bold">
            Welcome <span className="text-gradient">back</span>
          </h1>
          <p className="mt-3 text-charcoal-light">
            Sign in to manage your bookings and children
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reveal mt-10 space-y-5">
          <div className="gradient-border">
            <div className="rounded-3xl bg-white p-8 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="font-heading text-sm font-700">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input mt-2"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="font-heading text-sm font-700">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input mt-2"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-600 text-coral animated-underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="dancing-dot bg-white" />
                    <span className="dancing-dot bg-white" />
                    <span className="dancing-dot bg-white" />
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </div>
        </form>

        <p className="reveal mt-6 text-center text-sm text-warm-gray">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-600 text-coral animated-underline">
            Create one
          </Link>
        </p>
      </div>
    </section>
  )
}
