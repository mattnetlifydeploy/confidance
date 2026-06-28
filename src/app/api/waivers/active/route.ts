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
      return NextResponse.json({ waiver: null, signed: true })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ waiver: null, signed: true })
    }

    const parentId = user.id
    const now = new Date().toISOString()

    // Find the latest active waiver
    const { data: waiversData, error: waiversError } = await supabase
      .from('waivers')
      .select('id, title, body_md, published_at')
      .lte('published_at', now)
      .order('published_at', { ascending: false })
      .limit(1)

    if (waiversError || !waiversData || waiversData.length === 0) {
      return NextResponse.json({ waiver: null, signed: true })
    }

    const activeWaiver = waiversData[0]

    // Check if parent has signed this waiver
    const { data: signature, error: sigError } = await supabase
      .from('waiver_signatures')
      .select('id')
      .eq('waiver_id', activeWaiver.id)
      .eq('parent_id', parentId)
      .limit(1)
      .maybeSingle()

    if (sigError) {
      return NextResponse.json({ waiver: null, signed: true })
    }

    return NextResponse.json({
      waiver: {
        id: activeWaiver.id,
        title: activeWaiver.title,
        body_md: activeWaiver.body_md,
        published_at: activeWaiver.published_at,
      },
      signed: !!signature,
    })
  } catch {
    return NextResponse.json({ waiver: null, signed: true })
  }
}
