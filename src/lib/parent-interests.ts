// Server-only data access for the parent interest (register-interest) inbox.
// Uses an untyped service-role client (new table not yet in database.types.ts),
// matching the schools.ts pattern. Never import from a client component.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  ParentInterest,
  ParentInterestStatus,
} from './parent-interests-schema'
import { PARENT_INTEREST_STATUSES } from './parent-interests-schema'

export { PARENT_INTEREST_STATUSES }

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  client = createClient(url, key)
  return client
}

export type CreateParentInterest = {
  parentName: string
  parentEmail: string
  parentPhone?: string
  childYearGroup?: string
  preferredSchool?: string
  postcode?: string
  message?: string
}

export async function createParentInterest(
  input: CreateParentInterest,
): Promise<{ id: string }> {
  const { data, error } = await db()
    .from('parent_interests')
    .insert({
      parent_name: input.parentName,
      parent_email: input.parentEmail,
      parent_phone: input.parentPhone ?? null,
      child_year_group: input.childYearGroup ?? null,
      preferred_school: input.preferredSchool ?? null,
      postcode: input.postcode ?? null,
      message: input.message ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to save interest: ${error.message}`)
  return { id: (data as { id: string }).id }
}

export async function getParentInterests(
  status?: ParentInterestStatus,
): Promise<ParentInterest[]> {
  let q = db().from('parent_interests').select('*')
  if (status) q = q.eq('status', status)
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load interests: ${error.message}`)
  return (data ?? []) as ParentInterest[]
}

export async function updateParentInterest(
  id: string,
  patch: { status?: ParentInterestStatus; adminNotes?: string | null },
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status !== undefined) row.status = patch.status
  if (patch.adminNotes !== undefined) row.admin_notes = patch.adminNotes
  const { error } = await db().from('parent_interests').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update interest: ${error.message}`)
}
