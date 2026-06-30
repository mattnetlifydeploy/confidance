// Server-only data access for the class blueprints (reusable templates) layer.
// Uses an untyped service-role client (class_blueprints not in database.types.ts),
// mirroring classes.ts / schools.ts. Never import from a client component:
// blueprints are admin-internal (no public read) and reached only via the admin
// API at /api/admin/class-blueprints.
//
// SNAPSHOT model: stamping a blueprint onto a venue COPIES its values into a fresh
// class row (see createClassFromBlueprint in classes.ts). Later blueprint edits do
// NOT cascade to existing classes; classes.blueprint_id is provenance only.

import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type DbBlueprint = {
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

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  client = createClient(url, key)
  return client
}

// ─── Reads (admin only) ───

// Every blueprint incl. inactive, for the admin library list.
export async function getAllBlueprints(): Promise<DbBlueprint[]> {
  const { data, error } = await db()
    .from('class_blueprints')
    .select('*')
    .order('active', { ascending: false })
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to load blueprints: ${error.message}`)
  return (data ?? []) as DbBlueprint[]
}

// Active blueprints only, for the "Add from blueprint" picker on a venue.
export async function getActiveBlueprints(): Promise<DbBlueprint[]> {
  const { data, error } = await db()
    .from('class_blueprints')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to load blueprints: ${error.message}`)
  return (data ?? []) as DbBlueprint[]
}

export async function getBlueprintById(id: string): Promise<DbBlueprint | null> {
  const { data, error } = await db()
    .from('class_blueprints')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Failed to load blueprint: ${error.message}`)
  return (data as DbBlueprint | null) ?? null
}

// ─── Writes (admin only, service-role) ───

export type BlueprintInput = {
  slug: string
  name: string
  ages: string
  ageMax: number
  defaultDay?: string | null
  defaultTime?: string | null
  defaultDurationMins?: number
  sortOrder?: number
  active?: boolean
}

export async function createBlueprint(input: BlueprintInput): Promise<DbBlueprint> {
  const { data, error } = await db()
    .from('class_blueprints')
    .insert({
      slug: input.slug,
      name: input.name,
      ages: input.ages,
      age_max: input.ageMax,
      default_day: input.defaultDay ?? null,
      default_time: input.defaultTime ?? null,
      default_duration_mins: input.defaultDurationMins ?? 30,
      sort_order: input.sortOrder ?? 0,
      active: input.active ?? true,
    })
    .select('*')
    .single()
  if (error) throw new Error(`Failed to create blueprint: ${error.message}`)
  return data as DbBlueprint
}

export async function updateBlueprint(
  id: string,
  patch: Partial<BlueprintInput>,
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.slug !== undefined) row.slug = patch.slug
  if (patch.name !== undefined) row.name = patch.name
  if (patch.ages !== undefined) row.ages = patch.ages
  if (patch.ageMax !== undefined) row.age_max = patch.ageMax
  if (patch.defaultDay !== undefined) row.default_day = patch.defaultDay
  if (patch.defaultTime !== undefined) row.default_time = patch.defaultTime
  if (patch.defaultDurationMins !== undefined)
    row.default_duration_mins = patch.defaultDurationMins
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder
  if (patch.active !== undefined) row.active = patch.active
  const { error } = await db().from('class_blueprints').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update blueprint: ${error.message}`)
}

// Deleting a blueprint sets classes.blueprint_id to NULL (FK on delete set null):
// existing snapshot classes are unaffected, only the provenance link is dropped.
export async function deleteBlueprint(id: string): Promise<void> {
  const { error } = await db().from('class_blueprints').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete blueprint: ${error.message}`)
}
