import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const bannerSchema = z.object({
  body: z.string().min(1).max(1000),
  audience: z.string().min(1).max(120),
  expiresAt: z.string().datetime().optional().nullable(),
})

type ParsedAudience =
  | { type: 'all' }
  | { type: 'class', classType: string }
  | { type: 'term', termName: string, termYear: number }

function parseAudience(audience: string): ParsedAudience | null {
  if (audience === 'all') {
    return { type: 'all' }
  }

  if (audience.startsWith('class:')) {
    const classType = audience.slice(6)
    return { type: 'class', classType }
  }

  if (audience.startsWith('term:')) {
    const termStr = audience.slice(5)
    const parts = termStr.split('-')
    if (parts.length < 2) return null
    const termYear = parseInt(parts[parts.length - 1])
    if (isNaN(termYear)) return null
    const termName = parts.slice(0, -1).join('-')
    return { type: 'term', termName, termYear }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = bannerSchema.parse(body)

    const parsed = parseAudience(validated.audience)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid audience' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('banners')
      .insert({
        body: validated.body,
        audience: validated.audience,
        expires_at: validated.expiresAt ?? null,
        created_by: auth.userId,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert banner: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || []
      const firstIssue = issues[0]
      const message = firstIssue ? firstIssue.message : 'Validation error'
      return NextResponse.json(
        { error: `Validation error: ${message}` },
        { status: 400 },
      )
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ banners: [] })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ banners: [] })
    }
    const parentId = user.id

    const now = new Date().toISOString()

    const { data: banners, error } = await supabase
      .from('banners')
      .select('id, body, audience, published_at, expires_at')
      .lte('published_at', now)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('published_at', { ascending: false })

    if (error) {
      return NextResponse.json({ banners: [] })
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('class_type, term_name, term_year')
      .eq('parent_id', parentId)
      .eq('status', 'confirmed')

    if (bookingsError || !bookings) {
      return NextResponse.json({ banners: [] })
    }

    const classTypes = new Set(bookings.map(b => b.class_type))
    const terms = new Set(
      bookings
        .filter(b => b.term_name && b.term_year)
        .map(b => `${b.term_name}-${b.term_year}`),
    )

    const filtered = (banners || []).filter(b => {
      if (b.audience === 'all') return true
      if (b.audience.startsWith('class:')) {
        const ct = b.audience.slice(6)
        return classTypes.has(ct)
      }
      if (b.audience.startsWith('term:')) {
        return terms.has(b.audience.slice(5))
      }
      return false
    })

    return NextResponse.json({ banners: filtered })
  } catch {
    return NextResponse.json({ banners: [] })
  }
}
