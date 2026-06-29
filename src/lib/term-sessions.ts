import { createClient } from '@supabase/supabase-js'
import { TERMS, getTermSessionDates, type TermDef } from './constants'
import type { Database } from './database.types'

/**
 * Pure function: returns sessionDates minus exclusionDates
 */
export function applyExclusions(sessionDates: string[], exclusionDates: string[]): string[] {
  const excludeSet = new Set(exclusionDates)
  return sessionDates.filter((date) => !excludeSet.has(date))
}

/**
 * Async helper: fetch exclusions from DB for a term and return filtered session dates
 *
 * Returns getTermSessionDates(term) minus the admin-managed exclusions for that term.
 * If exclusions or fetchFn are provided (for testing), use those instead of fetching from DB.
 *
 * Note: classType is accepted for spec signature but exclusions are term-wide (both classes share Thursday dates).
 * Per-class filtering may be added in a future iteration.
 */
export async function getTermSessions(
  term: TermDef,
  classType?: string,
  exclusions?: string[] | (() => Promise<string[]>),
): Promise<string[]> {
  const sessionDates = getTermSessionDates(term)

  let exclusionDates: string[]

  if (exclusions) {
    if (Array.isArray(exclusions)) {
      exclusionDates = exclusions
    } else {
      exclusionDates = await exclusions()
    }
  } else {
    exclusionDates = await fetchTermExclusions(term.name, term.year)
  }

  return applyExclusions(sessionDates, exclusionDates)
}

/**
 * Fetch term exclusions from the database
 */
export async function fetchTermExclusions(termName: string, termYear: number): Promise<string[]> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey)

  const { data, error } = await supabase
    .from('term_exclusions')
    .select('exclusion_date')
    .eq('term_name', termName)
    .eq('term_year', termYear)

  if (error) {
    throw new Error(`Failed to fetch term exclusions: ${error.message}`)
  }

  return (data as Array<{ exclusion_date: string }> | null || []).map((row) => row.exclusion_date)
}
