// Server-only data access for the schools (venue) layer.
// Uses an untyped service-role client (new tables not yet in database.types.ts),
// matching the existing admin route pattern. Never import from a client component.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { School, SchoolEnquiry, EnquiryStatus } from './schools-schema'
import { ENQUIRY_STATUSES } from './schools-schema'

export { ENQUIRY_STATUSES }

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  client = createClient(url, key)
  return client
}

// ─── Schools ───

export async function getActiveSchools(): Promise<School[]> {
  const { data, error } = await db()
    .from('schools')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })
  if (error) throw new Error(`Failed to load schools: ${error.message}`)
  return (data ?? []) as School[]
}

export async function getAllSchools(): Promise<School[]> {
  const { data, error } = await db()
    .from('schools')
    .select('*')
    .order('active', { ascending: false })
    .order('name', { ascending: true })
  if (error) throw new Error(`Failed to load schools: ${error.message}`)
  return (data ?? []) as School[]
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const { data, error } = await db()
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Failed to load school: ${error.message}`)
  return (data as School | null) ?? null
}

export async function getSchoolById(id: string): Promise<School | null> {
  const { data, error } = await db()
    .from('schools')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Failed to load school: ${error.message}`)
  return (data as School | null) ?? null
}

export type SchoolInput = {
  name: string
  slug: string
  address?: string | null
  postcode?: string | null
  area?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  schoolType?: string | null
  active?: boolean
  notes?: string | null
}

export async function createSchool(input: SchoolInput): Promise<School> {
  const { data, error } = await db()
    .from('schools')
    .insert({
      name: input.name,
      slug: input.slug,
      address: input.address ?? null,
      postcode: input.postcode ?? null,
      area: input.area ?? null,
      contact_name: input.contactName ?? null,
      contact_email: input.contactEmail ?? null,
      contact_phone: input.contactPhone ?? null,
      school_type: input.schoolType ?? null,
      active: input.active ?? false,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()
  if (error) throw new Error(`Failed to create school: ${error.message}`)
  return data as School
}

export async function updateSchool(
  id: string,
  patch: Partial<SchoolInput>,
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.name !== undefined) row.name = patch.name
  if (patch.slug !== undefined) row.slug = patch.slug
  if (patch.address !== undefined) row.address = patch.address
  if (patch.postcode !== undefined) row.postcode = patch.postcode
  if (patch.area !== undefined) row.area = patch.area
  if (patch.contactName !== undefined) row.contact_name = patch.contactName
  if (patch.contactEmail !== undefined) row.contact_email = patch.contactEmail
  if (patch.contactPhone !== undefined) row.contact_phone = patch.contactPhone
  if (patch.schoolType !== undefined) row.school_type = patch.schoolType
  if (patch.active !== undefined) row.active = patch.active
  if (patch.notes !== undefined) row.notes = patch.notes
  const { error } = await db().from('schools').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update school: ${error.message}`)
}

// ─── Enquiries ───

export type CreateEnquiry = {
  schoolName: string
  schoolType?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  estimatedStudents?: number
  preferredDaysTimes?: string
  notes?: string
}

export async function createEnquiry(input: CreateEnquiry): Promise<{ id: string }> {
  const { data, error } = await db()
    .from('school_enquiries')
    .insert({
      school_name: input.schoolName,
      school_type: input.schoolType ?? null,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone ?? null,
      estimated_students: input.estimatedStudents ?? null,
      preferred_days_times: input.preferredDaysTimes ?? null,
      notes: input.notes ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to save enquiry: ${error.message}`)
  return { id: (data as { id: string }).id }
}

export async function getEnquiries(status?: EnquiryStatus): Promise<SchoolEnquiry[]> {
  let q = db().from('school_enquiries').select('*')
  if (status) q = q.eq('status', status)
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load enquiries: ${error.message}`)
  return (data ?? []) as SchoolEnquiry[]
}

export async function updateEnquiry(
  id: string,
  patch: { status?: EnquiryStatus; adminNotes?: string | null },
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status !== undefined) row.status = patch.status
  if (patch.adminNotes !== undefined) row.admin_notes = patch.adminNotes
  const { error } = await db().from('school_enquiries').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update enquiry: ${error.message}`)
}
