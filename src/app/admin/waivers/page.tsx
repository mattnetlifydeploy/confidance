'use client'

import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { getSupabase } from '@/lib/supabase'
import {
  AdminCard,
  AdminPageHeader,
  Button,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Textarea,
  EmptyState,
  AdminSpinner,
  useToast,
} from '@/components/admin'

type WaiverRow = {
  id: string
  title: string
  body_md: string
  published_at: string
  created_at: string
}

const EMPTY_FORM = { title: '', bodyMd: '', publishedAt: '' }

// ISO -> value for <input type="datetime-local">
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatPublished(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function WaiversPage() {
  const toast = useToast()

  const [waivers, setWaivers] = useState<WaiverRow[]>([])
  const [waiversLoading, setWaiversLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const [viewing, setViewing] = useState<WaiverRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WaiverRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchWaivers = async () => {
    setWaiversLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch('/api/admin/waivers', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setWaivers(data.waivers || [])
      }
    } catch {
      // Silent fail by design
    } finally {
      setWaiversLoading(false)
    }
  }

  useEffect(() => {
    fetchWaivers()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (waiver: WaiverRow) => {
    setEditingId(waiver.id)
    setForm({
      title: waiver.title,
      bodyMd: waiver.body_md,
      publishedAt: waiver.published_at ? toLocalInput(waiver.published_at) : '',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.bodyMd.trim()) {
      toast.error('Title and body required')
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const publishedAt = form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : undefined

      const url = editingId ? `/api/admin/waivers/${editingId}` : '/api/admin/waivers'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: form.title, bodyMd: form.bodyMd, publishedAt }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save waiver')
      }

      toast.success(editingId ? 'Waiver updated' : 'Waiver published')
      closeForm()
      await fetchWaivers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save waiver')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch(`/api/admin/waivers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete waiver')
      }

      toast.success('Waiver deleted')
      setDeleteTarget(null)
      await fetchWaivers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete waiver')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Waivers"
        description="Create and manage the waivers parents must sign"
        actions={<Button onClick={openCreate}>Publish waiver</Button>}
      />

      <AdminCard>
        <h3 className="font-heading text-lg font-bold text-navy">Published waivers</h3>

        {waiversLoading ? (
          <div className="flex justify-center py-10">
            <AdminSpinner />
          </div>
        ) : waivers.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No waivers yet"
              description="Publish a waiver to make it available for parents to sign."
              action={<Button onClick={openCreate}>Publish waiver</Button>}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {waivers.map((waiver) => (
              <div
                key={waiver.id}
                className="flex flex-col gap-3 rounded-2xl border border-charcoal/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 className="font-heading text-sm font-bold text-navy">{waiver.title}</h4>
                  <p className="mt-1 text-xs text-charcoal/60">
                    Published {formatPublished(waiver.published_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setViewing(waiver)}>
                    View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(waiver)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(waiver)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? 'Edit waiver' : 'Publish waiver'}
      >
        <div className="space-y-4">
          <FormField label="Title">
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Waiver title (max 200 characters)"
              maxLength={200}
            />
          </FormField>

          <FormField label="Body (Markdown)" hint="Supports Markdown. Max 20,000 characters.">
            <Textarea
              value={form.bodyMd}
              onChange={(e) => setForm({ ...form, bodyMd: e.target.value })}
              placeholder="Waiver body in Markdown"
              maxLength={20000}
              rows={10}
              className="font-mono"
            />
          </FormField>

          <FormField
            label="Publish date (optional)"
            hint="Leave empty to publish immediately."
          >
            <Input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} loading={submitting}>
              {editingId ? 'Save changes' : 'Publish waiver'}
            </Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View modal: rendered Markdown */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        size="xl"
      >
        {viewing && (
          <>
            <p className="mb-4 text-xs text-charcoal/60">
              Published {formatPublished(viewing.published_at)}
            </p>
            <div
              className="waiver-body space-y-3 text-sm leading-relaxed text-charcoal/80"
              dangerouslySetInnerHTML={{ __html: marked.parse(viewing.body_md) as string }}
            />
          </>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete waiver"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
