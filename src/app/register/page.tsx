'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, form.fullName, form.phone)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-cream px-6 py-32">
      <AnimatedBubbles count={10} />

      <div className="relative z-10 w-full max-w-md">
        <div className="reveal text-center">
          <h1 className="font-heading text-4xl font-bold">
            Create your <span className="text-gradient">account</span>
          </h1>
          <p className="mt-3 text-charcoal-light">
            Join Confidance to book classes and manage your children
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
                <label htmlFor="reg-name" className="font-heading text-sm font-700">Full name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="auth-input mt-2"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="font-heading text-sm font-700">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="auth-input mt-2"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="font-heading text-sm font-700">Phone number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="auth-input mt-2"
                  placeholder="07xxx xxxxxx"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="font-heading text-sm font-700">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="auth-input mt-2"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-confirm" className="font-heading text-sm font-700">Confirm password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className="auth-input mt-2"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
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
                  'Create Account'
                )}
              </button>
            </div>
          </div>
        </form>

        <p className="reveal mt-6 text-center text-sm text-warm-gray">
          Already have an account?{' '}
          <Link href="/login" className="font-600 text-coral animated-underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
