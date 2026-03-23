'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await resetPassword(email)
    if (err) {
      setError(err)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-cream px-6 pt-20">
      <AnimatedBubbles count={8} />

      <div className="relative z-10 w-full max-w-md">
        <div className="reveal text-center">
          <h1 className="font-heading text-4xl font-bold">
            Reset your <span className="text-gradient">password</span>
          </h1>
          <p className="mt-3 text-charcoal-light">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="reveal mt-10">
            <div className="gradient-border">
              <div className="rounded-3xl bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 font-heading text-xl font-bold">Check your email</h2>
                <p className="mt-2 text-sm text-charcoal-light">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
                </p>
                <Link href="/login" className="btn-primary mt-6 inline-block">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reveal mt-10 space-y-5">
            <div className="gradient-border">
              <div className="rounded-3xl bg-white p-8 space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="reset-email" className="font-heading text-sm font-700">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input mt-2"
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                  />
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
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        <p className="reveal mt-6 text-center text-sm text-warm-gray">
          Remember your password?{' '}
          <Link href="/login" className="font-600 text-coral animated-underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
