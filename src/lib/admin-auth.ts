import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

type AdminAuthOk = { ok: true; userId: string }
type AdminAuthFail = { ok: false; status: 401 | 403; error: string }
type AdminAuthResult = AdminAuthOk | AdminAuthFail

export async function requireAdmin(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return { ok: false, status: 401, error: 'Missing authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')

  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  return { ok: true, userId: user.id }
}
