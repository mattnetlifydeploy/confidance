import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let supabase: SupabaseClient<Database> | null = null

function getSupabase(): SupabaseClient<Database> {
  if (supabase) {
    return supabase
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
  return supabase
}

export async function auditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  payload: Record<string, unknown> = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const client = getSupabase()
    const { error } = await client
      .from('admin_audit_log')
      .insert({
        actor_id: actorId,
        action,
        target_type: targetType,
        target_id: targetId,
        payload,
      })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: errorMsg }
  }
}
