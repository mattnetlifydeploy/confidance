'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { DbClass } from '@/lib/classes'
import type { School } from '@/lib/schools-schema'
import type { DbBlueprint } from '@/lib/blueprints'
import {
  AdminPageHeader,
  AdminCard,
  AdminBanner,
  AdminSpinner,
  Button,
  DataTable,
  type Column,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Select,
  StatusBadge,
  useToast,
} from '@/components/admin'

type FormState = {
  slug: string
  name: string
  ages: string
  ageMax: string
  day: string
  time: string
  durationMins: string
  venueSchoolId: string
  sortOrder: string
  active: boolean
}

const EMPTY_FORM: FormState = {
  slug: '',
  name: '',
  ages: '',
  ageMax: '',
  day: 'Thursday',
  time: '',
  durationMins: '30',
  venueSchoolId: '',
  sortOrder: '0',
  active: true,
}

function toForm(c: DbClass): FormState {
  return {
    slug: c.slug,
    name: c.name,
    ages: c.ages,
    ageMax: String(c.age_max),
    day: c.day,
    time: c.time,
    durationMins: String(c.duration_mins),
    venueSchoolId: c.venue_school_id ?? '',
    sortOrder: String(c.sort_order),
    active: c.active,
  }
}

export default function ClassesPage() {
  const toast = useToast()
  const [classes, setClasses] = useState<DbClass[]>([])
  const [venues, setVenues] = useState<School[]>([])
  const [blueprints, setBlueprints] = useState<DbBlueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteRow, setDeleteRow] = useState<DbClass | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false)
  const [blueprintForm, setBlueprintForm] = useState({ venueId: '', blueprintId: '' })
  const [blueprintSaving, setBlueprintSaving] = useState(false)

  const authHeaders = useCallback(async () => {
    const { data: session } = await getSupabase().auth.getSession()
    const token = session?.session?.access_token
    if (!token) throw new Error('Not authenticated')
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const headers = await authHeaders()
      const [classesRes, venuesRes, blueprintsRes] = await Promise.all([
        fetch('/api/admin/classes', { headers }),
        fetch('/api/admin/schools', { headers }),
        fetch('/api/admin/class-blueprints', { headers }),
      ])
      if (!classesRes.ok) {
        const data = await classesRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load classes')
      }
      if (!venuesRes.ok) {
        const data = await venuesRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load venues')
      }
      if (!blueprintsRes.ok) {
        const data = await blueprintsRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load blueprints')
      }
      const classesData = await classesRes.json()
      const venuesData = await venuesRes.json()
      const blueprintsData = await blueprintsRes.json()
      setClasses((classesData.classes ?? []) as DbClass[])
      setVenues((venuesData.schools ?? []) as School[])
      setBlueprints((blueprintsData.blueprints ?? []) as DbBlueprint[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    load()
  }, [load])

  const venueName = (id: string | null): string => {
    if (!id) return 'No venue'
    return venues.find((v) => v.id === id)?.name ?? 'Unknown'
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId('new')
  }

  const openEdit = (c: DbClass) => {
    setForm(toForm(c))
    setEditId(c.id)
  }

  const closeModal = () => {
    setEditId(null)
    setSaving(false)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    if (!editId) return
    const isNew = editId === 'new'

    if (!form.name.trim() || !form.slug.trim() || !form.ages.trim() || !form.time.trim()) {
      toast.error('Name, slug, ages and time are required')
      return
    }
    const ageMax = Number(form.ageMax)
    if (!Number.isInteger(ageMax) || ageMax < 0) {
      toast.error('Max age must be a whole number')
      return
    }

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      ages: form.ages.trim(),
      ageMax,
      day: form.day.trim(),
      time: form.time.trim(),
      durationMins: Number(form.durationMins) || 30,
      venueSchoolId: form.venueSchoolId || null,
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
    }
    if (isNew) body.slug = form.slug.trim()

    try {
      setSaving(true)
      const headers = await authHeaders()
      const res = await fetch(
        isNew ? '/api/admin/classes' : `/api/admin/classes/${editId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers,
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save class')
      }
      toast.success(isNew ? 'Class created' : 'Class updated')
      closeModal()
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save class')
      setSaving(false)
    }
  }

  const saveBlueprintClass = async () => {
    if (!blueprintForm.venueId || !blueprintForm.blueprintId) {
      toast.error('Venue and blueprint are required')
      return
    }
    try {
      setBlueprintSaving(true)
      const headers = await authHeaders()
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fromBlueprintId: blueprintForm.blueprintId,
          venueSchoolId: blueprintForm.venueId,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create class from blueprint')
      }
      toast.success('Class created from blueprint')
      setBlueprintModalOpen(false)
      setBlueprintForm({ venueId: '', blueprintId: '' })
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create class from blueprint')
    } finally {
      setBlueprintSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteRow) return
    try {
      setDeleting(true)
      const headers = await authHeaders()
      const res = await fetch(`/api/admin/classes/${deleteRow.id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete class')
      }
      toast.success('Class deleted')
      setDeleteRow(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete class')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Array<Column<DbClass>> = [
    {
      key: 'name',
      header: 'Class',
      render: (c) => (
        <div>
          <div className="font-heading font-semibold text-charcoal">{c.name}</div>
          <div className="font-mono text-xs text-charcoal-light">{c.slug}</div>
        </div>
      ),
    },
    { key: 'ages', header: 'Ages', render: (c) => c.ages },
    { key: 'day', header: 'Day', render: (c) => c.day },
    { key: 'time', header: 'Time', render: (c) => c.time },
    { key: 'duration', header: 'Mins', align: 'right', render: (c) => c.duration_mins },
    { key: 'venue', header: 'Venue', render: (c) => venueName(c.venue_school_id) },
    {
      key: 'active',
      header: 'Status',
      render: (c) => (
        <StatusBadge label={c.active ? 'Active' : 'Hidden'} tone={c.active ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteRow(c)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="mt-6">
        <AdminSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Classes"
        description="The live class lineup. Edits here update booking, dashboard and admin screens without a deploy."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setBlueprintModalOpen(true)}>
              Add from blueprint
            </Button>
            <Button variant="primary" onClick={openCreate}>
              Add class
            </Button>
          </div>
        }
      />

      {error && <AdminBanner tone="error">{error}</AdminBanner>}

      <AdminCard>
        <DataTable
          columns={columns}
          rows={classes}
          rowKey={(c) => c.id}
          empty={{ title: 'No classes yet', description: 'Add your first class to get started.' }}
        />
      </AdminCard>


      <Modal
        open={editId !== null}
        onClose={closeModal}
        title={editId === 'new' ? 'Add class' : 'Edit class'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} loading={saving}>
              {editId === 'new' ? 'Create class' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Name">
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Baby Boogie"
            />
          </FormField>
          <FormField
            label="Slug"
            hint={
              editId === 'new'
                ? 'Lowercase letters, numbers and hyphens. Permanent key, cannot be changed later.'
                : 'Permanent key, cannot be changed.'
            }
          >
            <Input
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="baby-boogie"
              disabled={editId !== 'new'}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ages (label)">
              <Input
                value={form.ages}
                onChange={(e) => setField('ages', e.target.value)}
                placeholder="2 to 4"
              />
            </FormField>
            <FormField label="Max age" hint="Used for age-up suggestions.">
              <Input
                type="number"
                value={form.ageMax}
                onChange={(e) => setField('ageMax', e.target.value)}
                placeholder="4"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Day">
              <Input
                value={form.day}
                onChange={(e) => setField('day', e.target.value)}
                placeholder="Thursday"
              />
            </FormField>
            <FormField label="Time (label)">
              <Input
                value={form.time}
                onChange={(e) => setField('time', e.target.value)}
                placeholder="3:45pm to 4:15pm"
              />
            </FormField>
          </div>
          <FormField label="Venue">
            <Select
              value={form.venueSchoolId}
              onChange={(e) => setField('venueSchoolId', e.target.value)}
            >
              <option value="">No venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Duration (mins)">
              <Input
                type="number"
                value={form.durationMins}
                onChange={(e) => setField('durationMins', e.target.value)}
              />
            </FormField>
            <FormField label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
              />
            </FormField>
            <FormField label="Status">
              <Select
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setField('active', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </Select>
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        open={blueprintModalOpen}
        onClose={() => {
          setBlueprintModalOpen(false)
          setBlueprintForm({ venueId: '', blueprintId: '' })
        }}
        title="Add class from blueprint"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlueprintModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveBlueprintClass} loading={blueprintSaving}>
              Create class
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Venue *">
            <Select
              value={blueprintForm.venueId}
              onChange={(e) => setBlueprintForm({ ...blueprintForm, venueId: e.target.value })}
            >
              <option value="">Select a venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Blueprint *">
            <Select
              value={blueprintForm.blueprintId}
              onChange={(e) => setBlueprintForm({ ...blueprintForm, blueprintId: e.target.value })}
            >
              <option value="">Select a blueprint</option>
              {blueprints.filter((b) => b.active).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteRow !== null}
        title="Delete class?"
        message={
          deleteRow
            ? `Permanently delete "${deleteRow.name}". Existing bookings keep their class_type but the class disappears from pickers and displays. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete class"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  )
}
