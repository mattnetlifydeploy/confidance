'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { DbClass } from '@/lib/classes'
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
    sortOrder: String(c.sort_order),
    active: c.active,
  }
}

export default function ClassesPage() {
  const toast = useToast()
  const [classes, setClasses] = useState<DbClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null) // null = closed, 'new' = create
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteRow, setDeleteRow] = useState<DbClass | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      const res = await fetch('/api/admin/classes', { headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load classes')
      }
      const data = await res.json()
      setClasses((data.classes ?? []) as DbClass[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    load()
  }, [load])

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
          <Button variant="primary" onClick={openCreate}>
            Add class
          </Button>
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

      <AdminCard>
        <h3 className="font-heading text-base font-bold text-charcoal">Venue</h3>
        <p className="mt-2 text-sm text-charcoal-light">
          The venue shown on booking and confirmation screens is the default active venue,
          managed under <span className="font-600">Schools</span>. New classes inherit it.
        </p>
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
