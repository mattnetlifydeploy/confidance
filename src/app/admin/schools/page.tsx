'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { School, EnquiryStatus } from '@/lib/schools-schema'

export default function SchoolsPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    postcode: '',
    area: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    schoolType: 'primary',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const token = session.access_token
      const res = await fetch('/api/admin/schools', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load schools')
      }

      const { schools: data } = await res.json()
      setSchools(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSchools([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const payload = {
        name: formData.name,
        address: formData.address || null,
        postcode: formData.postcode || null,
        area: formData.area || null,
        contactName: formData.contactName || null,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        schoolType: formData.schoolType || null,
      }

      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create school')
      }

      setSuccess('School created successfully')
      setFormData({
        name: '',
        address: '',
        postcode: '',
        area: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        schoolType: 'primary',
      })
      setShowForm(false)
      await loadSchools()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (school: School) => {
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const res = await fetch(`/api/admin/schools/${school.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !school.active }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update school')
      }

      setSuccess(`School ${!school.active ? 'activated' : 'deactivated'}`)
      await loadSchools()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-bezel rounded-3xl bg-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-navy">Schools</h2>
            <p className="mt-2 text-sm text-charcoal/60">Manage all school venues and contacts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary rounded-xl px-6 py-2 text-sm"
          >
            {showForm ? 'Cancel' : 'Add School'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-charcoal/10 pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-charcoal">School name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Primary School Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">School type</label>
                <select
                  value={formData.schoolType}
                  onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="AB12 3CD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="District/region"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Contact name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="contact@school.co.uk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal">Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="01632 960000"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.name.trim()}
                className="btn-primary rounded-lg px-6 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create school'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary rounded-lg px-6 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="mt-6 flex justify-center py-8 text-sm text-charcoal/60">Loading schools...</div>
        ) : schools.length === 0 ? (
          <div className="mt-6 flex justify-center py-8 text-sm text-charcoal/60">No schools yet. Add one to get started.</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-4 py-3 font-medium text-charcoal">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-charcoal">Area</th>
                  <th className="text-left px-4 py-3 font-medium text-charcoal">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-charcoal">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-charcoal">Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b border-charcoal/5 hover:bg-pale/20">
                    <td className="px-4 py-3 text-charcoal font-medium">{school.name}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.area || '—'}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.contact_name || '—'}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.contact_email || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(school)}
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          school.active
                            ? 'bg-success/20 text-success'
                            : 'bg-charcoal/10 text-charcoal/60 hover:bg-charcoal/20'
                        }`}
                      >
                        {school.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
