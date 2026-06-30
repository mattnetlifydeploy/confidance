'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { School } from '@/lib/schools-schema'
import type { DbClass } from '@/lib/classes'
import type { DbBlueprint } from '@/lib/blueprints'
import {
  AdminCard,
  AdminPageHeader,
  AdminBanner,
  AdminSpinner,
  Button,
  Modal,
  FormField,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  useToast,
} from '@/components/admin'

const EMPTY_CLASS_FORM = {
  slug: '',
  name: '',
  ages: '',
  ageMax: '',
  day: '',
  time: '',
  durationMins: '30',
  sortOrder: '0',
  active: 'active' as 'active' | 'inactive',
}

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()

  const [venue, setVenue] = useState<School | null>(null)
  const [classes, setClasses] = useState<DbClass[]>([])
  const [blueprints, setBlueprints] = useState<DbBlueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false)
  const [selectedBlueprintId, setSelectedBlueprintId] = useState('')
  const [blueprintSubmitting, setBlueprintSubmitting] = useState(false)

  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [classFormData, setClassFormData] = useState(EMPTY_CLASS_FORM)
  const [classSubmitting, setClassSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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

      const [schoolsRes, classesRes, blueprintsRes] = await Promise.all([
        fetch('/api/admin/schools', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/classes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/class-blueprints', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!schoolsRes.ok) {
        throw new Error('Failed to load venues')
      }

      const { schools } = await schoolsRes.json()
      const foundVenue = schools.find((s: School) => s.id === params.id)
      if (!foundVenue) {
        setError('Venue not found')
        setVenue(null)
        setClasses([])
        setBlueprints([])
        return
      }

      setVenue(foundVenue)

      if (classesRes.ok) {
        const { classes: allClasses } = await classesRes.json()
        const venueClasses = (allClasses || []).filter(
          (c: DbClass) => c.venue_school_id === params.id
        )
        setClasses(venueClasses)
      }

      if (blueprintsRes.ok) {
        const { blueprints: allBlueprints } = await blueprintsRes.json()
        const activeBlueprints = (allBlueprints || []).filter(
          (bp: DbBlueprint) => bp.active
        )
        setBlueprints(activeBlueprints)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFromBlueprint = async () => {
    if (!selectedBlueprintId) {
      toast.error('Please select a blueprint')
      return
    }

    setBlueprintSubmitting(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromBlueprintId: selectedBlueprintId,
          venueSchoolId: params.id,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create class')
      }

      toast.success('Class added from blueprint')
      setBlueprintModalOpen(false)
      setSelectedBlueprintId('')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBlueprintSubmitting(false)
    }
  }

  const openCustomClassForm = () => {
    setEditingClassId(null)
    setClassFormData(EMPTY_CLASS_FORM)
    setClassModalOpen(true)
  }

  const openEditClassForm = (cls: DbClass) => {
    setEditingClassId(cls.id)
    setClassFormData({
      slug: cls.slug,
      name: cls.name,
      ages: cls.ages,
      ageMax: cls.age_max.toString(),
      day: cls.day,
      time: cls.time,
      durationMins: cls.duration_mins.toString(),
      sortOrder: cls.sort_order.toString(),
      active: cls.active ? 'active' : 'inactive',
    })
    setClassModalOpen(true)
  }

  const closeClassModal = () => {
    setClassModalOpen(false)
    setEditingClassId(null)
    setClassFormData(EMPTY_CLASS_FORM)
  }

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !classFormData.name.trim() ||
      !classFormData.slug.trim() ||
      !classFormData.ages.trim() ||
      !classFormData.time.trim()
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    const ageMax = parseInt(classFormData.ageMax, 10)
    if (isNaN(ageMax) || ageMax < 0) {
      toast.error('Maximum age must be a non-negative number')
      return
    }

    setClassSubmitting(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token

      if (editingClassId) {
        const res = await fetch(`/api/admin/classes/${editingClassId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: classFormData.name,
            ages: classFormData.ages,
            age_max: ageMax,
            day: classFormData.day,
            time: classFormData.time,
            duration_mins: parseInt(classFormData.durationMins, 10),
            sort_order: parseInt(classFormData.sortOrder, 10),
            active: classFormData.active === 'active',
          }),
        })

        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || 'Failed to update class')
        }

        toast.success('Class updated')
      } else {
        const res = await fetch('/api/admin/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug: classFormData.slug,
            name: classFormData.name,
            ages: classFormData.ages,
            ageMax: ageMax,
            day: classFormData.day,
            time: classFormData.time,
            durationMins: parseInt(classFormData.durationMins, 10),
            venueSchoolId: params.id,
            sortOrder: parseInt(classFormData.sortOrder, 10),
            active: classFormData.active === 'active',
          }),
        })

        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || 'Failed to create class')
        }

        toast.success('Class created')
      }

      closeClassModal()
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setClassSubmitting(false)
    }
  }

  const toggleClassActive = async (cls: DbClass) => {
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const token = session.access_token
      const res = await fetch(`/api/admin/classes/${cls.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !cls.active }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update class')
      }

      toast.success(`Class ${!cls.active ? 'activated' : 'deactivated'}`)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (error && !venue) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Venue"
          title="Venue"
          actions={
            <Button variant="ghost" onClick={() => router.push('/admin/schools')}>
              Back to venues
            </Button>
          }
        />
        <AdminBanner tone="error">{error}</AdminBanner>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Venue"
          title="Venue"
          actions={
            <Button variant="ghost" onClick={() => router.push('/admin/schools')}>
              Back to venues
            </Button>
          }
        />
        <div className="flex justify-center py-10">
          <AdminSpinner />
        </div>
      </div>
    )
  }

  const venueAddress = venue?.area || venue?.address || undefined

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Venue"
        title={venue?.name ?? 'Venue'}
        description={venueAddress}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setBlueprintModalOpen(true)}
            >
              Add from blueprint
            </Button>
            <Button variant="primary" onClick={openCustomClassForm}>
              Add custom class
            </Button>
            <Button variant="ghost" onClick={() => router.push('/admin/schools')}>
              Back to venues
            </Button>
          </div>
        }
      />

      <AdminCard>
        {classes.length === 0 ? (
          <EmptyState
            title="No classes at this venue yet"
            description="Add one from a blueprint or create a custom class."
            action={<Button onClick={openCustomClassForm}>Add from blueprint</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Class</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Ages</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Day</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-charcoal">Mins</th>
                  <th className="px-4 py-3 text-center font-medium text-charcoal">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="border-b border-charcoal/5 hover:bg-pale/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal">{cls.name}</div>
                      <div className="font-mono text-xs text-charcoal/50">{cls.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">{cls.ages}</td>
                    <td className="px-4 py-3 text-charcoal/70">{cls.day}</td>
                    <td className="px-4 py-3 text-charcoal/70">{cls.time}</td>
                    <td className="px-4 py-3 text-charcoal/70">{cls.duration_mins}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleClassActive(cls)}
                        title={cls.active ? 'Deactivate' : 'Activate'}
                        className="align-middle"
                      >
                        <StatusBadge
                          label={cls.active ? 'Active' : 'Hidden'}
                          tone={cls.active ? 'success' : 'neutral'}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditClassForm(cls)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Modal
        open={blueprintModalOpen}
        onClose={() => setBlueprintModalOpen(false)}
        title="Add class from blueprint"
      >
        <div className="space-y-4">
          <FormField label="Blueprint *">
            <Select
              required
              value={selectedBlueprintId}
              onChange={(e) => setSelectedBlueprintId(e.target.value)}
            >
              <option value="">Select a blueprint</option>
              {blueprints.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name} ({bp.default_day ?? 'no day'}{' '}
                  {bp.default_time ?? ''})
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button
              loading={blueprintSubmitting}
              onClick={handleAddFromBlueprint}
            >
              Add class
            </Button>
            <Button
              variant="secondary"
              onClick={() => setBlueprintModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={classModalOpen}
        onClose={closeClassModal}
        title={editingClassId ? 'Edit class' : 'Add custom class'}
      >
        <form onSubmit={handleClassSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Slug *">
              <Input
                type="text"
                required
                disabled={!!editingClassId}
                value={classFormData.slug}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, slug: e.target.value })
                }
                placeholder="class-slug"
                title="Permanent key, cannot be changed"
              />
              {editingClassId && (
                <p className="mt-1 text-xs text-charcoal/50">
                  Permanent key, cannot be changed
                </p>
              )}
            </FormField>
            <FormField label="Name *">
              <Input
                type="text"
                required
                value={classFormData.name}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, name: e.target.value })
                }
                placeholder="Class name"
              />
            </FormField>
            <FormField label="Ages *">
              <Input
                type="text"
                required
                value={classFormData.ages}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, ages: e.target.value })
                }
                placeholder="3-5"
              />
            </FormField>
            <FormField label="Max age *">
              <Input
                type="number"
                required
                value={classFormData.ageMax}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, ageMax: e.target.value })
                }
                placeholder="5"
              />
            </FormField>
            <FormField label="Day">
              <Input
                type="text"
                value={classFormData.day}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, day: e.target.value })
                }
                placeholder="Monday"
              />
            </FormField>
            <FormField label="Time *">
              <Input
                type="text"
                required
                value={classFormData.time}
                onChange={(e) =>
                  setClassFormData({ ...classFormData, time: e.target.value })
                }
                placeholder="10:00"
              />
            </FormField>
            <FormField label="Duration (mins)">
              <Input
                type="number"
                value={classFormData.durationMins}
                onChange={(e) =>
                  setClassFormData({
                    ...classFormData,
                    durationMins: e.target.value,
                  })
                }
                placeholder="30"
              />
            </FormField>
            <FormField label="Sort order">
              <Input
                type="number"
                value={classFormData.sortOrder}
                onChange={(e) =>
                  setClassFormData({
                    ...classFormData,
                    sortOrder: e.target.value,
                  })
                }
                placeholder="0"
              />
            </FormField>
            <FormField label="Status">
              <Select
                value={classFormData.active}
                onChange={(e) =>
                  setClassFormData({
                    ...classFormData,
                    active: e.target.value as 'active' | 'inactive',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Hidden</option>
              </Select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={classSubmitting}>
              {editingClassId ? 'Save changes' : 'Create class'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeClassModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
