import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const signWaiverSchema = z.object({
  waiverId: z.string().uuid(),
  signatureText: z.string().min(2).max(120),
  childId: z.string().uuid().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = signWaiverSchema.parse(body)

    const { data, error } = await supabase
      .from('waiver_signatures')
      .insert({
        waiver_id: validated.waiverId,
        parent_id: user.id,
        child_id: validated.childId ?? null,
        signature_text: validated.signatureText,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to sign waiver: ${error.message}` },
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
