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

const waiveSchema = z.object({
  title: z.string().min(1).max(200),
  bodyMd: z.string().min(1).max(20000),
  publishedAt: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validated = waiveSchema.parse(body)

    const { data, error } = await supabase
      .from('waivers')
      .insert({
        title: validated.title,
        body_md: validated.bodyMd,
        published_at: validated.publishedAt ?? new Date().toISOString(),
        created_by: auth.userId,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert waiver: ${error.message}` },
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
    const auth = await requireAdmin(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: waivers, error } = await supabase
      .from('waivers')
      .select('id, title, body_md, published_at, created_at')
      .order('published_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch waivers: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ waivers: waivers || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    )
  }
}
