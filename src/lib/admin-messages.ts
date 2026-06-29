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

export type LogAdminMessageEntry = {
  sentBy: string | null
  channel: 'email' | 'banner'
  audience: unknown
  subject: string | null
  body: string | null
  recipientCount: number | null
  resendId: string | null
}

export function buildInitialDeliveryStatus(): Record<string, unknown> {
  return {}
}

export function mergeDeliveryStatus(
  current: Record<string, unknown>,
  eventType: string,
  timestamp: string,
): Record<string, unknown> {
  return {
    ...current,
    [eventType]: timestamp,
  }
}

export async function logAdminMessage(
  entry: LogAdminMessageEntry,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('admin_messages_log')
      .insert({
        sent_by: entry.sentBy,
        channel: entry.channel,
        audience: entry.audience as Record<string, unknown>,
        subject: entry.subject,
        body: entry.body,
        recipient_count: entry.recipientCount,
        resend_id: entry.resendId,
        delivery_status: buildInitialDeliveryStatus(),
      })
      .select('id')
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: errorMsg }
  }
}
