'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
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

type DbBlueprint = {
  id: string
  slug: string
  name: string
  ages: string
  age_max: number
  default_day: string | null
  default_time: string | null
  default_duration_mins: number
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

type FormState = {
  slug: string
  name: string
  ages: string
  ageMax: string
  defaultDay: string
  defaultTime: string
  defaultDurationMins: string
  sortOrder: string
  active: boolean
}

const EMPTY_FORM: FormState = {
  slug: '',
  name: '',
  ages: '',
  ageMax: '',
  defaultDay: '',
  defaultTime: '',
  defaultDurationMins: '30',
  sortOrder: '0',
  active: true,
}

function toForm(b: DbBlueprint): FormState {
  return {
    slug: b.slug,
    name: b.name,
    ages: b.ages,
    ageMax: String(b.age_max),
    defaultDay: b.default_day ?? '',
    defaultTime: b.default_time ?? '',
    defaultDurationMins: String(b.default_duration_mins),
    sortOrder: String(b.sort_order),
    active: b.active,
  }
}

export default function ClassBlueprintsPage() {
  const toast = useToast()
  const [blueprints, setBlueprints] = useState<DbBlueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteRow, setDeleteRow] = useState<DbBlueprint | null>(null)
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
      const res = await fetch('/api/admin/class-blueprints', { headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load blueprints')
      }
      const data = await res.json()
      setBlueprints((data.blueprints ?? []) as DbBlueprint[])
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

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId('new')
  }

  const openEdit = (b: DbBlueprint) => {
    setForm(toForm(b))
    setEditId(b.id)
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

    if (!form.name.trim() || !form.slug.trim() || !form.ages.trim()) {
      toast.error('Name, slug and ages are required')
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
      defaultDay: form.defaultDay.trim() || null,
      defaultTime: form.defaultTime.trim() || null,
      defaultDurationMins: Number(form.defaultDurationMins) || 30,
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
    }
    if (isNew) body.slug = form.slug.trim()

    try {
      setSaving(true)
      const headers = await authHeaders()
      const res = await fetch(
        isNew ? '/api/admin/class-blueprints' : `/api/admin/class-blueprints/${editId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers,
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save blueprint')
      }
      toast.success(isNew ? 'Blueprint created' : 'Blueprint updated')
      closeModal()
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save blueprint')
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteRow) return
    try {
      setDeleting(true)
      const headers = await authHeaders()
      const res = await fetch(`/api/admin/class-blueprints/${deleteRow.id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete blueprint')
      }
      toast.success('Blueprint deleted')
      setDeleteRow(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete blueprint')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Array<Column<DbBlueprint>> = [
    {
      key: 'name',
      header: 'Blueprint',
      render: (b) => (
        <div>
          <div className="font-heading font-semibold text-charcoal">{b.name}</div>
          <div className="font-mono text-xs text-charcoal-light">{b.slug}</div>
        </div>
      ),
    },
    { key: 'ages', header: 'Ages', render: (b) => b.ages },
    { key: 'default_day', header: 'Default day', render: (b) => b.default_day ?? '.' },
    { key: 'default_time', header: 'Default time', render: (b) => b.default_time ?? '.' },
    { key: 'duration', header: 'Mins', align: 'right', render: (b) => b.default_duration_mins },
    {
      key: 'active',
      header: 'Status',
      render: (b) => (
        <StatusBadge label={b.active ? 'Active' : 'Hidden'} tone={b.active ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(b)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteRow(b)}>
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
        eyebrow="Setup"
        title="Class Blueprints"
        description="Reusable class templates. Stamping a blueprint onto a venue creates a fresh, fully editable class (a snapshot copy). Editing a blueprint here does NOT change classes already created from it."
        actions={
          <Button variant="primary" onClick={openCreate}>
            Add blueprint
          </Button>
        }
      />

      {error && <AdminBanner tone="error">{error}</AdminBanner>}

      <AdminCard>
        <DataTable
          columns={columns}
          rows={blueprints}
          rowKey={(b) => b.id}
          empty={{ title: 'No blueprints yet', description: 'Add a reusable class template to get started.' }}
        />
      </AdminCard>

      <Modal
        open={editId !== null}
        onClose={closeModal}
        title={editId === 'new' ? 'Add blueprint' : 'Edit blueprint'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} loading={saving}>
              {editId === 'new' ? 'Create blueprint' : 'Save changes'}
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
                ? 'Lowercase letters, numbers and hyphens. Permanent key.'
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
            <FormField label="Default day">
              <Input
                value={form.defaultDay}
                onChange={(e) => setField('defaultDay', e.target.value)}
                placeholder="Thursday"
              />
            </FormField>
            <FormField label="Default time (label)">
              <Input
                value={form.defaultTime}
                onChange={(e) => setField('defaultTime', e.target.value)}
                placeholder="3:45pm to 4:15pm"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Duration (mins)">
              <Input
                type="number"
                value={form.defaultDurationMins}
                onChange={(e) => setField('defaultDurationMins', e.target.value)}
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
        title="Delete blueprint?"
        message={
          deleteRow
            ? `Permanently delete "${deleteRow.name}". Classes already created from it are NOT affected (their link is just cleared). This cannot be undone.`
            : ''
        }
        confirmLabel="Delete blueprint"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  )
}
