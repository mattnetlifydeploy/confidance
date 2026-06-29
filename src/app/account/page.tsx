'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getSupabase } from '@/lib/supabase'
import { AnimatedBubbles } from '@/components/animated-bubbles'

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  const [emailValue, setEmailValue] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)

  const [passwordValue, setPasswordValue] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [phoneValue, setPhoneValue] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [phoneSuccess, setPhoneSuccess] = useState('')
  const [phoneSaving, setPhoneSaving] = useState(false)

  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState('')
  const [exportSuccess, setExportSuccess] = useState('')

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (user && profile) {
      setEmailValue(user.email || '')
      setPhoneValue(profile.phone || '')
    }
  }, [user, profile])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-20">
        <div className="flex gap-2">
          <span className="dancing-dot bg-coral" />
          <span className="dancing-dot bg-lilac" />
          <span className="dancing-dot bg-gold" />
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')

    if (!emailValue || emailValue.length < 5) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailSaving(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.updateUser({ email: emailValue })

      if (error) {
        setEmailError(error.message)
      } else {
        setEmailSuccess('Check your inbox to confirm the new email address')
        setEmailValue('')
      }
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordValue || passwordValue.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (passwordValue !== passwordConfirm) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSaving(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.updateUser({ password: passwordValue })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess('Password updated successfully')
        setPasswordValue('')
        setPasswordConfirm('')
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneError('')
    setPhoneSuccess('')

    if (!phoneValue || phoneValue.length < 5) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    setPhoneSaving(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setPhoneError('Not authenticated')
        setPhoneSaving(false)
        return
      }

      const res = await fetch('/api/account/phone', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone: phoneValue }),
      })

      if (!res.ok) {
        const data = await res.json()
        setPhoneError(data.error || 'Failed to update phone')
      } else {
        setPhoneSuccess('Phone number updated successfully')
      }
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Failed to update phone')
    } finally {
      setPhoneSaving(false)
    }
  }

  const handleExportData = async () => {
    setExportError('')
    setExportSuccess('')
    setExportLoading(true)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setExportError('Not authenticated')
        return
      }

      const res = await fetch('/api/account/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        setExportError(data.error || 'Failed to export data')
        return
      }

      const data = await res.json()

      // Trigger download
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `confidance-my-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportSuccess('Your data has been exported and downloaded. You should also receive an email with your data.')
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setDeleteLoading(true)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setDeleteError('Not authenticated')
        return
      }

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: deleteConfirmEmail }),
      })

      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete account')
        return
      }

      // Sign out and redirect
      setDeleteConfirmOpen(false)
      await signOut()
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-cream px-6 pt-32 pb-20">
      <AnimatedBubbles count={6} />

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <div className="reveal flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">Account Settings</h1>
          <Link href="/dashboard" className="text-coral transition-colors hover:text-coral-dark">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>

        {/* Email Form */}
        <div className="reveal mt-10 rounded-3xl bg-white p-8 shadow-sm card-glow">
          <h2 className="font-heading text-xl font-bold">Change Email</h2>
          <p className="mt-1 text-sm text-warm-gray">Update your email address. You'll need to confirm the new address.</p>

          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
            {emailError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                {emailSuccess}
              </div>
            )}

            <div>
              <label className="font-heading text-sm font-700">New Email</label>
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="auth-input mt-2"
                placeholder="your.new.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={emailSaving}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {emailSaving ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="reveal mt-8 rounded-3xl bg-white p-8 shadow-sm card-glow">
          <h2 className="font-heading text-xl font-bold">Change Password</h2>
          <p className="mt-1 text-sm text-warm-gray">Create a new password for your account.</p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            {passwordError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label className="font-heading text-sm font-700">New Password</label>
              <input
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="auth-input mt-2"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="font-heading text-sm font-700">Confirm Password</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="auth-input mt-2"
                placeholder="Confirm your new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Phone Form */}
        <div className="reveal mt-8 rounded-3xl bg-white p-8 shadow-sm card-glow">
          <h2 className="font-heading text-xl font-bold">Change Phone Number</h2>
          <p className="mt-1 text-sm text-warm-gray">Update the phone number on file for your account.</p>

          <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
            {phoneError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {phoneError}
              </div>
            )}
            {phoneSuccess && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                {phoneSuccess}
              </div>
            )}

            <div>
              <label className="font-heading text-sm font-700">Phone Number</label>
              <input
                type="tel"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                className="auth-input mt-2"
                placeholder="+44 7123 456789"
                required
              />
            </div>

            <button
              type="submit"
              disabled={phoneSaving}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {phoneSaving ? 'Updating...' : 'Update Phone Number'}
            </button>
          </form>
        </div>
      </div>

      {/* Export Data Section */}
      <div className="reveal mt-8 rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Export my data</h2>
        <p className="mt-1 text-sm text-warm-gray">Download a copy of all your Confidance data including your profile, children, bookings, and attendance records.</p>

        <div className="mt-6">
          {exportError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
              {exportError}
            </div>
          )}
          {exportSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600 mb-4">
              {exportSuccess}
            </div>
          )}

          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="btn-primary w-full text-sm disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export my data'}
          </button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="reveal mt-8 rounded-3xl bg-white p-8 shadow-sm card-glow border border-red-200">
        <h2 className="font-heading text-xl font-bold text-red-600">Delete my account</h2>
        <p className="mt-1 text-sm text-warm-gray">Permanently delete your account and all associated data. This action cannot be undone.</p>

        <div className="mt-6">
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={deleteLoading}
          >
            Delete my account
          </button>
        </div>

        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-lg">
              <h3 className="font-heading text-lg font-bold mb-4">Confirm account deletion</h3>

              <p className="text-sm text-warm-gray mb-4">
                This will permanently delete your account, cancel any active bookings, and anonymise all your data. This cannot be undone.
              </p>

              {deleteError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
                  {deleteError}
                </div>
              )}

              <p className="text-sm font-semibold mb-3">Type your email to confirm:</p>
              <input
                type="email"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={user?.email || 'your.email@example.com'}
                className="auth-input w-full mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false)
                    setDeleteConfirmEmail('')
                    setDeleteError('')
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmEmail !== (user?.email || '')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
