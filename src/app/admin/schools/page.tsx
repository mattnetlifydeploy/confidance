'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { School } from '@/lib/schools-schema'
import {
  AdminCard,
  AdminPageHeader,
  Button,
  Modal,
  FormField,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  AdminSpinner,
  useToast,
} from '@/components/admin'

const EMPTY_FORM = {
  name: '',
  address: '',
  postcode: '',
  area: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  schoolType: 'primary',
}

export default function SchoolsPage() {
  const router = useRouter()
  const toast = useToast()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
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

  const openCreate = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (school: School) => {
    setEditingId(school.id)
    setFormData({
      name: school.name,
      address: school.address || '',
      postcode: school.postcode || '',
      area: school.area || '',
      contactName: school.contact_name || '',
      contactEmail: school.contact_email || '',
      contactPhone: school.contact_phone || '',
      schoolType: school.school_type || 'primary',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

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

      const url = editingId ? `/api/admin/schools/${editingId}` : '/api/admin/schools'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save school')
      }

      toast.success(editingId ? 'School updated' : 'School created')
      closeForm()
      await loadSchools()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (school: School) => {
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

      toast.success(`School ${!school.active ? 'activated' : 'deactivated'}`)
      await loadSchools()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Venues"
        description="Manage your venues and the classes that run at each one."
        actions={<Button onClick={openCreate}>Add venue</Button>}
      />

      <AdminCard>
        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <AdminSpinner />
          </div>
        ) : schools.length === 0 ? (
          <EmptyState
            title="No venues yet"
            description="Add a venue to start managing classes and contacts."
            action={<Button onClick={openCreate}>Add venue</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Area</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Email</th>
                  <th className="px-4 py-3 text-center font-medium text-charcoal">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b border-charcoal/5 hover:bg-pale/20">
                    <td className="px-4 py-3 font-medium text-charcoal">{school.name}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.area || '.'}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.contact_name || '.'}</td>
                    <td className="px-4 py-3 text-charcoal/70">{school.contact_email || '.'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(school)}
                        title={school.active ? 'Deactivate' : 'Activate'}
                        className="align-middle"
                      >
                        <StatusBadge
                          label={school.active ? 'Active' : 'Inactive'}
                          tone={school.active ? 'success' : 'neutral'}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/schools/${school.id}`)}
                        >
                          Manage
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(school)}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Modal open={formOpen} onClose={closeForm} title={editingId ? 'Edit school' : 'Add school'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="School name *">
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Primary School Name"
              />
            </FormField>
            <FormField label="School type">
              <Select
                value={formData.schoolType}
                onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Address">
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </FormField>
            <FormField label="Postcode">
              <Input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="AB12 3CD"
              />
            </FormField>
            <FormField label="Area">
              <Input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="District/region"
              />
            </FormField>
            <FormField label="Contact name">
              <Input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Jane Doe"
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@school.co.uk"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="01632 960000"
              />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting} disabled={!formData.name.trim()}>
              {editingId ? 'Save changes' : 'Create school'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
