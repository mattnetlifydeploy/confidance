// Server-only data access for the classes (+ venue) layer.
// Uses an untyped service-role client (classes not yet in database.types.ts),
// matching the schools.ts / admin route pattern. Never import from a client
// component: client code reads classes via GET /api/classes (see use-classes.ts).
//
// constants.ts CLASSES + VENUE remain the seed source AND the runtime fallback,
// so a DB read failure or an empty table degrades to identical day-one behaviour.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CLASSES, VENUE } from './constants'

export type ClassInfo = {
  name: string
  ages: string
  ageMax: number
  day: string
  time: string
  durationMins: number
}

export type ClassMap = Record<string, ClassInfo>

export type Venue = {
  name: string
  address: string
}

export type DbClass = {
  id: string
  slug: string
  name: string
  ages: string
  age_max: number
  day: string
  time: string
  duration_mins: number
  venue_school_id: string | null
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  client = createClient(url, key)
  return client
}

function rowToInfo(row: DbClass): ClassInfo {
  return {
    name: row.name,
    ages: row.ages,
    ageMax: row.age_max,
    day: row.day,
    time: row.time,
    durationMins: row.duration_mins,
  }
}

// ─── Reads (with constants fallback) ───

// Active classes keyed by slug, shaped exactly like the CLASSES constant.
// Falls back to constants on any error or empty result.
export async function getClassesMap(): Promise<ClassMap> {
  try {
    const { data, error } = await db()
      .from('classes')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return { ...CLASSES }
    const map: ClassMap = {}
    for (const row of data as DbClass[]) map[row.slug] = rowToInfo(row)
    return map
  } catch {
    return { ...CLASSES }
  }
}

// Every class incl. inactive, for the admin CRUD list. No fallback (admin only).
export async function getAllClasses(): Promise<DbClass[]> {
  const { data, error } = await db()
    .from('classes')
    .select('*')
    .order('active', { ascending: false })
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to load classes: ${error.message}`)
  return (data ?? []) as DbClass[]
}

export async function getClassById(id: string): Promise<DbClass | null> {
  const { data, error } = await db()
    .from('classes')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Failed to load class: ${error.message}`)
  return (data as DbClass | null) ?? null
}

export async function getClassBySlug(slug: string): Promise<DbClass | null> {
  const { data, error } = await db()
    .from('classes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Failed to load class: ${error.message}`)
  return (data as DbClass | null) ?? null
}

// Default venue: the seeded Grove school, else the first active school,
// composed into a single display address. Falls back to the VENUE constant.
export async function getVenue(): Promise<Venue> {
  try {
    const grove = await db()
      .from('schools')
      .select('name, address, postcode')
      .eq('slug', 'grove-neighbourhood-centre')
      .maybeSingle()
    const row =
      (grove.data as { name: string; address: string | null; postcode: string | null } | null) ??
      (
        await db()
          .from('schools')
          .select('name, address, postcode')
          .eq('active', true)
          .order('name', { ascending: true })
          .limit(1)
          .maybeSingle()
      ).data as { name: string; address: string | null; postcode: string | null } | null
    if (!row) return { ...VENUE }
    const address = [row.address, row.postcode].filter(Boolean).join(', ')
    return { name: row.name, address: address || VENUE.address }
  } catch {
    return { ...VENUE }
  }
}

// ─── Writes (admin only, service-role) ───

export type ClassInput = {
  slug: string
  name: string
  ages: string
  ageMax: number
  day: string
  time: string
  durationMins?: number
  venueSchoolId?: string | null
  sortOrder?: number
  active?: boolean
}

export async function createClass(input: ClassInput): Promise<DbClass> {
  const { data, error } = await db()
    .from('classes')
    .insert({
      slug: input.slug,
      name: input.name,
      ages: input.ages,
      age_max: input.ageMax,
      day: input.day,
      time: input.time,
      duration_mins: input.durationMins ?? 30,
      venue_school_id: input.venueSchoolId ?? null,
      sort_order: input.sortOrder ?? 0,
      active: input.active ?? true,
    })
    .select('*')
    .single()
  if (error) throw new Error(`Failed to create class: ${error.message}`)
  return data as DbClass
}

export async function updateClass(
  id: string,
  patch: Partial<ClassInput>,
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.slug !== undefined) row.slug = patch.slug
  if (patch.name !== undefined) row.name = patch.name
  if (patch.ages !== undefined) row.ages = patch.ages
  if (patch.ageMax !== undefined) row.age_max = patch.ageMax
  if (patch.day !== undefined) row.day = patch.day
  if (patch.time !== undefined) row.time = patch.time
  if (patch.durationMins !== undefined) row.duration_mins = patch.durationMins
  if (patch.venueSchoolId !== undefined) row.venue_school_id = patch.venueSchoolId
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder
  if (patch.active !== undefined) row.active = patch.active
  const { error } = await db().from('classes').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update class: ${error.message}`)
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await db().from('classes').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete class: ${error.message}`)
}
