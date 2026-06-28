import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ entries: [] })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ entries: [] })
    }

    const parentId = user.id
    const now = new Date().toISOString()

    // Get all published waivers
    const { data: waivers, error: waiversError } = await supabase
      .from('waivers')
      .select('id, title, body_md, published_at')
      .lte('published_at', now)
      .order('published_at', { ascending: false })

    if (waiversError || !waivers) {
      return NextResponse.json({ entries: [] })
    }

    // For each waiver, check if signed
    const entries = await Promise.all(
      waivers.map(async (waiver) => {
        const { data: signature } = await supabase
          .from('waiver_signatures')
          .select('signed_at')
          .eq('waiver_id', waiver.id)
          .eq('parent_id', parentId)
          .order('signed_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        return {
          waiver: {
            id: waiver.id,
            title: waiver.title,
            body_md: waiver.body_md,
            published_at: waiver.published_at,
          },
          signed: !!signature,
          signedAt: signature?.signed_at ?? null,
        }
      }),
    )

    return NextResponse.json({ entries })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}
